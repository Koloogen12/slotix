"use client";

// Slotix onboarding — reproduces design_handoff_slotix/"Slotix - Онбординг" prototype:
// one page, two glass step-cards (profile + slug, then Google), wired to real Cal.diy data.
import useAddAppMutation from "@calcom/app-store/_utils/useAddAppMutation";
import { useTimePreferences } from "@calcom/features/bookings/lib";
import { fetchUsername } from "@calcom/lib/fetchUsername";
import { useDebounce } from "@calcom/lib/hooks/useDebounce";
import { trpc } from "@calcom/trpc/react";
import { ImageUploader } from "@calcom/ui/components/image-uploader";
import { showToast } from "@calcom/ui/components/toast";
import { TimezoneSelect } from "@calcom/web/modules/timezone/components/TimezoneSelect";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

const glassCard: React.CSSProperties = {
  background: "rgba(255,255,255,.66)",
  backdropFilter: "blur(28px) saturate(1.4)",
  WebkitBackdropFilter: "blur(28px) saturate(1.4)",
  border: "1px solid rgba(255,255,255,.6)",
  boxShadow: "0 14px 38px rgba(20,40,70,.08)",
  borderRadius: 22,
  padding: 26,
  marginBottom: 16,
};
const inputStyle: React.CSSProperties = {
  width: "100%",
  boxSizing: "border-box",
  padding: "12px 14px",
  borderRadius: 12,
  border: "1px solid #D1D9E6",
  background: "rgba(255,255,255,.75)",
  font: "400 15px 'Golos Text', system-ui, sans-serif",
  color: "#1A1C1E",
  outline: "none",
};
const labelStyle: React.CSSProperties = {
  font: "600 13px 'Golos Text', system-ui, sans-serif",
  color: "#1A1C1E",
  marginBottom: 8,
  display: "block",
};

type SlugState = { message: string; color: string; ok: boolean };

function evaluateSlug(raw: string, available: boolean | null): SlugState {
  const s = raw.trim().toLowerCase();
  if (!s) return { message: "Придумайте адрес — латиницей", color: "#8E97A4", ok: false };
  if (s.length < 3) return { message: "Минимум 3 символа", color: "#8E97A4", ok: false };
  if (available === false)
    return { message: `✗ Занят — попробуйте ${s}1 или ${s}.pro`, color: "#D64545", ok: false };
  if (available === true) return { message: "✓ Адрес свободен", color: "#2E8A73", ok: true };
  return { message: "Проверяем…", color: "#8E97A4", ok: false };
}

