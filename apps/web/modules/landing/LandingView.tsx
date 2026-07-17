"use client";

// Slotix marketing landing — reproduces design_handoff_slotix/"Slotix - Лендинг" prototype.
// Static marketing content + a branded login modal wired to the real NextAuth flow.
import { ErrorCode } from "@calcom/features/auth/lib/ErrorCode";
import { useRouter } from "next/navigation";
import { getProviders, signIn } from "next-auth/react";
import { useEffect, useState } from "react";

const ArrowRight = () => (
  <svg
    width="18"
    height="18"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.4"
    strokeLinecap="round"
    strokeLinejoin="round">
    <path d="M5 12h14M13 6l6 6-6 6" />
  </svg>
);

const features = [
  {
    bg: "rgba(80,148,240,.14)",
    color: "#3B7FD9",
    icon: (
      <>
        <path d="M10 13a5 5 0 0 0 7 0l3-3a5 5 0 0 0-7-7l-1.5 1.5" />
        <path d="M14 11a5 5 0 0 0-7 0l-3 3a5 5 0 0 0 7 7l1.5-1.5" />
      </>
    ),
    title: "Одна ссылка вместо переписок",
    text: "Отправьте ссылку в мессенджер, соцсеть или подпись письма. Клиент видит только свободные слоты и бронирует сам.",
  },
  {
    bg: "rgba(63,203,110,.15)",
    color: "#2FA85A",
    icon: (
      <>
        <rect x="3" y="4.5" width="18" height="16.5" rx="2.5" />
        <path d="M3 9h18M8 2.5v4M16 2.5v4M8 14h3M8 17.5h6" />
      </>
    ),
    title: "Вы управляете расписанием",
    text: "Рабочие часы, перерывы между встречами и правила отмены — всё под вашим контролем.",
  },
  {
    bg: "rgba(147,120,236,.15)",
    color: "#7B5CE0",
    icon: (
      <>
        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
        <path d="M22 4L12 14.01l-3-3" />
      </>
    ),
    title: "Без накладок в календаре",
    text: "Свободные слоты рассчитываются по вашему Google Календарю — двойных броней не будет.",
  },
];

const bullets = [
  {
    title: "Клиенту не нужна регистрация",
    text: "Для записи достаточно указать email — никаких аккаунтов и паролей.",
  },
  {
    title: "Уведомления и напоминания",
    text: "Вам и клиенту приходит подтверждение, а встреча сразу добавляется в календари.",
  },
  {
    title: "Оплата сразу при бронировании",
    text: "Подключите приём платежей и получайте оплату онлайн в момент записи.",
  },
];

const integrations = [
  {
    tags: ["Zoom", "Google Meet", "Телемост"],
    title: "Встречи в Zoom, Meet и Телемост",
    text: "После брони конференция создаётся автоматически, а клиент получает напоминание, где связаться с вами.",
  },
  {
    tags: ["Google Календарь"],
    title: "Подключите Google Календарь",
    text: "Встречи автоматически появляются в вашем календаре и в календаре клиента.",
  },
  {
    tags: ["ЮKassa", "Stripe"],
    title: "Принимайте оплату сразу",
    text: "Подключите платёжный сервис и получайте оплату от клиентов онлайн при бронировании.",
  },
];

// "Почему Slotix" cards (blocks 2–5), ordered by uniqueness — do not reorder.
const whyCards = [
  {
    iconBg: "rgba(63,203,110,.15)",
    badgeBg: "rgba(63,203,110,.13)",
    color: "#2FA85A",
    icon: (
      <>
        <path d="M17 2l4 4-4 4" />
        <path d="M3 11V9a4 4 0 0 1 4-4h14" />
        <path d="M7 22l-4-4 4-4" />
        <path d="M21 13v2a4 4 0 0 1-4 4H3" />
      </>
    ),
    badge: "Ноль потерянных клиентов",
    title: "Следующая встреча назначается сама",
    text: "Если в конспекте есть «созвониться через две недели» — там же появляется кнопка записи. Клиент бронирует в один тап, вы не пишете «ну что, когда удобно?».",
    footer: "Каждая встреча приводит следующую.",
  },
  {
    iconBg: "rgba(80,148,240,.14)",
    badgeBg: "rgba(80,148,240,.12)",
    color: "#2F6FD0",
    icon: (
      <>
        <path d="M22 2L11 13" />
        <path d="M22 2l-7 20-4-9-9-4z" />
      </>
    ),
    badge: "Там, где ваши клиенты",
    title: "Напоминания в Telegram, а не в спаме",
    text: "Подтверждения, напоминания и конспекты приходят туда, где человек их точно увидит. С кнопками «Перенести» и «Записаться снова» прямо в сообщении.",
    footer: "Меньше неявок — клиенту не нужно открывать почту.",
  },
  {
    iconBg: "rgba(123,92,224,.14)",
    badgeBg: "rgba(123,92,224,.12)",
    color: "#7B5CE0",
    icon: (
      <>
        <path d="M12 2l9 5-9 5-9-5z" />
        <path d="M3 12l9 5 9-5" />
        <path d="M3 17l9 5 9-5" />
      </>
    ),
    badge: "Для тех, кто работает курсом",
    title: "Продавайте встречи сразу пакетом",
    text: "Клиент оплачивает пакет и сам записывается на удобные слоты — остаток списывается автоматически. Для репетиторов, коучей и всех, кто ведёт клиента вдолгую.",
    footer: "Предоплаченный клиент возвращается, а не «подумает».",
  },
  {
    iconBg: "rgba(63,203,110,.15)",
    badgeBg: "rgba(63,203,110,.13)",
    color: "#2FA85A",
    icon: (
      <>
        <path d="M10 13a5 5 0 0 0 7 0l3-3a5 5 0 0 0-7-7l-1.5 1.5" />
        <path d="M14 11a5 5 0 0 0-7 0l-3 3a5 5 0 0 0 7 7l1.5-1.5" />
      </>
    ),
    badge: "Сделано для рунета",
    title: "Телемост, ЮKassa и письма, которые доходят",
    text: "Автоссылка на Яндекс Телемост, Google Meet или Zoom при записи. Оплата российскими картами через ЮKassa. Уведомления, которые не улетают в спам на mail.ru и Яндексе.",
    footer: "То, что зарубежные Calendly не сделают.",
  },
];

const availableDays = [10, 11, 17, 18, 22, 23, 24, 29, 30, 31];
const weekdays = ["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Вс"];

const cardGlass = "rgba(255,255,255,.55)";
const chatBubbleIn =
  "align-self:flex-start;max-width:82%;padding:11px 15px;border-radius:18px 18px 18px 5px;background:rgba(120,132,148,.14);color:#22262B;font:400 14.5px/1.35 'Golos Text'";
const chatBubbleOut =
  "align-self:flex-end;max-width:82%;padding:11px 15px;border-radius:18px 18px 5px 18px;background:linear-gradient(135deg,#66A6FF,#5094F0);color:#fff;font:400 14.5px/1.35 'Golos Text';box-shadow:0 6px 16px rgba(80,148,240,.28)";

