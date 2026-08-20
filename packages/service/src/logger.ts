import { AsyncLocalStorage } from "node:async_hooks";
import { inspect } from "node:util";

import { env } from "./env";
import { isAppError } from "./error";

export interface LogContext {
  traceId?: string;
  userId?: string;
  route?: string;
  method?: string;
}

const IDENTITY_KEYS = ["traceId", "userId"] as const;

// Emitted on `http.*` lines only: these describe the transport, not the work,
// and the `traceId` already joins every line back to the `http.request.started`
// that carries them.
const REQUEST_KEYS = ["route", "method"] as const;

const CONTEXT_KEYS = [...IDENTITY_KEYS, ...REQUEST_KEYS] as const;

const isHttpEvent = (event: string) => event.startsWith("http.");

export const loggerStorage = new AsyncLocalStorage<LogContext>();

export const getLogContext = (): LogContext | undefined =>
  loggerStorage.getStore();

export function setLogContext(values: Partial<LogContext>): void {
  const store = loggerStorage.getStore();
  if (store) Object.assign(store, values);
}

export function runWithLogContext<T>(ctx: LogContext, fn: () => T): T {
  return loggerStorage.run({ ...ctx }, fn);
}

export type LogLevel = "debug" | "info" | "warn" | "error";

const LEVEL_RANK: Record<LogLevel, number> = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
};

const IS_PROD = env.NODE_ENV === "production";

const isLogLevel = (value: string | undefined): value is LogLevel =>
  value !== undefined && value in LEVEL_RANK;

const CONFIGURED_LEVEL = env.LOG_LEVEL;
const MIN_LEVEL: number = isLogLevel(CONFIGURED_LEVEL)
  ? LEVEL_RANK[CONFIGURED_LEVEL]
  : IS_PROD
    ? 1
    : 0;

const shouldLog = (level: LogLevel) => LEVEL_RANK[level] >= MIN_LEVEL;

// A credential and the content a user wrote are logged nowhere, ever. Enforced
// here rather than at each call site, because a call site handing over a whole
// row is the exact mistake this has to survive.
const REDACTED_KEYS = new Set([
  "apiKey",
  "authorization",
  "content",
  "cookie",
  "password",
  "secret",
  "text",
  "token",
]);

const MAX_STRING = 500;
const MAX_ARRAY_ITEMS = 50;
const MAX_DEPTH = 4;

function redactionMarker(value: unknown): string {
  if (typeof value === "string") return `[redacted ${value.length} chars]`;
  if (Array.isArray(value)) return `[redacted array(${value.length})]`;
  return "[redacted]";
}

function normalizePrimitive(value: unknown): unknown {
  if (typeof value === "string") {
    return value.length > MAX_STRING
      ? `${value.slice(0, MAX_STRING)}…(+${value.length - MAX_STRING} chars)`
      : value;
  }

  if (typeof value === "bigint") return value.toString();
  if (typeof value === "number" || typeof value === "boolean") return value;
  if (typeof value === "function") return `[function ${value.name || "anon"}]`;
  if (typeof value === "symbol") return value.toString();

  return undefined;
}

function normalizeBuiltIn(value: object, depth: number): unknown {
  if (value instanceof Date) return value.toISOString();
  if (value instanceof Error) return serializeError(value);
  if (value instanceof Set) return normalizeValue([...value], depth);
  if (value instanceof Map) {
    return normalizeValue(Object.fromEntries(value), depth);
  }

  return undefined;
}

function normalizeArray(value: unknown[], depth: number): unknown {
  if (depth >= MAX_DEPTH) return `[array(${value.length})]`;

  const shown = value
    .slice(0, MAX_ARRAY_ITEMS)
    .map((item) => normalizeValue(item, depth + 1));

  return value.length > MAX_ARRAY_ITEMS
    ? [...shown, `…(+${value.length - MAX_ARRAY_ITEMS} more)`]
    : shown;
}

function normalizeObject(value: object, depth: number): unknown {
  if (depth >= MAX_DEPTH) return "[object]";

  const out: Record<string, unknown> = {};
  for (const [key, nested] of Object.entries(value)) {
    if (nested === undefined) continue;
    out[key] = REDACTED_KEYS.has(key)
      ? redactionMarker(nested)
      : normalizeValue(nested, depth + 1);
  }
  return out;
}

function normalizeValue(value: unknown, depth: number): unknown {
  if (value === null || value === undefined) return value;

  if (typeof value !== "object") {
    return normalizePrimitive(value);
  }

  const builtIn = normalizeBuiltIn(value, depth);
  if (builtIn !== undefined) return builtIn;

  if (Array.isArray(value)) return normalizeArray(value, depth);

  return normalizeObject(value, depth);
}

function normalizeData(
  data: Record<string, unknown>,
): Record<string, unknown> | undefined {
  const out: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(data)) {
    if (value === undefined) continue;
    out[key] = REDACTED_KEYS.has(key)
      ? redactionMarker(value)
      : normalizeValue(value, 0);
  }
  return Object.keys(out).length > 0 ? out : undefined;
}

// `userMessage` is display text and may embed what the log must not carry. The
// code and `meta` are the diagnostic parts, so it is dropped here.
const SKIPPED_ERROR_KEYS = new Set(["userMessage"]);

// Read off the error rather than chosen by each call site, because the choice
// was repeated at every boundary and drifted.
function levelForError(err: unknown): LogLevel {
  return isAppError(err) && err.expected ? "warn" : "error";
}

