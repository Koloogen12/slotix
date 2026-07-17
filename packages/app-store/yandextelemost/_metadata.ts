import type { AppMeta } from "@calcom/types/App";

export const metadata = {
  linkType: "dynamic",
  name: "Яндекс Телемост",
  description:
    "Яндекс Телемост — видеовстречи без ограничений по времени. После бронирования ссылка на конференцию создаётся автоматически.",
  type: "yandex_telemost_video",
  categories: ["conferencing"],
  variant: "conferencing",
  logo: "icon.svg",
  publisher: "Slotix",
  url: "https://telemost.yandex.ru/",
  category: "conferencing",
  slug: "yandex-telemost",
  title: "Яндекс Телемост",
  email: "help@slotix.neurin.tech",
  appData: {
    location: {
      default: false,
      linkType: "dynamic",
      type: "integrations:yandex_telemost",
      label: "Яндекс Телемост",
    },
  },
  dirName: "yandextelemost",
  isOAuth: true,
} as AppMeta;

export default metadata;
