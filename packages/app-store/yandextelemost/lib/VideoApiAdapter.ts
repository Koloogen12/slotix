import logger from "@calcom/lib/logger";
import { safeStringify } from "@calcom/lib/safeStringify";
import type { CalendarEvent } from "@calcom/types/Calendar";
import type { CredentialPayload } from "@calcom/types/Credential";
import type { PartialReference } from "@calcom/types/EventManager";
import type { VideoApiAdapter, VideoCallData } from "@calcom/types/VideoApiAdapter";
import { z } from "zod";
import { metadata } from "../_metadata";

const log = logger.getSubLogger({ prefix: ["app-store/yandextelemost/lib/VideoApiAdapter"] });

// Yandex Telemost stores the OAuth token object in credential.key.
// @link https://yandex.ru/dev/id/doc/ru/tokens/token-obtain
const telemostTokenSchema = z.object({
  access_token: z.string(),
  refresh_token: z.string().optional(),
  expiry_date: z.number().optional(),
});

// @link https://yandex.ru/dev/telemost/doc/ru/conference-create
const telemostConferenceSchema = z.object({
  id: z.string(),
  join_url: z.string(),
  live_stream: z.object({ watch_url: z.string() }).optional(),
});

const CONFERENCES_ENDPOINT = "https://cloud-api.yandex.net/v1/telemost-api/conferences";

const YandexTelemostVideoApiAdapter = (credential: CredentialPayload): VideoApiAdapter => {
  const getAccessToken = () => {
    const parsed = telemostTokenSchema.safeParse(credential.key);
    if (!parsed.success) {
      throw new Error("Invalid Yandex Telemost credential: no access_token");
    }
    return parsed.data.access_token;
  };

  const createConference = async (): Promise<VideoCallData> => {
    const accessToken = getAccessToken();
    const response = await fetch(CONFERENCES_ENDPOINT, {
      method: "POST",
      headers: {
        Authorization: `OAuth ${accessToken}`,
        "Content-Type": "application/json",
      },
      // Public link so any invitee can join; no waiting room by default.
      body: JSON.stringify({ access_level: "PUBLIC" }),
    });

    if (response.status !== 201) {
      const text = await response.clone().text();
      log.error("Failed to create Telemost conference", safeStringify({ status: response.status, text }));
      throw new Error(`Unable to create Yandex Telemost conference (status ${response.status})`);
    }

    const conference = telemostConferenceSchema.parse(await response.json());
    return {
      type: metadata.type,
      id: conference.id,
      password: "",
      url: conference.join_url,
    };
  };

  return {
    // Telemost creates a fresh conference link; it has no per-meeting scheduling.
    createMeeting: async (_event: CalendarEvent): Promise<VideoCallData> => createConference(),

    // Telemost has no update endpoint — issue a new conference link.
    updateMeeting: async (_bookingRef: PartialReference, _event: CalendarEvent): Promise<VideoCallData> =>
      createConference(),

    // Telemost API exposes no delete/cancel endpoint (as of 2026-07);
    // the link simply becomes unused when the booking is cancelled.
    deleteMeeting: async (): Promise<unknown> => Promise.resolve(),

    // Telemost has no busy-time API; availability comes from the calendar integration.
    getAvailability: async () => Promise.resolve([]),
  };
};

export default YandexTelemostVideoApiAdapter;