export default function SlotixOnboarding() {
  const router = useRouter();
  const utils = trpc.useUtils();
  const { data: user } = trpc.viewer.me.get.useQuery();
  const { timezone, setTimezone } = useTimePreferences();

  const [name, setName] = useState("");
  const [bio, setBio] = useState("");
  const [username, setUsername] = useState("");
  const [avatar, setAvatar] = useState<string | null>(null);
  const [available, setAvailable] = useState<boolean | null>(null);
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    if (user && !initialized) {
      setName(user.name || "");
      setBio(user.bio || "");
      setUsername(user.username || "");
      setAvatar(user.avatar || null);
      setInitialized(true);
    }
  }, [user, initialized]);

  const debouncedUsername = useDebounce(username, 500);
  useEffect(() => {
    const s = debouncedUsername.trim().toLowerCase();
    if (s.length < 3) {
      setAvailable(null);
      return;
    }
    if (user?.username && s === user.username.toLowerCase()) {
      setAvailable(true);
      return;
    }
    let cancelled = false;
    fetchUsername(s, null).then(({ data }) => {
      if (!cancelled) setAvailable(data.available);
    });
    return () => {
      cancelled = true;
    };
  }, [debouncedUsername, user?.username]);

  const slug = evaluateSlug(username, available);

  const connectedCalendars = trpc.viewer.calendars.connectedCalendars.useQuery(undefined, {
    enabled: !!user,
  });
  const googleConnected = connectedCalendars.data?.connectedCalendars?.some(
    (c) => c.integration?.type === "google_calendar"
  );

  const connectGoogle = useAddAppMutation("google_calendar", {
    onError: (e) => showToast(e instanceof Error ? e.message : "Не удалось подключить Google", "error"),
  });

  const updateProfile = trpc.viewer.me.updateProfile.useMutation({
    onSuccess: async () => {
      await utils.viewer.me.invalidate();
      router.push("/event-types");
    },
    onError: (e) => showToast(e.message || "Не удалось сохранить", "error"),
  });

  const save = () => {
    if (!slug.ok || !name.trim()) return;
    updateProfile.mutate({
      name: name.trim(),
      bio: bio.trim(),
      username: username.trim().toLowerCase(),
      timeZone: timezone,
      completedOnboarding: true,
      // Only send a freshly uploaded (base64) avatar, not the resolved display URL.
      ...(avatar?.startsWith("data:") ? { avatarUrl: avatar } : {}),
    });
  };

  const ctaEnabled = slug.ok && !!name.trim() && !updateProfile.isPending;

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#eaf2fb url(/slotix/aurora-bg.png) center / cover no-repeat fixed",
        display: "flex",
        justifyContent: "center",
        alignItems: "flex-start",
        padding: "80px 24px",
        boxSizing: "border-box",
        fontFamily: "'Golos Text', system-ui, sans-serif",
      }}>
      <div style={{ width: 600, maxWidth: "100%" }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 11,
            justifyContent: "center",
            marginBottom: 14,
          }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/slotix/slotix-icon.png" alt="" style={{ width: 34, height: 34, borderRadius: 9 }} />
          <div style={{ font: "700 20px 'Golos Text'", color: "#1A1C1E", letterSpacing: ".02em" }}>
            SLOTIX
          </div>
        </div>
        <h1
          style={{ textAlign: "center", font: "700 28px 'Golos Text'", color: "#1A1C1E", margin: "0 0 6px" }}>
          Добро пожаловать!
        </h1>
        <p
          style={{
            textAlign: "center",
            font: "400 15px 'Golos Text'",
            color: "#8E97A4",
            margin: "0 0 30px",
          }}>
          Два шага — и вашу ссылку можно отправлять клиентам
        </p>

        {/* Step 1 — profile + slug */}
        <div style={glassCard}>
          <div style={{ display: "flex", alignItems: "center", gap: 13, marginBottom: 22 }}>
            <div
              style={{
                width: 32,
                height: 32,
                borderRadius: "50%",
                background: "linear-gradient(135deg,#66A6FF,#5094F0)",
                color: "#fff",
                font: "700 14px 'Golos Text'",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}>
              1
            </div>
            <div style={{ font: "700 16px 'Golos Text'", color: "#1A1C1E" }}>
              Расскажите о себе и выберите адрес
            </div>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 18 }}>
            <div
              style={{
                width: 60,
                height: 60,
                borderRadius: "50%",
                boxShadow: "0 0 0 1.5px #5094F0",
                overflow: "hidden",
                flex: "none",
                background: "rgba(255,255,255,.85)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}>
              {avatar ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={avatar} alt="" style={{ width: 60, height: 60, objectFit: "cover" }} />
              ) : (
                <span style={{ font: "600 15px 'Golos Text'", color: "#8E97A4" }}>Фото</span>
              )}
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ font: "400 13px 'Golos Text'", color: "#8E97A4", marginBottom: 8 }}>
                Загрузите фото — так клиенты узнают, к кому идут на встречу
              </div>
              <ImageUploader
                target="avatar"
                id="slotix-onboarding-avatar"
                buttonMsg="Загрузить фото"
                handleAvatarChange={(newAvatar) => setAvatar(newAvatar)}
                imageSrc={avatar ?? undefined}
              />
            </div>
          </div>

          <div style={{ display: "grid", gap: 16 }}>
            <div>
              <label style={labelStyle}>Имя</label>
              <input
                style={inputStyle}
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Алексей Ковалёв"
              />
            </div>
            <div>
              <label style={labelStyle}>Короткое описание</label>
              <input
                style={inputStyle}
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="Например: продуктовый эксперт"
              />
            </div>
            <div>
              <label style={labelStyle}>Адрес страницы</label>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  border: "1px solid #D1D9E6",
                  borderRadius: 12,
                  background: "rgba(255,255,255,.75)",
                  overflow: "hidden",
                }}>
                <span
                  style={{ padding: "12px 4px 12px 14px", font: "400 15px 'Golos Text'", color: "#8E97A4" }}>
                  slotix.ru/
                </span>
                <input
                  value={username}
                  onChange={(e) => setUsername(e.target.value.replace(/[^a-z0-9.-]/gi, "").toLowerCase())}
                  style={{
                    flex: 1,
                    border: "none",
                    background: "transparent",
                    padding: "12px 14px 12px 0",
                    font: "600 15px 'Golos Text'",
                    color: "#1A1C1E",
                    outline: "none",
                  }}
                />
              </div>
              <div style={{ marginTop: 8, font: "500 12.5px 'Golos Text'", color: slug.color }}>
                {slug.message}
              </div>
            </div>
            <div>
              <label style={labelStyle}>Часовой пояс</label>
              <TimezoneSelect
                value={timezone}
                onChange={({ value }) => setTimezone(value)}
                className="w-full rounded-md text-sm"
              />
            </div>
          </div>
        </div>

        {/* Step 2 — Google */}
        <div style={{ ...glassCard, marginBottom: 24 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 13, marginBottom: 18 }}>
            <div
              style={{
                width: 32,
                height: 32,
                borderRadius: "50%",
                font: "700 14px 'Golos Text'",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flex: "none",
                ...(googleConnected
                  ? { background: "linear-gradient(135deg,#4FD6A0,#3FCB6E)", color: "#fff" }
                  : { background: "rgba(80,148,240,.14)", color: "#2F6FD0" }),
              }}>
              {googleConnected ? (
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#fff"
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeLinejoin="round">
                  <path d="M20 6L9 17l-5-5" />
                </svg>
              ) : (
                "2"
              )}
            </div>
            <div style={{ font: "700 16px 'Golos Text'", color: "#1A1C1E" }}>Подключите аккаунт Google</div>
          </div>
          {googleConnected ? (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
                padding: "14px 16px",
                borderRadius: 12,
                background: "rgba(63,162,148,.1)",
                border: "1px solid rgba(63,162,148,.22)",
              }}>
              <span style={{ color: "#2E8A73" }}>
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round">
                  <path d="M20 6L9 17l-5-5" />
                </svg>
              </span>
              <div style={{ font: "600 14px 'Golos Text'", color: "#1A1C1E" }}>Google подключён</div>
            </div>
          ) : (
            <div>
              <p style={{ font: "400 14px/1.5 'Golos Text'", color: "#8E97A4", margin: "0 0 18px" }}>
                Нужно для синхронизации календаря и создания ссылок Google Meet.
              </p>
              <button
                type="button"
                onClick={() => connectGoogle.mutate("")}
                disabled={connectGoogle.isPending}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 11,
                  width: "100%",
                  padding: 13,
                  border: "1px solid #D1D9E6",
                  borderRadius: 12,
                  background: "#fff",
                  color: "#1A1C1E",
                  font: "600 14px 'Golos Text'",
                  cursor: "pointer",
                }}>
                <svg width="18" height="18" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.5 12.2c0-.7-.1-1.4-.2-2H12v3.8h5.9a5 5 0 0 1-2.2 3.3v2.7h3.6c2.1-2 3.2-4.8 3.2-7.8z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.9 0 5.4-1 7.2-2.6l-3.6-2.7c-1 .7-2.3 1-3.6 1-2.8 0-5.1-1.9-6-4.4H2.3v2.8A11 11 0 0 0 12 23z"
                  />
                  <path fill="#FBBC05" d="M6 14.3a6.6 6.6 0 0 1 0-4.2V7.3H2.3a11 11 0 0 0 0 9.8L6 14.3z" />
                  <path
                    fill="#EA4335"
                    d="M12 5.4c1.6 0 3 .5 4.1 1.6l3.1-3.1A11 11 0 0 0 12 1a11 11 0 0 0-9.7 6l3.7 2.8c.9-2.5 3.2-4.4 6-4.4z"
                  />
                </svg>
                Подключить Google Calendar
              </button>
            </div>
          )}
        </div>

        <button
          type="button"
          onClick={save}
          disabled={!ctaEnabled}
          style={{
            width: "100%",
            padding: 16,
            border: "none",
            borderRadius: 13,
            font: "600 15px 'Golos Text'",
            transition: "all .2s",
            ...(ctaEnabled
              ? {
                  background: "linear-gradient(135deg,#66A6FF,#5094F0)",
                  color: "#fff",
                  cursor: "pointer",
                  boxShadow: "0 10px 24px rgba(80,148,240,.35)",
                }
              : { background: "#DCE4EC", color: "#A9B4BF", cursor: "not-allowed" }),
          }}>
          {updateProfile.isPending ? "Сохраняем…" : "Сохранить и продолжить"}
        </button>
      </div>
    </div>
  );
}
