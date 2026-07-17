# Сопоставление экранов прототипа с реальными роутами cal.diy

Прототип — статический макет (`dc-runtime`, без бэкенда). Реализуем визуал поверх этих реальных компонентов, логику не трогаем.

| Прототип (`design-reference/*.dc.html`) | Реальный роут / компонент в cal.diy | Задача |
|---|---|---|
| `Slotix - Кабинет.dc.html` | `apps/web/modules/event-types/views/event-types-listing-view.tsx` | #8 |
| `MeetingsSection.dc.html` («Все встречи») | `apps/web/modules/bookings/` (views/components) | #8 |
| `FormatEditor.dc.html` | Редактор типа события — искать в `apps/web/modules/event-types/views/*edit*` | #9 |
| `CalendarsSection.dc.html` | `apps/web/app/(use-page-wrapper)/settings/(settings-layout)/my-account/calendars` | #9 |
| `IntegrationsSection.dc.html` | `apps/web/app/(use-page-wrapper)/apps/installed` | #9 |
| `BillingSection.dc.html` | Настройки биллинга в `settings/(settings-layout)/` — уточнить точный подпуть при реализации | #9 |
| `SettingsSection.dc.html` | `settings/(settings-layout)/my-account/*` (профиль/настройки) | #9 |
| `Slotix - Онбординг.dc.html` | `apps/web/app/(use-page-wrapper)/getting-started/[[...step]]` | #9 |
| `Slotix - Страница брони.dc.html` | Публичная страница бронирования (booker) | #7 |
| `Slotix - Мобильная бронь.dc.html` | Тот же booker, мобильный брейкпоинт | #7 |
| `Slotix - Публичные экраны.dc.html` | Профиль `/username`, служебные страницы (404, «запись закрыта») | #7 |
| `Slotix - Письма.dc.html` | Email-шаблоны (React Email) — искать `packages/emails/` | #10 |
| `Направления - Бронирование.dc.html` | **Не уточнено** — спросить: отдельный флоу категорий форматов или вариант публичной страницы? | — |

## Извлечённые токены (уже внесены в `packages/coss-ui/src/styles/globals.css`)

- **Акцент:** `#2F6FD0` (primary) / `#5094F0` (accent, интерактив) / `#66A6FF` (ring/hover-glow)
- **Успех/подтверждено:** `#0E8C7F` (совпало с исходной тил-палитрой из ТЗ — сохранено как `--success`)
- **Нейтрали:** текст `#1A1C1E` / `#3E4347`, вторичный `#8E97A4`, бордер `#D1D9E6`
- **Радиус:** 12px доминирует → `--radius: 0.75rem`
- **Стекло:** blur 24–32px, полупрозрачный белый фон, класс `.glass` добавлен в globals.css
- **Тени:** ambient `rgba(20,40,70,.06-.3)`, glow (интерактив) `rgba(80,148,240,.14-.3)`
- **Шрифт:** Golos Text (google font, cyrillic+latin) — подключён в `apps/web/app/layout.tsx` как `--font-sans`

## Ассеты

Скопированы в `apps/web/public/slotix/`: `aurora-bg.png`, `hero-glass.png`, `slotix-logo.png`, `slotix-icon.png`.
