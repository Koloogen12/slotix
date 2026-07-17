import type { NextApiRequest, NextApiResponse } from "next";

import { WEBAPP_URL_FOR_OAUTH } from "@calcom/lib/constants";
import { getSafeRedirectUrl } from "@calcom/lib/getSafeRedirectUrl";
import prisma from "@calcom/prisma";

import getInstalledAppPath from "../../_utils/getInstalledAppPath";
import createOAuthAppCredential from "../../_utils/oauth/createOAuthAppCredential";
import { decodeOAuthState } from "../../_utils/oauth/decodeOAuthState";
import { getYandexTelemostAppKeys } from "../lib";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const state = decodeOAuthState(req);
  const { code } = req.query;
  const { client_id, client_secret } = await getYandexTelemostAppKeys();

  const redirectUri = `${WEBAPP_URL_FOR_OAUTH}/api/integrations/yandextelemost/callback`;
  const result = await fetch("https://oauth.yandex.ru/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "authorization_code",
      code: code as string,
      client_id,
      client_secret,
      redirect_uri: redirectUri,
    }),
  });

  const responseBody = await result.json();

  if (result.status !== 200 || responseBody.error) {
    res.status(400).json({ message: responseBody.error_description || responseBody.error || "Yandex OAuth failed" });
    return;
  }

  responseBody.expiry_date = Math.round(Date.now() + responseBody.expires_in * 1000);
  delete responseBody.expires_in;

  const userId = req.session?.user.id;
  if (!userId) {
    return res.status(404).json({ message: "No user found" });
  }

  const existing = await prisma.credential.findMany({
    select: { id: true },
    where: { type: "yandex_telemost_video", userId, appId: "yandex-telemost" },
  });
  const idsToDelete = existing.map((item) => item.id);
  if (idsToDelete.length > 0) {
    await prisma.credential.deleteMany({ where: { id: { in: idsToDelete }, userId } });
  }

  await createOAuthAppCredential(
    { appId: "yandex-telemost", type: "yandex_telemost_video" },
    responseBody,
    req
  );

  res.redirect(
    getSafeRedirectUrl(state?.returnTo) ??
      getInstalledAppPath({ variant: "conferencing", slug: "yandex-telemost" })
  );
}
