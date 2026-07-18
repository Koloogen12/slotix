"use client";

import { ErrorCode } from "@calcom/features/auth/lib/ErrorCode";
import { APP_NAME, HOSTED_CAL_FEATURES, WEBAPP_URL, WEBSITE_URL } from "@calcom/lib/constants";
import { emailRegex } from "@calcom/lib/emailSchema";
import { getSafeRedirectUrl } from "@calcom/lib/getSafeRedirectUrl";
import { useCompatSearchParams } from "@calcom/lib/hooks/useCompatSearchParams";
import { useLocale } from "@calcom/lib/hooks/useLocale";
import { Alert } from "@calcom/ui/components/alert";
import { Icon } from "@calcom/ui/components/icon";
import { LastUsed, useLastUsed } from "@calcom/web/modules/auth/hooks/useLastUsed";
import AddToHomescreen from "@components/AddToHomescreen";
import BackupCode from "@components/auth/BackupCode";
import TwoFactor from "@components/auth/TwoFactor";
import { Button } from "@coss/ui/components/button";
import { Field, FieldLabel } from "@coss/ui/components/field";
import { Input } from "@coss/ui/components/input";
import { InputGroup, InputGroupAddon, InputGroupInput } from "@coss/ui/components/input-group";
import { Separator } from "@coss/ui/components/separator";
import { zodResolver } from "@hookform/resolvers/zod";
import type { inferSSRProps } from "@lib/types/inferSSRProps";
import type { getServerSideProps } from "@server/lib/auth/login/getServerSideProps";
import { Eye, EyeOff } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { useEffect, useState } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { z } from "zod";

interface LoginValues {
  email: string;
  password: string;
  totpCode: string;
  backupCode: string;
  csrfToken: string;
}

const MicrosoftIcon = () => <img className="size-4" src="/microsoft-logo.svg" alt="" />;

const GoogleIcon = () => <img className="size-4" src="/google-icon-colored.svg" alt="" />;

// Matches the Yandex ID mark used in the landing page's login modal (LandingView.tsx)
// so the fallback page and the modal read as the same button.
const YandexIcon = () => (
  <svg className="size-4" viewBox="0 0 24 24" aria-hidden>
    <circle cx="12" cy="12" r="12" fill="#FC3F1D" />
    <path
      fill="#fff"
      d="M13.3 6.4h-1.5c-1.9 0-3.3 1.2-3.3 3 0 1.4.7 2.2 2 3.1L8 17.6h1.8l2-3.6h.9v3.6h1.6V6.4h-1zm-1 6.2h-.5c-1 0-1.7-.5-1.7-1.8 0-1.3.8-1.8 1.7-1.8h.5v3.6z"
    />
  </svg>
);

