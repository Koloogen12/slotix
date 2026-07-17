import { z } from "zod";
import getAppKeysFromSlug from "../../_utils/getAppKeysFromSlug";

const yandexTelemostAppKeysSchema = z.object({
  client_id: z.string(),
  client_secret: z.string(),
});

export const getYandexTelemostAppKeys = async () => {
  const appKeys = await getAppKeysFromSlug("yandextelemost");
  return yandexTelemostAppKeysSchema.parse(appKeys);
};
