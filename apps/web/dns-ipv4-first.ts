import dns from "node:dns";

// Only ever imported dynamically from instrumentation.ts behind a NEXT_RUNTIME === "nodejs"
// check — kept in its own file (matching sentry.server.config.ts / sentry.edge.config.ts) so
// Turbopack's edge-runtime bundle analysis never has to resolve `node:dns` directly.
dns.setDefaultResultOrder("ipv4first");