export type PageProps = inferSSRProps<typeof getServerSideProps>;
export default function Login({
  csrfToken,
  isGoogleLoginEnabled,
  isOutlookLoginEnabled,
  isYandexLoginEnabled,
  totpEmail,
}: PageProps) {
  const searchParams = useCompatSearchParams();
  const { t } = useLocale();
  const router = useRouter();
  const formSchema = z
    .object({
      email: z
        .string()
        .min(1, `${t("error_required_field")}`)
        .regex(emailRegex, `${t("enter_valid_email")}`),
      ...(totpEmail ? {} : { password: z.string().min(1, `${t("error_required_field")}`) }),
    })
    // Passthrough other fields like totpCode
    .passthrough();
  const methods = useForm<LoginValues>({ resolver: zodResolver(formSchema) });
  const { register, formState } = methods;
  const [twoFactorRequired, setTwoFactorRequired] = useState(!!totpEmail || false);
  const [twoFactorLostAccess, setTwoFactorLostAccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [lastUsed, setLastUsed] = useLastUsed();
  const [showPassword, setShowPassword] = useState(false);

  const errorMessages: { [key: string]: string } = {
    // [ErrorCode.SecondFactorRequired]: t("2fa_enabled_instructions"),
    // Don't leak information about whether an email is registered or not
    [ErrorCode.IncorrectEmailPassword]: t("incorrect_email_password"),
    [ErrorCode.IncorrectTwoFactorCode]: `${t("incorrect_2fa_code")} ${t("please_try_again")}`,
    [ErrorCode.InternalServerError]: `${t("something_went_wrong")} ${t("please_try_again_and_contact_us")}`,
    [ErrorCode.ThirdPartyIdentityProviderEnabled]: t("account_created_with_identity_provider"),
  };

  let callbackUrl = searchParams?.get("callbackUrl") || "";

  if (/"\//.test(callbackUrl)) callbackUrl = callbackUrl.substring(1);

  // If not absolute URL, make it absolute
  if (!/^https?:\/\//.test(callbackUrl)) {
    callbackUrl = `${WEBAPP_URL}/${callbackUrl}`;
  }

  const safeCallbackUrl = getSafeRedirectUrl(callbackUrl);

  callbackUrl = safeCallbackUrl || "";

  const onSubmit = async (values: LoginValues) => {
    setErrorMessage(null);
    // telemetry.event(telemetryEventTypes.login, collectPageParameters());
    const res = await signIn<"credentials">("credentials", {
      ...values,
      callbackUrl,
      redirect: false,
    });
    if (!res) setErrorMessage(errorMessages[ErrorCode.InternalServerError]);
    // we're logged in! let's do a hard refresh to the desired url
    else if (!res.error) {
      setLastUsed("credentials");
      router.push(callbackUrl);
    } else if (res.error === ErrorCode.SecondFactorRequired) setTwoFactorRequired(true);
    else if (res.error === ErrorCode.IncorrectBackupCode) setErrorMessage(t("incorrect_backup_code"));
    else if (res.error === ErrorCode.MissingBackupCodes) setErrorMessage(t("missing_backup_codes"));
    // fallback if error not found
    else setErrorMessage(errorMessages[res.error] || t("something_went_wrong"));
  };

  const showSocialLogin = isGoogleLoginEnabled || isOutlookLoginEnabled || isYandexLoginEnabled;
  const showSignupLink =
    process.env.NEXT_PUBLIC_DISABLE_SIGNUP !== "true" && searchParams?.get("register") !== "false";

  return (
    // Same aurora background as the landing/signup/onboarding pages (each sets it inline
    // rather than relying on a global body rule, since the aurora shouldn't bleed into the
    // authenticated dashboard/settings pages).
    <div
      className="flex min-h-screen items-center justify-center px-4 py-10"
      style={{ background: "#eaf2fb url(/slotix/aurora-bg.png) center / cover no-repeat fixed" }}>
      <div className="flex w-full max-w-md flex-col items-center">
        {/* Main Card — bg-default + border-subtle is turned into a glass surface globally, see packages/coss-ui/src/styles/globals.css */}
        <div className="w-full rounded-2xl border border-subtle bg-default p-10">
          {/* Logo */}
          <div className="mb-2 text-center">
            <h1 className="font-cal text-xl font-bold text-emphasis">{APP_NAME}</h1>
          </div>

          {/* Heading */}
          <p className="mb-8 text-center text-sm text-subtle" data-testid="login-subtitle">
            {twoFactorRequired ? t("2fa_code") : t("welcome_back_sign_in")}
          </p>

          <FormProvider {...methods}>
            {/* Social Login Buttons */}
            {!twoFactorRequired && showSocialLogin && (
              <>
                <div className="flex flex-col gap-2">
                  {isGoogleLoginEnabled && (
                    <Button
                      variant="outline"
                      className="w-full py-1"
                      disabled={formState.isSubmitting}
                      data-testid="google"
                      onClick={async (e) => {
                        e.preventDefault();
                        setLastUsed("google");
                        await signIn("google", {
                          callbackUrl,
                        });
                      }}>
                      <GoogleIcon />
                      <span>{t("signin_with_google")}</span>
                      {lastUsed === "google" && <LastUsed />}
                    </Button>
                  )}
                  {isYandexLoginEnabled && (
                    <Button
                      variant="outline"
                      className="w-full py-1"
                      disabled={formState.isSubmitting}
                      data-testid="yandex"
                      onClick={async (e) => {
                        e.preventDefault();
                        setLastUsed("yandex");
                        await signIn("yandex", {
                          callbackUrl,
                        });
                      }}>
                      <YandexIcon />
                      <span>{t("signin_with_yandex")}</span>
                      {lastUsed === "yandex" && <LastUsed />}
                    </Button>
                  )}
                  {isOutlookLoginEnabled && (
                    <Button
                      variant="outline"
                      className="w-full py-1"
                      data-testid="microsoft"
                      onClick={async (e) => {
                        e.preventDefault();
                        setLastUsed("microsoft");
                        await signIn("azure-ad", {
                          callbackUrl,
                        });
                      }}>
                      <MicrosoftIcon />
                      <span>{t("signin_with_microsoft")}</span>
                      {lastUsed === "microsoft" && <LastUsed />}
                    </Button>
                  )}
                </div>

                {/* Divider */}
                <div className="my-6 flex items-center gap-4">
                  <Separator className="flex-1" />
                  <span className="text-sm text-zinc-400">{t("or").toLowerCase()}</span>
                  <Separator className="flex-1" />
                </div>
              </>
            )}

            <form onSubmit={methods.handleSubmit(onSubmit)} noValidate data-testid="login-form">
              <input defaultValue={csrfToken || undefined} type="hidden" hidden {...register("csrfToken")} />

              {!twoFactorRequired && (
                <div className="space-y-6">
                  {/* Email Field */}
                  <Field>
                    <FieldLabel>{t("email")}</FieldLabel>
                    <Input
                      id="email"
                      type="email"
                      defaultValue={totpEmail || (searchParams?.get("email") as string)}
                      autoComplete="email"
                      {...register("email")}
                    />
                    {formState.errors.email && (
                      <p data-testid="field-error" className="text-destructive text-xs">
                        {formState.errors.email.message}
                      </p>
                    )}
                  </Field>

                  {/* Password Field */}
                  <Field>
                    <div className="flex w-full items-center justify-between">
                      <FieldLabel>{t("password")}</FieldLabel>
                      <Link href="/auth/forgot-password" className="text-sm text-subtle hover:text-emphasis">
                        {t("forgot")}
                      </Link>
                    </div>
                    <InputGroup className="overflow-hidden">
                      <InputGroupInput
                        id="password"
                        type={showPassword ? "text" : "password"}
                        autoComplete="current-password"
                        {...register("password")}
                      />
                      <InputGroupAddon align="inline-end">
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon-xs"
                          onClick={() => setShowPassword(!showPassword)}
                          aria-label={showPassword ? t("hide_password") : t("show_password")}>
                          {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                        </Button>
                      </InputGroupAddon>
                    </InputGroup>
                    {formState.errors.password && (
                      <p data-testid="field-error" className="text-destructive text-xs">
                        {formState.errors.password.message}
                      </p>
                    )}
                  </Field>
                </div>
              )}

              {/* Two Factor */}
              {twoFactorRequired && (
                <div className="space-y-4">
                  {!twoFactorLostAccess ? <TwoFactor center /> : <BackupCode center />}
                </div>
              )}

              {/* Error Message */}
              {errorMessage && <Alert severity="error" title={errorMessage} className="mt-4" />}

              {/* Submit Button */}
              <Button
                type="submit"
                variant="outline"
                className="mt-8 w-full"
                disabled={formState.isSubmitting}>
                {twoFactorRequired ? t("submit") : t("continue")}
              </Button>
            </form>

            {/* Two Factor Footer */}
            {twoFactorRequired && (
              <div className="mt-4 flex justify-center gap-4">
                {!totpEmail ? (
                  <>
                    <Button
                      variant="ghost"
                      onClick={() => {
                        if (twoFactorLostAccess) {
                          setTwoFactorLostAccess(false);
                          methods.setValue("backupCode", "");
                        } else {
                          setTwoFactorRequired(false);
                          methods.setValue("totpCode", "");
                        }
                        setErrorMessage(null);
                      }}>
                      <Icon name="arrow-left" className="mr-2 size-4" />
                      {t("go_back")}
                    </Button>
                    {!twoFactorLostAccess && (
                      <Button
                        variant="ghost"
                        onClick={() => {
                          setTwoFactorLostAccess(true);
                          setErrorMessage(null);
                          methods.setValue("totpCode", "");
                        }}>
                        <Icon name="lock" className="mr-2 size-4" />
                        {t("lost_access")}
                      </Button>
                    )}
                  </>
                ) : (
                  <Button
                    variant="ghost"
                    onClick={() => {
                      window.location.replace("/");
                    }}>
                    {t("cancel")}
                  </Button>
                )}
              </div>
            )}
          </FormProvider>
        </div>

        {/* Footer Links */}
        {!twoFactorRequired && (
          <div className="mt-6 flex items-center justify-center gap-4 text-center">
            {showSignupLink && (
              <Link
                href={
                  callbackUrl
                    ? `${WEBSITE_URL}/signup?redirect=${encodeURIComponent(callbackUrl)}`
                    : `${WEBSITE_URL}/signup`
                }
                className="text-sm font-medium text-emphasis hover:underline">
                {t("create_account")}
              </Link>
            )}
          </div>
        )}
      </div>

      <AddToHomescreen />
    </div>
  );
}
