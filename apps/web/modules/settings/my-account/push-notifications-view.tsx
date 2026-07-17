"use client";

import { useWebPush } from "@calcom/web/modules/notifications/hooks/useWebPush";
import SettingsHeader from "@calcom/features/settings/appDir/SettingsHeader";
import { useLocale } from "@calcom/lib/hooks/useLocale";
import { Button } from "@calcom/ui/components/button";
import { showToast } from "@calcom/ui/components/toast";
import { useState } from "react";

const PushNotificationsView = () => {
  const { t } = useLocale();
  const { subscribe, unsubscribe, isSubscribed, isLoading } = useWebPush();
  const [telegramLoading, setTelegramLoading] = useState(false);

  // Slotix: link Telegram — fetch a one-tap deep link and open the bot to complete linking.
  const connectTelegram = async () => {
    setTelegramLoading(true);
    try {
      const res = await fetch("/api/integrations/telegram/connect");
      const data = await res.json();
      if (res.ok && data.url) {
        window.open(data.url, "_blank", "noopener,noreferrer");
      } else {
        showToast(t("something_went_wrong"), "error");
      }
    } catch {
      showToast(t("something_went_wrong"), "error");
    } finally {
      setTelegramLoading(false);
    }
  };

  return (
    <SettingsHeader
      title={t("push_notifications")}
      description={t("push_notifications_description")}
      borderInShellHeader={true}>
      <div className="border-subtle flex flex-col items-start gap-3 rounded-b-xl border-x border-b px-4 pb-10 pt-8 sm:px-6">
        <Button color="primary" onClick={isSubscribed ? unsubscribe : subscribe} disabled={isLoading}>
          {isSubscribed ? t("disable_browser_notifications") : t("allow_browser_notifications")}
        </Button>
        <Button
          color="secondary"
          StartIcon="send"
          onClick={connectTelegram}
          loading={telegramLoading}
          disabled={telegramLoading}>
          Подключить Telegram для уведомлений
        </Button>
      </div>
    </SettingsHeader>
  );
};

export default PushNotificationsView;
