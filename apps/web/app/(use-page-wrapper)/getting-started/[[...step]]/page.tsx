import type { PageProps as ServerPageProps } from "app/_types";
import { _generateMetadata } from "app/_utils";
import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";

import { getServerSession } from "@calcom/features/auth/lib/getServerSession";
import { APP_NAME } from "@calcom/lib/constants";

import { buildLegacyRequest } from "@lib/buildLegacyCtx";

// Slotix: use the custom prototype onboarding regardless of the `onboarding-v3` flag,
// so this legacy route shows the same aurora-glass two-step screen as /onboarding/getting-started.
import SlotixOnboarding from "~/onboarding/getting-started/SlotixOnboarding";

export const generateMetadata = async ({ params }: ServerPageProps) => {
  const stepParam = (await params).step;
  const step = stepParam && Array.isArray(stepParam) ? stepParam.join("/") : "";
  return await _generateMetadata(
    (t) => `${APP_NAME} - ${t("getting_started")}`,
    () => "",
    true,
    undefined,
    `/getting-started${step ? `/${step}` : ""}`
  );
};

const ServerPage = async () => {
  const session = await getServerSession({ req: buildLegacyRequest(await headers(), await cookies()) });

  if (!session?.user?.id) {
    return redirect("/auth/login");
  }

  return <SlotixOnboarding />;
};

export default ServerPage;
