import process from "node:process";
import * as Sentry from "@sentry/nextjs";
import type { Instrumentation } from "next";

export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    // Slotix's Docker network has IPv6 disabled at the network level (no non-loopback IPv6
    // interface in the container), but several third-party APIs we call (e.g. Telegram's
    // api.telegram.org) resolve DNS to an IPv6-only address in this environment. Node's default
    // "verbatim" resolution order then tries that unreachable IPv6 address first, hangs for the
    // full connect timeout (~10-20s), and only sometimes falls back to IPv4 — which made the
    // Telegram webhook handler blow past Telegram's own delivery timeout ("Connection timed
    // out") even though our handler code was fine. Prefer IPv4 results for all outbound DNS
    // lookups process-wide so this class of bug can't recur for any other integration.
    const dns = await import("node:dns");
    dns.setDefaultResultOrder("ipv4first");
  }

  if (process.env.NODE_ENV === "production") {
    if (process.env.NEXT_PUBLIC_SENTRY_DSN && process.env.NEXT_RUNTIME === "nodejs") {
      await import("./sentry.server.config");
    }
    if (process.env.NEXT_PUBLIC_SENTRY_DSN && process.env.NEXT_RUNTIME === "edge") {
      await import("./sentry.edge.config");
    }
  }
}

export const onRequestError: Instrumentation.onRequestError = (err, request, context) => {
  if (process.env.NODE_ENV === "production") {
    Sentry.captureRequestError(err, request, context);
  }
};
