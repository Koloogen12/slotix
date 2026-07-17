import { stringify } from "node:querystring";
import { WEBAPP_URL_FOR_OAUTH } from "@calcom/lib/constants";
import { getSafeRedirectUrl } from "@calcom/lib/getSafeRedirectUrl";
import prisma from "@calcom/prisma";
import type { NextApiRequest, NextApiResponse } from "next";
import getInstalledAppPath from "../../_utils/getInstalledAppPath";
import createOAuthAppCredential from "../../_utils/oauth/createOAuthAppCredential";
import { decodeOAuthState } from "../../_utils/oauth/decodeOAuthState";
import { getYandexTelemostAppKeys } from "../lib";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const state = decodeOAuthState(req);
  const { code } = req.query;
  const { client_id, client_secret } = await getYandexTelemostAppKeys();

  const userId = req.session?.user.id;
  if (!userId) {
    return res.status(404).json({ message: "No user found" });
  }

  // @link https://yandex.ru/dev/id/doc/ru/codes/code-url#token
  const result = await fetch("https://oauth.yandex.ru/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: stringify({
      grant_type: "authorization_code",
      code: code as string,
      client_id,
      client_secret,
    }),
  });

  if (result.status !== 200) {
    let errorMessage = "Something is wrong with the Yandex OAuth API";
    try {
      errorMessage = (await result.json()).error_description ?? errorMessage;
    } catch (_e) {
      errorMessage = await result.clone().text();
    }
    return res.status(400).json({ message: errorMessage });
  }

  const responseBody = await result.json();
  if (responseBody.error) {
    return res.status(400).json({ message: responseBody.error });
  }

  responseBody.expiry_date = Math.round(Date.now() + responseBody.expires_in * 1000);
  delete responseBody.expires_in;

  const existing = await prisma.credential.findMany({
    select: { id: true },
    where: { type: "yandextelemost_video", userId, appId: "yandextelemost" },
  });
  const idsToDelete = existing.map((item) => item.id);
  if (idsToDelete.length > 0) {
    await prisma.credential.deleteMany({ where: { id: { in: idsToDelete }, userId } });
  }

  await createOAuthAppCredential(
    { appId: "yandextelemost", type: "yandextelemost_video" },
    responseBody,
    req
  );

  res.redirect(
    getSafeRedirectUrl(state?.returnTo) ??
      getInstalledAppPath({ variant: "conferencing", slug: "yandextelemost" })
  );
}
