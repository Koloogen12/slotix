import type { AppMeta } from "@calcom/types/App";

export const metadata = {
  name: "Яндекс Телемост",
  description:
    "Яндекс Телемост — видеовстречи без ограничений по времени, до 1000 участников. При бронировании автоматически создаётся ссылка на конференцию.",
  type: "yandextelemost_video",
  categories: ["conferencing"],
  variant: "conferencing",
  logo: "icon.svg",
  publisher: "Slotix",
  url: "https://telemost.yandex.ru/",
  category: "conferencing",
  slug: "yandextelemost",
  title: "Яндекс Телемост",
  email: "help@slotix.neurin.tech",
  appData: {
    location: {
      default: false,
      linkType: "dynamic",
      type: "integrations:yandextelemost",
      label: "Яндекс Телемост",
    },
  },
  dirName: "yandextelemost",
  isOAuth: true,
} as AppMeta;

export default metadata;
