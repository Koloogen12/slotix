import { z } from "zod";

import logger from "@calcom/lib/logger";
import { safeStringify } from "@calcom/lib/safeStringify";
import prisma from "@calcom/prisma";
import type { Prisma } from "@calcom/prisma/client";
import type { CalendarEvent } from "@calcom/types/Calendar";
import type { CredentialPayload } from "@calcom/types/Credential";
import type { PartialReference } from "@calcom/types/EventManager";
import type { VideoApiAdapter, VideoCallData } from "@calcom/types/VideoApiAdapter";

import { getYandexTelemostAppKeys } from "./getYandexTelemostAppKeys";

const log = logger.getSubLogger({ prefix: ["app-store/yandextelemost/lib/VideoApiAdapter"] });

const tokenSchema = z.object({
  access_token: z.string(),
  refresh_token: z.string().optional(),
  token_type: z.string().optional(),
  expiry_date: z.number().optional(),
});

const conferenceResultSchema = z.object({
  id: z.string(),
  join_url: z.string(),
});

const TELEMOST_CONFERENCES_URL = "https://cloud-api.yandex.net/v1/telemost-api/conferences";
const YANDEX_TOKEN_URL = "https://oauth.yandex.ru/token";

const YandexTelemostVideoApiAdapter = (credential: CredentialPayload): VideoApiAdapter => {
  let token = tokenSchema.parse(credential.key);

  const refreshAccessToken = async () => {
    if (!token.refresh_token) throw new Error("Yandex Telemost: no refresh token");
    const { client_id, client_secret } = await getYandexTelemostAppKeys();
    const res = await fetch(YANDEX_TOKEN_URL, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        grant_type: "refresh_token",
        refresh_token: token.refresh_token,
        client_id,
        client_secret,
      }),
    });
    const body = await res.json();
    if (!res.ok || body.error) {
      throw new Error(`Yandex Telemost token refresh failed: ${body.error_description || body.error}`);
    }
    const newToken = {
      access_token: body.access_token as string,
      refresh_token: (body.refresh_token as string) ?? token.refresh_token,
      token_type: body.token_type as string,
      expiry_date: Math.round(Date.now() + body.expires_in * 1000),
    };
    token = newToken;
    await prisma.credential.update({
      where: { id: credential.id },
      data: { key: newToken as unknown as Prisma.InputJsonValue },
    });
  };

  const telemostFetch = async (init?: RequestInit, retry = true): Promise<Response> => {
    if (token.expiry_date && token.expiry_date < Date.now() + 5000) {
      await refreshAccessToken();
    }
    const res = await fetch(TELEMOST_CONFERENCES_URL, {
      ...init,
      headers: {
        Authorization: `OAuth ${token.access_token}`,
        "Content-Type": "application/json",
        ...init?.headers,
      },
    });
    if (res.status === 401 && retry) {
      await refreshAccessToken();
      return telemostFetch(init, false);
    }
    return res;
  };

  return {
    // Telemost conferences are instant links, not scheduled meetings — nothing to reconcile.
    getAvailability: async () => [],

    createMeeting: async (event: CalendarEvent): Promise<VideoCallData> => {
      try {
        const res = await telemostFetch({
          method: "POST",
          body: JSON.stringify({ waiting_room_level: "PUBLIC" }),
        });
        const body = await res.json();
        if (!res.ok) {
          throw new Error(`Telemost API error ${res.status}: ${safeStringify(body)}`);
        }
        const result = conferenceResultSchema.parse(body);
        return {
          type: "yandex_telemost_video",
          id: result.id,
          password: "",
          url: result.join_url,
        };
      } catch (err) {
        log.error("Yandex Telemost conference creation failed", safeStringify({ error: safeStringify(err) }));
        throw new Error("Unexpected error creating Yandex Telemost conference");
      }
    },

    // Telemost has no per-conference update; keep the existing link.
    updateMeeting: async (bookingRef: PartialReference): Promise<VideoCallData> => {
      return {
        type: "yandex_telemost_video",
        id: bookingRef.meetingId as string,
        password: bookingRef.meetingPassword || "",
        url: bookingRef.meetingUrl || "",
      };
    },

    // Telemost conference links expire on their own; no delete endpoint is used.
    deleteMeeting: async (): Promise<void> => {
      return Promise.resolve();
    },
  };
};

export default YandexTelemostVideoApiAdapter;
