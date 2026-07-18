import type { GetTokenParams } from "next-auth/jwt";
import { getToken } from "next-auth/jwt";

type ReadonlyHeaders = Awaited<ReturnType<typeof import("next/headers").headers>>;
type ReadonlyRequestCookies = Awaited<ReturnType<typeof import("next/headers").cookies>>;

/**
 * This is a slimmed down version of the `getServerSession` function from
 * `next-auth`.
 *
 * Instead of requiring the entire options object for NextAuth, we create
 * a compatible session using information from the incoming token.
 *
 * The downside to this is that we won't refresh sessions if the users
 * token has expired (30 days). This should be fine as we call `/auth/session`
 * frequently enough on the client-side to keep the session alive.
 */
export const getLocale = async (
  req:
    | GetTokenParams["req"]
    | {
        cookies: ReadonlyRequestCookies;
        headers: ReadonlyHeaders;
      }
): Promise<string> => {
  const token = await getToken({
    req: req as GetTokenParams["req"],
  });

  const tokenLocale = token?.["locale"];

  if (tokenLocale) {
    return tokenLocale;
  }

  // Slotix ships to a single (RU) market. For anonymous visitors (no stored
  // user/session locale), always default to "ru" instead of sniffing the
  // browser's Accept-Language header — that header is unreliable (e.g. many
  // Russian users run their OS/browser chrome in English) and upstream
  // Cal.com's behavior of falling back to "en" produced an all-English first
  // run. Logged-in users keep whatever locale they've explicitly set
  // (handled by the tokenLocale branch above).
  return "ru";
};
