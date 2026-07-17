# Slotix — деплой на прод (slotix.neurin.tech)

Turnkey-развёртывание на сервере Selectel (РФ-хостинг, требование 152-ФЗ). Весь стек в Docker: приложение + Postgres + Redis + Caddy (авто-TLS).

## 0. Предпосылки (что нужно от владельца)

| Что | Где взять | Зачем |
|---|---|---|
| Доступ по SSH к серверу Selectel | панель Selectel | развернуть стек |
| DNS `slotix.neurin.tech` → IP сервера | Cloudflare (уже добавлено) | домен + TLS |
| Google OAuth client JSON | Google Cloud Console | вход + календарь + Meet |
| SMTP-креды (Unisender/Mailopost/свой) | у провайдера почты | письма о встречах |

Zoom / Телемост / Telegram-бот — опциональны, подключаются позже (см. раздел 5), на первый запуск не нужны.

## 1. Подготовка сервера (один раз)

```bash
# Docker + compose plugin
curl -fsSL https://get.docker.com | sh
# Проверка
docker --version && docker compose version
```

Рекомендуемые ресурсы: **4 vCPU / 8 ГБ RAM / 40+ ГБ SSD**. Сборка Next.js требует ~6 ГБ RAM (см. `MAX_OLD_SPACE_SIZE`); при 4 ГБ добавьте swap:
```bash
fallocate -l 4G /swapfile && chmod 600 /swapfile && mkswap /swapfile && swapon /swapfile
```

## 2. Код и конфигурация

```bash
git clone git@github.com:Koloogen12/slotix.git
cd slotix/deploy/slotix
cp .env.production.example .env.production

# Сгенерировать секреты прямо в файл:
echo "NEXTAUTH_SECRET=\"$(openssl rand -base64 32)\"" 
echo "CALENDSO_ENCRYPTION_KEY=\"$(openssl rand -base64 24)\""
# → вставить значения в .env.production, заполнить POSTGRES_PASSWORD,
#   DATABASE_URL (тот же пароль), GOOGLE_API_CREDENTIALS, EMAIL_SERVER_*.
```

## 3. Запуск

```bash
docker compose -f docker-compose.prod.yml --env-file .env.production up -d --build
```

Порядок из compose: `database` (healthcheck) → `migrate` (накатывает миграции Prisma, затем выходит) → `app` → `caddy` (получает TLS-сертификат для slotix.neurin.tech).

Первая сборка занимает 10–20 минут (сборка монорепо). Логи:
```bash
docker compose -f docker-compose.prod.yml logs -f app
```

## 4. Проверка

```bash
curl -I https://slotix.neurin.tech        # ожидаем 200/307
```
Открыть в браузере, зарегистрировать аккаунт, создать формат встречи, забронировать со второго устройства — проверить, что приходит письмо и создаётся событие в Google-календаре с Meet-ссылкой.

> **Cloudflare**: если проксирование (оранжевое облако) включено — поставить SSL/TLS mode **Full (strict)**. Иначе (серое облако) Caddy сам выпустит публичный сертификат.

## 5. Опциональные интеграции (после первого запуска)

- **Zoom**: создать OAuth-приложение в Zoom Marketplace, вписать `ZOOM_CLIENT_ID/SECRET` в `.env.production`, `docker compose ... up -d app` — модуль уже в коде.
- **Яндекс Телемост**: приложение на oauth.yandex.ru → `YANDEX_CLIENT_ID/SECRET`. (Модуль app-store — см. `packages/app-store/yandextelemost`.)
- **Telegram-бот**: токен от @BotFather → `TELEGRAM_BOT_TOKEN`.

## 6. Обновления

```bash
git pull origin main
docker compose -f docker-compose.prod.yml --env-file .env.production up -d --build
```
`migrate` накатит новые миграции автоматически перед стартом `app`.

## 7. Бэкапы (настроить сразу)

```bash
# Ежедневный дамп БД (cron)
docker compose -f docker-compose.prod.yml exec -T database \
  pg_dump -U slotix slotix | gzip > /backups/slotix-$(date +%F).sql.gz
```
Хранить дампы на отдельном диске/хранилище. Брони терять нельзя.