function serializeError(err: unknown): Record<string, unknown> {
  if (!(err instanceof Error)) return { value: normalizeValue(err, 1) };
  const out: Record<string, unknown> = {
    name: err.name,
    message: err.message,
    stack: err.stack,
  };
  for (const key of Object.getOwnPropertyNames(err)) {
    if (SKIPPED_ERROR_KEYS.has(key)) continue;
    if (key in out) continue;
    const value = (err as unknown as Record<string, unknown>)[key];
    out[key] = REDACTED_KEYS.has(key)
      ? redactionMarker(value)
      : normalizeValue(value, 1);
  }
  return out;
}

interface ExtractedMeta {
  error?: Record<string, unknown>;
  data?: Record<string, unknown>;
  durationMs?: number;
}

function extractMeta(meta: unknown): ExtractedMeta {
  if (meta === undefined || meta === null) return {};

  if (meta instanceof Error) return { error: serializeError(meta) };

  if (typeof meta !== "object")
    return { data: { value: normalizeValue(meta, 0) } };

  const {
    err,
    error: errorKey,
    durationMs,
    ...rest
  } = meta as Record<string, unknown>;
  const rawErr = err ?? errorKey;
  const data = normalizeData(rest);

  return {
    ...(rawErr !== undefined ? { error: serializeError(rawErr) } : {}),
    ...(typeof durationMs === "number" ? { durationMs } : {}),
    ...(data ? { data } : {}),
  };
}

const COLOR: Record<LogLevel, string> = {
  debug: "\x1b[36m",
  info: "\x1b[32m",
  warn: "\x1b[33m",
  error: "\x1b[31m",
};
const R = "\x1b[0m";
const D = "\x1b[2m";
const B = "\x1b[1m";

const SEP = ` ${D}|${R} `;

const shortTrace = (traceId: string) => traceId.slice(0, 8);

// Hidden on the console only. Production JSON always carries it.
const DEV_HIDDEN_KEYS = new Set<string>(["userId"]);

function formatValue(value: unknown): string {
  if (value === null) return "null";
  if (typeof value === "string") return value;
  if (typeof value === "number" || typeof value === "boolean")
    return String(value);
  return inspect(value, { depth: 3, breakLength: Infinity });
}

function printDev(
  level: LogLevel,
  ts: string,
  event: string,
  extra: {
    context: LogContext;
    contextKeys: readonly (keyof LogContext)[];
    durationMs?: number;
    data?: Record<string, unknown>;
    error?: Record<string, unknown>;
  },
): void {
  const c = COLOR[level];
  const time = ts.slice(11, 23); // HH:mm:ss.mmm

  const fields: string[] = [];
  for (const key of extra.contextKeys) {
    const value = extra.context[key];
    if (value === undefined || DEV_HIDDEN_KEYS.has(key)) continue;
    fields.push(`${key}=${key === "traceId" ? shortTrace(value) : value}`);
  }
  if (extra.durationMs !== undefined)
    fields.push(`durationMs=${extra.durationMs}`);
  if (extra.data) {
    for (const [key, value] of Object.entries(extra.data)) {
      if (value === undefined) continue;
      fields.push(`${key}=${formatValue(value)}`);
    }
  }

  const line = [
    `${D}${time}${R}`,
    `${c}${B}${level.toUpperCase().padEnd(5)}${R}`,
    `${c}${event}${R}`,
    ...fields.map((field) => `${D}${field}${R}`),
  ].join(SEP);

  const fn =
    level === "error"
      ? console.error
      : level === "warn"
        ? console.warn
        : console.log;
  fn(line);

  if (extra.error) {
    const msg =
      extra.error.stack ?? inspect(extra.error, { depth: 4, colors: true });
    console.error(`${c}${msg as string}${R}`);
  }
}

// Context wins deliberately: it is captured at the start of the request, so it
// holds the accurate value while a late-read duplicate does not.
function dropContextDuplicates(
  data: Record<string, unknown> | undefined,
  store: LogContext,
  emitted: readonly (keyof LogContext)[],
): Record<string, unknown> | undefined {
  if (!data) return undefined;
  const out: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(data)) {
    const isEmitted = (emitted as readonly string[]).includes(key);
    if (isEmitted && store[key as keyof LogContext] !== undefined) continue;
    out[key] = value;
  }
  return Object.keys(out).length > 0 ? out : undefined;
}

function log(level: LogLevel, event: string, meta?: unknown): void {
  if (!shouldLog(level)) return;

  const ts = new Date().toISOString();
  const store = loggerStorage.getStore() ?? {};
  const { error, data: rawData, durationMs } = extractMeta(meta);

  const contextKeys = isHttpEvent(event) ? CONTEXT_KEYS : IDENTITY_KEYS;
  const data = dropContextDuplicates(rawData, store, contextKeys);

  if (IS_PROD) {
    const logObj: Record<string, unknown> = { ts, level, event };
    for (const key of contextKeys) {
      const value = store[key];
      if (value !== undefined) logObj[key] = value;
    }
    if (durationMs !== undefined) logObj.durationMs = durationMs;
    if (data) logObj.data = data;
    if (error) logObj.error = error;
    console.log(JSON.stringify(logObj));
  } else {
    printDev(level, ts, event, {
      context: store,
      contextKeys,
      durationMs,
      data,
      error,
    });
  }
}

export const logger = {
  debug: (event: string, meta?: unknown) => log("debug", event, meta),
  info: (event: string, meta?: unknown) => log("info", event, meta),
  warn: (event: string, meta?: unknown) => log("warn", event, meta),
  error: (event: string, meta?: unknown) => log("error", event, meta),

  failure: (event: string, error: unknown, meta?: Record<string, unknown>) =>
    log(levelForError(error), event, { ...meta, err: error }),
};