export default function LandingView() {
  const router = useRouter();
  const [loginOpen, setLoginOpen] = useState(false);
  const [authView, setAuthView] = useState<"login" | "reset" | "sent" | "register" | "register-sent">(
    "login"
  );
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  // Only offer a social provider if it's actually registered server-side (env-gated).
  // Prevents dead "Войти с Yandex" buttons when YANDEX_* isn't configured on a deployment.
  const [providers, setProviders] = useState<Record<string, unknown> | null>(null);
  useEffect(() => {
    getProviders()
      .then((p) => setProviders(p ?? {}))
      .catch(() => setProviders({}));
  }, []);
  const hasProvider = (id: string) => !providers || id in providers;

  const openLogin = () => {
    setAuthView("login");
    setError(null);
    setLoginOpen(true);
  };
  const closeLogin = () => {
    setLoginOpen(false);
    setAuthView("login");
    setError(null);
  };
  const loginWithGoogle = () => signIn("google", { callbackUrl: "/event-types" });
  const loginWithYandex = () => signIn("yandex", { callbackUrl: "/event-types" });

  // Slotix registration = auth (Google / Yandex / email magic-link) → straight into our
  // /getting-started onboarding, which doubles as the sign-up step. No separate Cal.com form.
  const REG_CALLBACK = "/getting-started";
  const openRegister = () => {
    setAuthView("register");
    setError(null);
    setLoginOpen(true);
  };
  const registerWithGoogle = () => signIn("google", { callbackUrl: REG_CALLBACK });
  const registerWithYandex = () => signIn("yandex", { callbackUrl: REG_CALLBACK });
  const registerWithEmail = async () => {
    const value = email.trim();
    if (!value.includes("@")) return setError("Введите корректный email");
    setError(null);
    setLoading(true);
    try {
      await signIn("email", { email: value, callbackUrl: REG_CALLBACK, redirect: false });
      setAuthView("register-sent");
    } catch {
      setError("Не удалось отправить письмо. Попробуйте ещё раз.");
    } finally {
      setLoading(false);
    }
  };
  // Hero / CTA "Начать бесплатно": open the modal in register mode; if an email was already
  // typed, send the magic link immediately and jump to the confirmation screen.
  const startRegisterFromHero = async () => {
    setError(null);
    setLoginOpen(true);
    if (email.trim().includes("@")) {
      await registerWithEmail();
    } else {
      setAuthView("register");
    }
  };
  const loginWithCredentials = async () => {
    setError(null);
    setLoading(true);
    const res = await signIn("credentials", {
      email,
      password,
      redirect: false,
      callbackUrl: "/event-types",
    });
    setLoading(false);
    if (!res) return setError("Не удалось войти. Попробуйте ещё раз.");
    if (!res.error) {
      router.push(res.url || "/event-types");
      return;
    }
    // 2FA needs the full login page flow — hand off there with the email prefilled.
    if (res.error === ErrorCode.SecondFactorRequired) {
      window.location.href = `/auth/login?email=${encodeURIComponent(email)}`;
      return;
    }
    if (res.error === ErrorCode.IncorrectEmailPassword) return setError("Неверный email или пароль.");
    if (res.error === ErrorCode.ThirdPartyIdentityProviderEnabled)
      return setError("Этот аккаунт создан через Google. Войдите через Google.");
    setError("Не удалось войти. Попробуйте ещё раз.");
  };
  const sendReset = async () => {
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      setLoading(false);
      if (res.ok) setAuthView("sent");
      else setError("Не удалось отправить письмо. Проверьте адрес.");
    } catch {
      setLoading(false);
      setError("Не удалось отправить письмо. Попробуйте позже.");
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#EAF2FB url(/slotix/aurora-bg.png) center top / cover no-repeat fixed",
        overflowX: "hidden",
        fontFamily: "'Golos Text', system-ui, sans-serif",
      }}>
      <style>{`
        .sx-a{color:#3E4347;font:600 15px 'Golos Text';transition:color .15s}
        .sx-a:hover{color:#1F5FBF}
        @keyframes sx-blink{0%,60%,100%{opacity:.25;transform:translateY(0)}30%{opacity:1;transform:translateY(-2px)}}
        @keyframes sx-float{0%,100%{transform:translateY(0)}50%{transform:translateY(-9px)}}
        .sx-navlinks{display:flex;align-items:center;gap:clamp(14px,2.4vw,34px)}
        @media(max-width:720px){.sx-navlinks-wide{display:none!important}}
        .sx-cta{transition:box-shadow .15s,transform .15s}
        .sx-cta:hover{box-shadow:0 14px 34px rgba(80,148,240,.5)!important;transform:translateY(-1px)}
        .sx-input::placeholder{color:#9AA4B0}
        .sx-input:focus{border-color:#5094F0!important;box-shadow:0 0 0 3px rgba(80,148,240,.15)!important}
      `}</style>

      {/* NAV */}
      <div
        style={{
          position: "sticky",
          top: 0,
          zIndex: 50,
          background: "rgba(234,242,251,.55)",
          backdropFilter: "blur(20px) saturate(1.3)",
          WebkitBackdropFilter: "blur(20px) saturate(1.3)",
          borderBottom: "1px solid rgba(255,255,255,.5)",
        }}>
        <div
          style={{
            maxWidth: 1200,
            margin: "0 auto",
            padding: "16px clamp(20px,5vw,40px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 20,
          }}>
          <a href="#top" style={{ display: "flex", alignItems: "center" }}>
            <img
              src="/slotix/slotix-logo.png"
              alt="Slotix"
              style={{ height: 30, width: "auto", display: "block" }}
            />
          </a>
          <div className="sx-navlinks">
            <a href="#features" className="sx-a sx-navlinks-wide">
              Возможности
            </a>
            <a href="#integrations" className="sx-a sx-navlinks-wide">
              Интеграции
            </a>
            <button
              type="button"
              onClick={openLogin}
              style={{
                font: "600 15px 'Golos Text'",
                color: "#1A1C1E",
                background: "none",
                border: "none",
                padding: 0,
                cursor: "pointer",
              }}>
              Вход
            </button>
            <button
              type="button"
              onClick={openRegister}
              className="sx-cta"
              style={{
                font: "600 14px 'Golos Text'",
                color: "#fff",
                padding: "10px 20px",
                borderRadius: 11,
                border: "none",
                cursor: "pointer",
                background: "linear-gradient(135deg,#66A6FF,#5094F0)",
                boxShadow: "0 8px 20px rgba(80,148,240,.32)",
              }}>
              Регистрация
            </button>
          </div>
        </div>
      </div>

      {/* HERO */}
      <div
        id="top"
        style={{
          maxWidth: 1200,
          margin: "0 auto",
          padding: "clamp(48px,7vw,96px) clamp(20px,5vw,40px) clamp(40px,6vw,72px)",
          display: "flex",
          flexWrap: "wrap",
          alignItems: "center",
          gap: "clamp(36px,5vw,64px)",
        }}>
        <div style={{ flex: "1 1 420px", minWidth: 320 }}>
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              padding: "7px 14px",
              borderRadius: 100,
              background: "rgba(255,255,255,.6)",
              border: "1px solid rgba(255,255,255,.7)",
              boxShadow: "0 4px 14px rgba(20,40,70,.05)",
              font: "600 13px 'Golos Text'",
              color: "#2F6FD0",
              marginBottom: 26,
            }}>
            <span
              style={{
                width: 7,
                height: 7,
                borderRadius: "50%",
                background: "#3FCB6E",
                boxShadow: "0 0 0 3px rgba(63,203,110,.2)",
              }}
            />
            Планирование встреч без переписок
          </div>
          <h1
            style={{
              font: "800 clamp(34px,4.6vw,56px)/1.06 'Golos Text'",
              letterSpacing: "-.02em",
              color: "#1A1C1E",
              margin: "0 0 22px",
              textWrap: "balance",
            }}>
            Slotix помогает
            <br />
            планировать встречи
            <br />
            без долгих переписок
          </h1>
          <p
            style={{
              font: "400 clamp(16px,1.4vw,19px)/1.55 'Golos Text'",
              color: "#5C6672",
              margin: "0 0 32px",
              maxWidth: 480,
            }}>
            Клиент открывает вашу ссылку, сам выбирает свободный слот и бронирует встречу. Никаких «а когда
            тебе удобно?» в мессенджерах.
          </p>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 10, maxWidth: 520 }}>
            <input
              className="sx-input"
              placeholder="Введите ваш e-mail"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") startRegisterFromHero();
              }}
              style={{
                flex: "1 1 220px",
                minWidth: 0,
                boxSizing: "border-box",
                padding: "16px 18px",
                borderRadius: 14,
                border: "1px solid rgba(255,255,255,.75)",
                background: "rgba(255,255,255,.7)",
                backdropFilter: "blur(12px)",
                WebkitBackdropFilter: "blur(12px)",
                font: "400 16px 'Golos Text'",
                color: "#1A1C1E",
                outline: "none",
              }}
            />
            <button
              type="button"
              onClick={startRegisterFromHero}
              className="sx-cta"
              style={{
                flex: "0 0 auto",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 9,
                padding: "16px 26px",
                borderRadius: 14,
                border: "none",
                cursor: "pointer",
                background: "linear-gradient(135deg,#66A6FF,#5094F0)",
                color: "#fff",
                font: "700 16px 'Golos Text'",
                boxShadow: "0 12px 28px rgba(80,148,240,.38)",
              }}>
              Начать бесплатно
              <ArrowRight />
            </button>
          </div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              marginTop: 16,
              font: "500 14px 'Golos Text'",
              color: "#8E97A4",
            }}>
            <svg
              width="17"
              height="17"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#3FCB6E"
              strokeWidth="2.4"
              strokeLinecap="round"
              strokeLinejoin="round">
              <path d="M20 6L9 17l-5-5" />
            </svg>
            Бесплатно. Привязка карты не требуется.
          </div>
        </div>

        {/* hero chat mockup */}
        <div
          style={{
            flex: "1 1 400px",
            minWidth: 320,
            display: "flex",
            justifyContent: "center",
            position: "relative",
          }}>
          <div style={{ position: "relative", width: "100%", maxWidth: 440 }}>
            <div
              style={{
                position: "relative",
                background: "rgba(255,255,255,.6)",
                backdropFilter: "blur(30px) saturate(1.4)",
                WebkitBackdropFilter: "blur(30px) saturate(1.4)",
                border: "1px solid rgba(255,255,255,.6)",
                borderRadius: 28,
                boxShadow: "0 24px 60px rgba(20,40,70,.12)",
                padding: "26px 22px 30px",
              }}>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 11,
                  paddingBottom: 18,
                  marginBottom: 20,
                  borderBottom: "1px solid rgba(20,30,45,.07)",
                }}>
                <div
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: "50%",
                    background: "linear-gradient(135deg,#CBD8EA,#9BB4D6)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    font: "700 15px 'Golos Text'",
                    color: "#fff",
                    flex: "none",
                  }}>
                  М
                </div>
                <div>
                  <div style={{ font: "700 15px 'Golos Text'", color: "#1A1C1E" }}>Марина</div>
                  <div style={{ font: "400 12px 'Golos Text'", color: "#8E97A4" }}>в сети</div>
                </div>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 9 }}>
                <div style={cssToObj(chatBubbleIn)}>
                  Привет! Давай встретимся на этой неделе, ты когда свободен?
                </div>
                <div style={cssToObj(chatBubbleOut)}>Привет! Есть время завтра :)</div>
                <div style={cssToObj(chatBubbleIn)}>А в котором часу?</div>
                <div style={cssToObj(chatBubbleOut)}>14:00 и 15:00, тебе когда удобно?</div>
                <div style={cssToObj(chatBubbleIn)}>Не смогу, обедаю с коллегами(</div>
                <div style={cssToObj(chatBubbleOut)}>Тогда среда с 17 до 20, подойдёт?</div>
                <div style={cssToObj(chatBubbleIn)}>Нет… В среду работаю допоздна :(</div>
                <div
                  style={{
                    alignSelf: "flex-start",
                    display: "flex",
                    gap: 5,
                    padding: "14px 16px",
                    borderRadius: "18px 18px 18px 5px",
                    background: "rgba(120,132,148,.14)",
                  }}>
                  {[0, 0.2, 0.4].map((d) => (
                    <span
                      key={d}
                      style={{
                        width: 7,
                        height: 7,
                        borderRadius: "50%",
                        background: "#8E97A4",
                        animation: `sx-blink 1.2s infinite ${d}s`,
                      }}
                    />
                  ))}
                </div>
              </div>
            </div>
            <div
              style={{
                position: "absolute",
                left: "-6%",
                bottom: -38,
                width: "88%",
                background: "rgba(255,255,255,.82)",
                backdropFilter: "blur(26px) saturate(1.5)",
                WebkitBackdropFilter: "blur(26px) saturate(1.5)",
                border: "1px solid rgba(255,255,255,.8)",
                borderRadius: 20,
                boxShadow: "0 20px 46px rgba(20,40,70,.16)",
                padding: "16px 18px",
                display: "flex",
                alignItems: "center",
                gap: 14,
                animation: "sx-float 5s ease-in-out infinite",
              }}>
              <div
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: 12,
                  background: "linear-gradient(135deg,#66A6FF,#5094F0)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flex: "none",
                  boxShadow: "0 8px 18px rgba(80,148,240,.35)",
                }}>
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#fff"
                  strokeWidth="2.2"
                  strokeLinecap="round"
                  strokeLinejoin="round">
                  <rect x="3" y="4.5" width="18" height="16.5" rx="2.5" />
                  <path d="M3 9h18M8 2.5v4M16 2.5v4M9 14l2 2 4-4" />
                </svg>
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ font: "700 15px 'Golos Text'", color: "#1A1C1E" }}>С Slotix — 1 клик</div>
                <div style={{ font: "400 13px 'Golos Text'", color: "#8E97A4" }}>
                  Клиент сам выбрал слот. Встреча в календаре.
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* FEATURES */}
      <div
        id="features"
        style={{ maxWidth: 1200, margin: "0 auto", padding: "clamp(40px,6vw,80px) clamp(20px,5vw,40px)" }}>
        <div style={{ textAlign: "center", maxWidth: 640, margin: "0 auto clamp(36px,4vw,52px)" }}>
          <div
            style={{
              font: "700 13px 'Golos Text'",
              letterSpacing: ".08em",
              textTransform: "uppercase",
              color: "#5094F0",
              marginBottom: 12,
            }}>
            Как это работает
          </div>
          <h2
            style={{
              font: "800 clamp(28px,3.4vw,40px)/1.12 'Golos Text'",
              letterSpacing: "-.015em",
              color: "#1A1C1E",
              margin: 0,
            }}>
            Клиенту нужна только ссылка, чтобы записаться
          </h2>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(260px,1fr))", gap: 20 }}>
          {features.map((f) => (
            <div
              key={f.title}
              style={{
                background: cardGlass,
                backdropFilter: "blur(24px) saturate(1.3)",
                WebkitBackdropFilter: "blur(24px) saturate(1.3)",
                border: "1px solid rgba(255,255,255,.6)",
                borderRadius: 24,
                boxShadow: "0 14px 38px rgba(20,40,70,.07)",
                padding: "30px 28px",
              }}>
              <div
                style={{
                  width: 52,
                  height: 52,
                  borderRadius: 15,
                  background: f.bg,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  marginBottom: 22,
                  color: f.color,
                }}>
                <svg
                  width="26"
                  height="26"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round">
                  {f.icon}
                </svg>
              </div>
              <div style={{ font: "700 19px 'Golos Text'", color: "#1A1C1E", marginBottom: 10 }}>
                {f.title}
              </div>
              <div style={{ font: "400 15px/1.55 'Golos Text'", color: "#5C6672" }}>{f.text}</div>
            </div>
          ))}
        </div>
      </div>

      {/* PRODUCT PREVIEW */}
      <div
        style={{
          maxWidth: 1200,
          margin: "0 auto",
          padding: "clamp(20px,3vw,40px) clamp(20px,5vw,40px) clamp(40px,6vw,80px)",
          display: "flex",
          flexWrap: "wrap",
          alignItems: "center",
          gap: "clamp(36px,5vw,64px)",
        }}>
        <div style={{ flex: "1 1 340px", minWidth: 300 }}>
          <h2
            style={{
              font: "800 clamp(26px,3vw,36px)/1.14 'Golos Text'",
              letterSpacing: "-.015em",
              color: "#1A1C1E",
              margin: "0 0 24px",
            }}>
            Вы управляете расписанием — Slotix делает остальное
          </h2>
          <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            {bullets.map((b) => (
              <div key={b.title} style={{ display: "flex", gap: 14 }}>
                <span
                  style={{
                    width: 26,
                    height: 26,
                    borderRadius: "50%",
                    background: "rgba(63,203,110,.15)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flex: "none",
                    marginTop: 2,
                  }}>
                  <svg
                    width="15"
                    height="15"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="#2FA85A"
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeLinejoin="round">
                    <path d="M20 6L9 17l-5-5" />
                  </svg>
                </span>
                <div>
                  <div style={{ font: "700 16px 'Golos Text'", color: "#1A1C1E", marginBottom: 4 }}>
                    {b.title}
                  </div>
                  <div style={{ font: "400 15px/1.5 'Golos Text'", color: "#5C6672" }}>{b.text}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div style={{ flex: "1 1 380px", minWidth: 300, display: "flex", justifyContent: "center" }}>
          <div
            style={{
              width: "100%",
              maxWidth: 440,
              background: "rgba(255,255,255,.6)",
              backdropFilter: "blur(30px) saturate(1.4)",
              WebkitBackdropFilter: "blur(30px) saturate(1.4)",
              border: "1px solid rgba(255,255,255,.6)",
              borderRadius: 28,
              boxShadow: "0 24px 60px rgba(20,40,70,.1)",
              padding: 28,
            }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: 20,
              }}>
              <div style={{ font: "700 17px 'Golos Text'", color: "#1A1C1E" }}>Июль 2026</div>
              <div style={{ display: "flex", gap: 8 }}>
                {["M15 6l-6 6 6 6", "M9 6l6 6-6 6"].map((d) => (
                  <span
                    key={d}
                    style={{
                      width: 32,
                      height: 32,
                      borderRadius: "50%",
                      background: "rgba(255,255,255,.8)",
                      boxShadow: "0 2px 6px rgba(20,40,70,.06)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: "#3E4347",
                    }}>
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round">
                      <path d={d} />
                    </svg>
                  </span>
                ))}
              </div>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(7,1fr)", gap: 6 }}>
              {weekdays.map((w) => (
                <div
                  key={w}
                  style={{
                    textAlign: "center",
                    font: "400 11px 'Golos Text'",
                    color: "#8E97A4",
                    paddingBottom: 4,
                  }}>
                  {w}
                </div>
              ))}
              {["b0", "b1"].map((k) => (
                <div key={k} style={{ height: 38 }} />
              ))}
              {Array.from({ length: 31 }, (_, i) => i + 1).map((n) => {
                const base = {
                  height: 38,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  borderRadius: "50%",
                  font: "500 14px 'Golos Text'",
                } as const;
                if (n === 17)
                  return (
                    <div
                      key={n}
                      style={{
                        ...base,
                        background: "linear-gradient(135deg,#66A6FF,#5094F0)",
                        color: "#fff",
                        boxShadow: "0 6px 16px rgba(80,148,240,.35)",
                      }}>
                      {n}
                    </div>
                  );
                if (availableDays.includes(n))
                  return (
                    <div
                      key={n}
                      style={{
                        ...base,
                        background: "rgba(80,148,240,.12)",
                        color: "#2F6FD0",
                        cursor: "pointer",
                      }}>
                      {n}
                    </div>
                  );
                return (
                  <div key={n} style={{ ...base, color: "#B5C0CC" }}>
                    {n}
                  </div>
                );
              })}
            </div>
            <div
              style={{
                marginTop: 20,
                display: "flex",
                alignItems: "center",
                gap: 10,
                padding: "13px 15px",
                borderRadius: 12,
                background: "rgba(255,255,255,.72)",
                border: "1px solid rgba(255,255,255,.7)",
                boxShadow: "0 2px 8px rgba(20,40,70,.05)",
              }}>
              <span style={{ color: "#8E97A4", display: "flex" }}>
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2">
                  <circle cx="12" cy="12" r="9" />
                  <path d="M3 12h18" />
                  <path d="M12 3a15 15 0 0 1 0 18a15 15 0 0 1 0-18" />
                </svg>
              </span>
              <span style={{ font: "500 14px 'Golos Text'", color: "#1A1C1E" }}>Москва (GMT+3)</span>
            </div>
          </div>
        </div>
      </div>

      {/* WHY SLOTIX */}
      <div
        id="why"
        style={{ maxWidth: 1200, margin: "0 auto", padding: "clamp(40px,6vw,80px) clamp(20px,5vw,40px)" }}>
        <div style={{ textAlign: "center", maxWidth: 680, margin: "0 auto clamp(36px,4vw,52px)" }}>
          <div
            style={{
              font: "700 13px 'Golos Text'",
              letterSpacing: ".08em",
              textTransform: "uppercase",
              color: "#5094F0",
              marginBottom: 12,
            }}>
            Почему Slotix, а не просто календарь
          </div>
          <h2
            style={{
              font: "800 clamp(28px,3.4vw,42px)/1.1 'Golos Text'",
              letterSpacing: "-.02em",
              color: "#1A1C1E",
              margin: "0 0 16px",
            }}>
            Встреча не заканчивается, когда вы кладёте трубку
          </h2>
          <p
            style={{
              font: "400 clamp(16px,1.4vw,19px)/1.55 'Golos Text'",
              color: "#5C6672",
              margin: "0 auto",
              maxWidth: 560,
            }}>
            Slotix ведёт клиента от записи до результата — и возвращает его на следующую встречу.
          </p>
        </div>

        {/* Block 1 — AI summary hero card */}
        <div
          style={{
            position: "relative",
            background: "rgba(255,255,255,.58)",
            backdropFilter: "blur(26px) saturate(1.35)",
            WebkitBackdropFilter: "blur(26px) saturate(1.35)",
            border: "1px solid rgba(255,255,255,.65)",
            borderRadius: 30,
            boxShadow: "0 22px 56px rgba(20,40,70,.1)",
            padding: "clamp(30px,4vw,48px)",
            display: "flex",
            flexWrap: "wrap",
            gap: "clamp(32px,4vw,56px)",
            alignItems: "center",
            marginBottom: 20,
            overflow: "hidden",
          }}>
          <div style={{ flex: "1 1 380px", minWidth: 300 }}>
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 9,
                padding: "8px 15px",
                borderRadius: 100,
                background: "rgba(123,92,224,.13)",
                font: "700 13px 'Golos Text'",
                color: "#7B5CE0",
                marginBottom: 20,
              }}>
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round">
                <path d="M12 3l1.9 4.6L18.5 9.5 13.9 11.4 12 16l-1.9-4.6L5.5 9.5l4.6-1.9z" />
                <path d="M19 15l.7 1.8 1.8.7-1.8.7L19 20l-.7-1.8-1.8-.7 1.8-.7z" />
              </svg>
              AI-конспект
            </div>
            <h3
              style={{
                font: "800 clamp(24px,2.8vw,34px)/1.12 'Golos Text'",
                letterSpacing: "-.015em",
                color: "#1A1C1E",
                margin: "0 0 16px",
              }}>
              Не ведите заметки — просто проведите встречу
            </h3>
            <p
              style={{
                font: "400 clamp(15px,1.3vw,17px)/1.6 'Golos Text'",
                color: "#5C6672",
                margin: "0 0 20px",
                maxWidth: 480,
              }}>
              Бот подключается к звонку, слушает и присылает готовый конспект с задачами и договорённостями.
              Вам и клиенту — сразу после встречи, на почту и в Telegram.
            </p>
            <div
              style={{
                display: "flex",
                gap: 9,
                alignItems: "flex-start",
                paddingTop: 18,
                borderTop: "1px solid rgba(20,30,45,.08)",
                marginBottom: 26,
              }}>
              <svg
                width="17"
                height="17"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#7B5CE0"
                strokeWidth="2.4"
                strokeLinecap="round"
                strokeLinejoin="round"
                style={{ flex: "none", marginTop: 1 }}>
                <path d="M5 12h14M13 6l6 6-6 6" />
              </svg>
              <span style={{ font: "600 14px/1.4 'Golos Text'", color: "#4A5560" }}>
                Вы вспоминаете, о чём договорились, не пересматривая часовую запись.
              </span>
            </div>
            <a
              href="#pricing"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 9,
                padding: "14px 24px",
                borderRadius: 14,
                background: "linear-gradient(135deg,#8E6FE8,#7B5CE0)",
                color: "#fff",
                font: "700 15px 'Golos Text'",
                boxShadow: "0 12px 28px rgba(123,92,224,.34)",
              }}>
              Забронировать ранний доступ
              <svg
                width="17"
                height="17"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.4"
                strokeLinecap="round"
                strokeLinejoin="round">
                <path d="M5 12h14M13 6l6 6-6 6" />
              </svg>
            </a>
          </div>
          <div style={{ flex: "1 1 360px", minWidth: 300, display: "flex", justifyContent: "center" }}>
            <div
              style={{
                width: "100%",
                maxWidth: 400,
                background: "rgba(255,255,255,.72)",
                backdropFilter: "blur(24px) saturate(1.4)",
                WebkitBackdropFilter: "blur(24px) saturate(1.4)",
                border: "1px solid rgba(255,255,255,.75)",
                borderRadius: 24,
                boxShadow: "0 20px 48px rgba(20,40,70,.13)",
                padding: "24px 22px",
              }}>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 11,
                  paddingBottom: 16,
                  marginBottom: 16,
                  borderBottom: "1px solid rgba(20,30,45,.07)",
                }}>
                <div
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: 12,
                    background: "linear-gradient(135deg,#8E6FE8,#7B5CE0)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flex: "none",
                    boxShadow: "0 8px 18px rgba(123,92,224,.32)",
                  }}>
                  <svg
                    width="22"
                    height="22"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="#fff"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round">
                    <path d="M12 3l1.9 4.6L18.5 9.5 13.9 11.4 12 16l-1.9-4.6L5.5 9.5l4.6-1.9z" />
                  </svg>
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ font: "700 15px 'Golos Text'", color: "#1A1C1E" }}>Конспект встречи</div>
                  <div style={{ font: "400 12px 'Golos Text'", color: "#8E97A4" }}>
                    Консультация · сегодня, 14:00
                  </div>
                </div>
              </div>
              <div
                style={{
                  font: "700 11px 'Golos Text'",
                  letterSpacing: ".06em",
                  textTransform: "uppercase",
                  color: "#8E97A4",
                  marginBottom: 9,
                }}>
                Договорённости
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 18 }}>
                {["Клиент присылает бриф до пятницы", "Готовлю смету на 3 варианта"].map((item) => (
                  <div key={item} style={{ display: "flex", gap: 9, alignItems: "flex-start" }}>
                    <span
                      style={{
                        width: 19,
                        height: 19,
                        borderRadius: 6,
                        background: "rgba(63,203,110,.16)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        flex: "none",
                        marginTop: 1,
                      }}>
                      <svg
                        width="12"
                        height="12"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="#2FA85A"
                        strokeWidth="3.2"
                        strokeLinecap="round"
                        strokeLinejoin="round">
                        <path d="M20 6L9 17l-5-5" />
                      </svg>
                    </span>
                    <span style={{ font: "400 13.5px/1.4 'Golos Text'", color: "#3E4347" }}>{item}</span>
                  </div>
                ))}
              </div>
              <div
                style={{
                  borderRadius: 14,
                  background: "rgba(80,148,240,.1)",
                  border: "1px solid rgba(80,148,240,.2)",
                  padding: "14px 15px",
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                }}>
                <div style={{ flex: 1 }}>
                  <div style={{ font: "700 13px 'Golos Text'", color: "#2F6FD0", marginBottom: 2 }}>
                    Созвониться через 2 недели
                  </div>
                  <div style={{ font: "400 12px 'Golos Text'", color: "#5C6672" }}>
                    Slotix предложит слот автоматически
                  </div>
                </div>
                <span
                  style={{
                    flex: "none",
                    padding: "9px 15px",
                    borderRadius: 10,
                    background: "linear-gradient(135deg,#66A6FF,#5094F0)",
                    color: "#fff",
                    font: "700 13px 'Golos Text'",
                    boxShadow: "0 6px 16px rgba(80,148,240,.34)",
                  }}>
                  Записаться
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Blocks 2–5 */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(250px,1fr))", gap: 20 }}>
          {whyCards.map((c) => (
            <div
              key={c.title}
              style={{
                position: "relative",
                background: "rgba(255,255,255,.55)",
                backdropFilter: "blur(24px) saturate(1.3)",
                WebkitBackdropFilter: "blur(24px) saturate(1.3)",
                border: "1px solid rgba(255,255,255,.6)",
                borderRadius: 24,
                boxShadow: "0 14px 38px rgba(20,40,70,.07)",
                padding: "28px 26px",
                display: "flex",
                flexDirection: "column",
              }}>
              <div
                style={{
                  width: 48,
                  height: 48,
                  borderRadius: 14,
                  background: c.iconBg,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  marginBottom: 18,
                  color: c.color,
                }}>
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round">
                  {c.icon}
                </svg>
              </div>
              <span
                style={{
                  alignSelf: "flex-start",
                  padding: "6px 13px",
                  borderRadius: 100,
                  background: c.badgeBg,
                  font: "700 12px 'Golos Text'",
                  color: c.color,
                  marginBottom: 14,
                }}>
                {c.badge}
              </span>
              <div style={{ font: "700 19px 'Golos Text'", color: "#1A1C1E", marginBottom: 10 }}>
                {c.title}
              </div>
              <div style={{ font: "400 14.5px/1.55 'Golos Text'", color: "#5C6672", flex: 1 }}>{c.text}</div>
              <div
                style={{
                  display: "flex",
                  gap: 8,
                  alignItems: "center",
                  marginTop: 18,
                  paddingTop: 15,
                  borderTop: "1px solid rgba(20,30,45,.07)",
                  font: "600 13px 'Golos Text'",
                  color: c.color,
                }}>
                <svg
                  width="15"
                  height="15"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.6"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  style={{ flex: "none" }}>
                  <path d="M5 12h14M13 6l6 6-6 6" />
                </svg>
                {c.footer}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* INTEGRATIONS */}
      <div
        id="integrations"
        style={{ maxWidth: 1200, margin: "0 auto", padding: "clamp(40px,6vw,80px) clamp(20px,5vw,40px)" }}>
        <h2
          style={{
            font: "800 clamp(28px,3.4vw,42px)/1.1 'Golos Text'",
            letterSpacing: "-.02em",
            color: "#1A1C1E",
            margin: "0 0 clamp(32px,4vw,48px)",
            maxWidth: 640,
          }}>
          Работает с календарём, видеосвязью и другими сервисами
        </h2>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit,minmax(260px,1fr))",
            gap: "clamp(20px,3vw,40px)",
          }}>
          {integrations.map((g) => (
            <div key={g.title}>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 20 }}>
                {g.tags.map((t) => (
                  <span
                    key={t}
                    style={{
                      padding: "8px 15px",
                      borderRadius: 100,
                      background: "rgba(255,255,255,.62)",
                      border: "1px solid rgba(255,255,255,.75)",
                      boxShadow: "0 3px 10px rgba(20,40,70,.05)",
                      font: "600 14px 'Golos Text'",
                      color: "#3E4347",
                    }}>
                    {t}
                  </span>
                ))}
              </div>
              <div style={{ font: "700 19px 'Golos Text'", color: "#1A1C1E", marginBottom: 9 }}>
                {g.title}
              </div>
              <div style={{ font: "400 15px/1.55 'Golos Text'", color: "#5C6672" }}>{g.text}</div>
            </div>
          ))}
        </div>
      </div>

      {/* FINAL CTA */}
      <div
        id="pricing"
        style={{
          maxWidth: 1200,
          margin: "0 auto",
          padding: "clamp(20px,3vw,40px) clamp(20px,5vw,40px) clamp(48px,7vw,96px)",
        }}>
        <div
          style={{
            background: "linear-gradient(135deg,rgba(223,242,233,.85),rgba(224,238,252,.85))",
            backdropFilter: "blur(30px) saturate(1.4)",
            WebkitBackdropFilter: "blur(30px) saturate(1.4)",
            border: "1px solid rgba(255,255,255,.7)",
            borderRadius: 32,
            boxShadow: "0 24px 60px rgba(20,40,70,.09)",
            padding: "clamp(40px,6vw,72px) clamp(28px,5vw,64px)",
            textAlign: "center",
          }}>
          <h2
            style={{
              font: "800 clamp(30px,3.8vw,46px)/1.1 'Golos Text'",
              letterSpacing: "-.02em",
              color: "#1A1C1E",
              margin: "0 auto 14px",
              maxWidth: 600,
            }}>
            Для регистрации нужен только email
          </h2>
          <p
            style={{
              font: "400 clamp(15px,1.3vw,18px)/1.5 'Golos Text'",
              color: "#4A5560",
              margin: "0 0 32px",
            }}>
            7 дней тарифа Premium бесплатно. Дальше — выбираете подходящий тариф.
          </p>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 10, maxWidth: 520, margin: "0 auto 16px" }}>
            <input
              className="sx-input"
              placeholder="Введите ваш e-mail"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") startRegisterFromHero();
              }}
              style={{
                flex: "1 1 220px",
                minWidth: 0,
                boxSizing: "border-box",
                padding: "16px 18px",
                borderRadius: 14,
                border: "1px solid rgba(255,255,255,.85)",
                background: "rgba(255,255,255,.8)",
                font: "400 16px 'Golos Text'",
                color: "#1A1C1E",
                outline: "none",
              }}
            />
            <button
              type="button"
              onClick={startRegisterFromHero}
              style={{
                flex: "0 0 auto",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 9,
                padding: "16px 26px",
                borderRadius: 14,
                border: "none",
                cursor: "pointer",
                background: "#1A1C1E",
                color: "#fff",
                font: "700 16px 'Golos Text'",
                boxShadow: "0 12px 28px rgba(20,30,45,.2)",
              }}>
              Начать бесплатно
            </button>
          </div>
          <div style={{ font: "500 14px 'Golos Text'", color: "#8E97A4" }}>
            Без привязки карты · Отмена в любой момент
          </div>
        </div>
      </div>

      {/* FOOTER */}
      <div style={{ borderTop: "1px solid rgba(255,255,255,.5)", background: "rgba(234,242,251,.4)" }}>
        <div
          style={{
            maxWidth: 1200,
            margin: "0 auto",
            padding: "clamp(40px,5vw,60px) clamp(20px,5vw,40px)",
            display: "flex",
            flexWrap: "wrap",
            gap: "clamp(32px,5vw,64px)",
          }}>
          <div style={{ flex: "1 1 260px", minWidth: 240 }}>
            <img
              src="/slotix/slotix-logo.png"
              alt="Slotix"
              style={{ height: 26, width: "auto", display: "block", marginBottom: 16 }}
            />
            <div
              style={{
                font: "400 14px/1.55 'Golos Text'",
                color: "#8E97A4",
                maxWidth: 280,
                marginBottom: 16,
              }}>
              Онлайн-сервис записи на встречи, консультации и занятия.
            </div>
            <div style={{ font: "400 13px 'Golos Text'", color: "#A9B4BF" }}>© 2026 Slotix</div>
          </div>
          <div style={{ flex: "0 1 auto", minWidth: 150 }}>
            <div style={{ font: "700 14px 'Golos Text'", color: "#1A1C1E", marginBottom: 14 }}>Продукт</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 11, font: "400 14px 'Golos Text'" }}>
              <a href="#features" className="sx-a">
                Возможности
              </a>
              <a href="#integrations" className="sx-a">
                Интеграции
              </a>
              <button
                type="button"
                onClick={openLogin}
                className="sx-a"
                style={{
                  background: "none",
                  border: "none",
                  padding: 0,
                  cursor: "pointer",
                  textAlign: "left",
                }}>
                Войти
              </button>
            </div>
          </div>
          <div style={{ flex: "0 1 auto", minWidth: 150 }}>
            <div style={{ font: "700 14px 'Golos Text'", color: "#1A1C1E", marginBottom: 14 }}>Поддержка</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 11, font: "400 14px 'Golos Text'" }}>
              <a href="#" className="sx-a">
                Справочный центр
              </a>
              <a href="#" className="sx-a">
                Политика конфиденциальности
              </a>
              <a href="#" className="sx-a">
                Условия использования
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* LOGIN MODAL — branded entry wired to the real NextAuth flow */}
      {loginOpen && (
        <div
          onClick={closeLogin}
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 100,
            background: "rgba(20,32,54,.42)",
            backdropFilter: "blur(7px)",
            WebkitBackdropFilter: "blur(7px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: 24,
            boxSizing: "border-box",
          }}>
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              width: "100%",
              maxWidth: 420,
              background: "rgba(255,255,255,.9)",
              backdropFilter: "blur(30px) saturate(1.4)",
              WebkitBackdropFilter: "blur(30px) saturate(1.4)",
              border: "1px solid rgba(255,255,255,.75)",
              borderRadius: 26,
              boxShadow: "0 30px 74px rgba(20,40,70,.3)",
              padding: "36px 32px",
              position: "relative",
              boxSizing: "border-box",
            }}>
            <button
              type="button"
              onClick={closeLogin}
              aria-label="Закрыть"
              style={{
                position: "absolute",
                top: 18,
                right: 18,
                width: 34,
                height: 34,
                borderRadius: "50%",
                background: "rgba(120,132,148,.12)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
                color: "#5C6672",
                border: "none",
              }}>
              <svg
                width="17"
                height="17"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.4"
                strokeLinecap="round"
                strokeLinejoin="round">
                <path d="M18 6L6 18M6 6l12 12" />
              </svg>
            </button>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                justifyContent: "center",
                marginBottom: 18,
              }}>
              <img src="/slotix/slotix-icon.png" alt="" style={{ width: 38, height: 38, borderRadius: 10 }} />
            </div>

            {authView === "login" && (
              <div>
                <h3
                  style={{
                    textAlign: "center",
                    font: "800 24px 'Golos Text'",
                    letterSpacing: "-.01em",
                    color: "#1A1C1E",
                    margin: "0 0 6px",
                  }}>
                  С возвращением
                </h3>
                <p
                  style={{
                    textAlign: "center",
                    font: "400 14.5px 'Golos Text'",
                    color: "#8E97A4",
                    margin: "0 0 26px",
                  }}>
                  Войдите, чтобы управлять расписанием
                </p>
                {hasProvider("google") && (
                <button
                  type="button"
                  onClick={loginWithGoogle}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 11,
                    width: "100%",
                    boxSizing: "border-box",
                    padding: 13,
                    border: "1px solid #D6DEE9",
                    borderRadius: 13,
                    background: "#fff",
                    color: "#1A1C1E",
                    font: "600 14.5px 'Golos Text'",
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
                  Войти с помощью Google
                </button>
                )}
                {hasProvider("yandex") && (
                <button
                  type="button"
                  onClick={loginWithYandex}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 11,
                    width: "100%",
                    boxSizing: "border-box",
                    marginTop: 10,
                    padding: 13,
                    border: "1px solid #D6DEE9",
                    borderRadius: 13,
                    background: "#fff",
                    color: "#1A1C1E",
                    font: "600 14.5px 'Golos Text'",
                    cursor: "pointer",
                  }}>
                  <svg width="18" height="18" viewBox="0 0 24 24">
                    <circle cx="12" cy="12" r="12" fill="#FC3F1D" />
                    <path
                      fill="#fff"
                      d="M13.3 6.4h-1.5c-1.9 0-3.3 1.2-3.3 3 0 1.4.7 2.2 2 3.1L8 17.6h1.8l2-3.6h.9v3.6h1.6V6.4h-1zm-1 6.2h-.5c-1 0-1.7-.5-1.7-1.8 0-1.3.8-1.8 1.7-1.8h.5v3.6z"
                    />
                  </svg>
                  Войти с Yandex ID
                </button>
                )}
                <div style={{ display: "flex", alignItems: "center", gap: 14, margin: "20px 0" }}>
                  <span style={{ flex: 1, height: 1, background: "rgba(20,30,45,.1)" }} />
                  <span style={{ font: "500 12.5px 'Golos Text'", color: "#A9B4BF" }}>или по email</span>
                  <span style={{ flex: 1, height: 1, background: "rgba(20,30,45,.1)" }} />
                </div>
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    loginWithCredentials();
                  }}>
                  <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                    <div>
                      <label
                        style={{
                          display: "block",
                          font: "600 13px 'Golos Text'",
                          color: "#1A1C1E",
                          marginBottom: 7,
                        }}>
                        Email
                      </label>
                      <input
                        className="sx-input"
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="you@mail.ru"
                        style={{
                          width: "100%",
                          boxSizing: "border-box",
                          padding: "13px 15px",
                          borderRadius: 12,
                          border: "1px solid #D6DEE9",
                          background: "rgba(255,255,255,.85)",
                          font: "400 15px 'Golos Text'",
                          color: "#1A1C1E",
                          outline: "none",
                        }}
                      />
                    </div>
                    <div>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                          marginBottom: 7,
                        }}>
                        <label style={{ font: "600 13px 'Golos Text'", color: "#1A1C1E" }}>Пароль</label>
                        <button
                          type="button"
                          onClick={() => setAuthView("reset")}
                          style={{
                            font: "500 12.5px 'Golos Text'",
                            color: "#5094F0",
                            cursor: "pointer",
                            background: "none",
                            border: "none",
                            padding: 0,
                          }}>
                          Забыли пароль?
                        </button>
                      </div>
                      <input
                        className="sx-input"
                        type="password"
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••"
                        style={{
                          width: "100%",
                          boxSizing: "border-box",
                          padding: "13px 15px",
                          borderRadius: 12,
                          border: "1px solid #D6DEE9",
                          background: "rgba(255,255,255,.85)",
                          font: "400 15px 'Golos Text'",
                          color: "#1A1C1E",
                          outline: "none",
                        }}
                      />
                    </div>
                  </div>
                  {error && (
                    <div style={{ marginTop: 14, font: "500 13.5px 'Golos Text'", color: "#D14343" }}>
                      {error}
                    </div>
                  )}
                  <button
                    type="submit"
                    disabled={loading}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      width: "100%",
                      boxSizing: "border-box",
                      marginTop: 22,
                      padding: 15,
                      border: "none",
                      borderRadius: 13,
                      background: "linear-gradient(135deg,#66A6FF,#5094F0)",
                      color: "#fff",
                      font: "700 15px 'Golos Text'",
                      cursor: loading ? "default" : "pointer",
                      opacity: loading ? 0.7 : 1,
                      boxShadow: "0 12px 28px rgba(80,148,240,.36)",
                    }}>
                    {loading ? "Входим…" : "Войти"}
                  </button>
                </form>
                <div
                  style={{
                    textAlign: "center",
                    marginTop: 20,
                    font: "400 14px 'Golos Text'",
                    color: "#8E97A4",
                  }}>
                  Нет аккаунта?{" "}
                  <button
                    type="button"
                    onClick={() => {
                      setError(null);
                      setAuthView("register");
                    }}
                    style={{
                      fontWeight: 600,
                      color: "#2F6FD0",
                      background: "none",
                      border: "none",
                      padding: 0,
                      cursor: "pointer",
                      font: "600 14px 'Golos Text'",
                    }}>
                    Зарегистрироваться
                  </button>
                </div>
              </div>
            )}

            {authView === "register" && (
              <div>
                <h3
                  style={{
                    textAlign: "center",
                    font: "800 24px 'Golos Text'",
                    letterSpacing: "-.01em",
                    color: "#1A1C1E",
                    margin: "0 0 6px",
                  }}>
                  Создайте аккаунт
                </h3>
                <p
                  style={{
                    textAlign: "center",
                    font: "400 14.5px 'Golos Text'",
                    color: "#8E97A4",
                    margin: "0 0 26px",
                  }}>
                  Регистрация за минуту — дальше настроим профиль
                </p>
                {hasProvider("google") && (
                <button
                  type="button"
                  onClick={registerWithGoogle}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 11,
                    width: "100%",
                    boxSizing: "border-box",
                    padding: 13,
                    border: "1px solid #D6DEE9",
                    borderRadius: 13,
                    background: "#fff",
                    color: "#1A1C1E",
                    font: "600 14.5px 'Golos Text'",
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
                  Продолжить с Google
                </button>
                )}
                {hasProvider("yandex") && (
                <button
                  type="button"
                  onClick={registerWithYandex}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 11,
                    width: "100%",
                    boxSizing: "border-box",
                    marginTop: 10,
                    padding: 13,
                    border: "1px solid #D6DEE9",
                    borderRadius: 13,
                    background: "#fff",
                    color: "#1A1C1E",
                    font: "600 14.5px 'Golos Text'",
                    cursor: "pointer",
                  }}>
                  <svg width="18" height="18" viewBox="0 0 24 24">
                    <circle cx="12" cy="12" r="12" fill="#FC3F1D" />
                    <path
                      fill="#fff"
                      d="M13.3 6.4h-1.5c-1.9 0-3.3 1.2-3.3 3 0 1.4.7 2.2 2 3.1L8 17.6h1.8l2-3.6h.9v3.6h1.6V6.4h-1zm-1 6.2h-.5c-1 0-1.7-.5-1.7-1.8 0-1.3.8-1.8 1.7-1.8h.5v3.6z"
                    />
                  </svg>
                  Продолжить с Yandex ID
                </button>
                )}
                <div style={{ display: "flex", alignItems: "center", gap: 14, margin: "20px 0" }}>
                  <span style={{ flex: 1, height: 1, background: "rgba(20,30,45,.1)" }} />
                  <span style={{ font: "500 12.5px 'Golos Text'", color: "#8E97A4" }}>или по email</span>
                  <span style={{ flex: 1, height: 1, background: "rgba(20,30,45,.1)" }} />
                </div>
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    registerWithEmail();
                  }}>
                  <label
                    style={{
                      display: "block",
                      font: "600 13px 'Golos Text'",
                      color: "#1A1C1E",
                      marginBottom: 7,
                    }}>
                    Email
                  </label>
                  <input
                    className="sx-input"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@mail.ru"
                    style={{
                      width: "100%",
                      boxSizing: "border-box",
                      padding: "13px 15px",
                      borderRadius: 12,
                      border: "1px solid #D6DEE9",
                      background: "rgba(255,255,255,.85)",
                      font: "400 15px 'Golos Text'",
                      color: "#1A1C1E",
                      outline: "none",
                    }}
                  />
                  {error && (
                    <div style={{ marginTop: 14, font: "500 13.5px 'Golos Text'", color: "#D14343" }}>
                      {error}
                    </div>
                  )}
                  <button
                    type="submit"
                    disabled={loading}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      width: "100%",
                      boxSizing: "border-box",
                      marginTop: 22,
                      padding: 15,
                      border: "none",
                      borderRadius: 13,
                      background: "linear-gradient(135deg,#66A6FF,#5094F0)",
                      color: "#fff",
                      font: "700 15px 'Golos Text'",
                      cursor: loading ? "default" : "pointer",
                      opacity: loading ? 0.7 : 1,
                      boxShadow: "0 12px 28px rgba(80,148,240,.36)",
                    }}>
                    {loading ? "Отправляем…" : "Получить ссылку для входа"}
                  </button>
                </form>
                <div
                  style={{
                    textAlign: "center",
                    marginTop: 20,
                    font: "400 14px 'Golos Text'",
                    color: "#8E97A4",
                  }}>
                  Уже есть аккаунт?{" "}
                  <button
                    type="button"
                    onClick={() => {
                      setError(null);
                      setAuthView("login");
                    }}
                    style={{
                      fontWeight: 600,
                      color: "#2F6FD0",
                      background: "none",
                      border: "none",
                      padding: 0,
                      cursor: "pointer",
                      font: "600 14px 'Golos Text'",
                    }}>
                    Войти
                  </button>
                </div>
              </div>
            )}

            {authView === "reset" && (
              <div>
                <h3
                  style={{
                    textAlign: "center",
                    font: "800 24px 'Golos Text'",
                    letterSpacing: "-.01em",
                    color: "#1A1C1E",
                    margin: "0 0 6px",
                  }}>
                  Восстановление пароля
                </h3>
                <p
                  style={{
                    textAlign: "center",
                    font: "400 14.5px/1.5 'Golos Text'",
                    color: "#8E97A4",
                    margin: "0 0 26px",
                  }}>
                  Введите email — пришлём ссылку для смены пароля
                </p>
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    sendReset();
                  }}>
                  <label
                    style={{
                      display: "block",
                      font: "600 13px 'Golos Text'",
                      color: "#1A1C1E",
                      marginBottom: 7,
                    }}>
                    Email
                  </label>
                  <input
                    className="sx-input"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@mail.ru"
                    style={{
                      width: "100%",
                      boxSizing: "border-box",
                      padding: "13px 15px",
                      borderRadius: 12,
                      border: "1px solid #D6DEE9",
                      background: "rgba(255,255,255,.85)",
                      font: "400 15px 'Golos Text'",
                      color: "#1A1C1E",
                      outline: "none",
                    }}
                  />
                  {error && (
                    <div style={{ marginTop: 14, font: "500 13.5px 'Golos Text'", color: "#D14343" }}>
                      {error}
                    </div>
                  )}
                  <button
                    type="submit"
                    disabled={loading}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      width: "100%",
                      boxSizing: "border-box",
                      marginTop: 22,
                      padding: 15,
                      border: "none",
                      borderRadius: 13,
                      background: "linear-gradient(135deg,#66A6FF,#5094F0)",
                      color: "#fff",
                      font: "700 15px 'Golos Text'",
                      cursor: loading ? "default" : "pointer",
                      opacity: loading ? 0.7 : 1,
                      boxShadow: "0 12px 28px rgba(80,148,240,.36)",
                    }}>
                    {loading ? "Отправляем…" : "Отправить ссылку"}
                  </button>
                </form>
                <div style={{ textAlign: "center", marginTop: 20 }}>
                  <button
                    type="button"
                    onClick={() => setAuthView("login")}
                    style={{
                      font: "600 14px 'Golos Text'",
                      color: "#8E97A4",
                      cursor: "pointer",
                      background: "none",
                      border: "none",
                    }}>
                    ← Вернуться ко входу
                  </button>
                </div>
              </div>
            )}

            {(authView === "sent" || authView === "register-sent") && (
              <div style={{ textAlign: "center" }}>
                <div
                  style={{
                    width: 60,
                    height: 60,
                    borderRadius: "50%",
                    background: "rgba(63,203,110,.15)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    margin: "0 auto 20px",
                    color: "#2FA85A",
                  }}>
                  <svg
                    width="30"
                    height="30"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round">
                    <rect x="3" y="5" width="18" height="14" rx="2.5" />
                    <path d="M3 7l9 6 9-6" />
                  </svg>
                </div>
                <h3
                  style={{
                    font: "800 24px 'Golos Text'",
                    letterSpacing: "-.01em",
                    color: "#1A1C1E",
                    margin: "0 0 8px",
                  }}>
                  Проверьте почту
                </h3>
                <p style={{ font: "400 14.5px/1.55 'Golos Text'", color: "#8E97A4", margin: "0 0 26px" }}>
                  {authView === "register-sent"
                    ? "Мы отправили ссылку для входа на вашу почту. Откройте письмо, чтобы завершить регистрацию и настроить профиль."
                    : "Если аккаунт с таким email существует, мы отправили ссылку для смены пароля. Не пришло — проверьте папку «Спам»."}
                </p>
                <button
                  type="button"
                  onClick={() => setAuthView("login")}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    width: "100%",
                    boxSizing: "border-box",
                    padding: 15,
                    border: "none",
                    borderRadius: 13,
                    background: "linear-gradient(135deg,#66A6FF,#5094F0)",
                    color: "#fff",
                    font: "700 15px 'Golos Text'",
                    cursor: "pointer",
                    boxShadow: "0 12px 28px rgba(80,148,240,.36)",
                  }}>
                  Вернуться ко входу
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// Parse a CSS text snippet (from the prototype) into a React style object.
function cssToObj(css: string): Record<string, string> {
  const obj: Record<string, string> = {};
  for (const rule of css.split(";")) {
    const idx = rule.indexOf(":");
    if (idx === -1) continue;
    const prop = rule
      .slice(0, idx)
      .trim()
      .replace(/-([a-z])/g, (_, c) => c.toUpperCase());
    obj[prop] = rule.slice(idx + 1).trim();
  }
  return obj;
}
