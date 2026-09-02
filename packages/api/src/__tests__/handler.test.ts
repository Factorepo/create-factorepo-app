import { beforeEach, describe, expect, it, vi } from "vitest";

import type { Auth } from "@acme/auth";
import { AppError } from "@acme/service";

import type { ApiErrorBody } from "../index";
import { apiRoute, corsPreflight, webhookRoute } from "../index";

vi.mock("@acme/db/repository", () => ({
  postRepository: {},
  likeRepository: {},
}));

const getSession = vi.hoisted(() => vi.fn());
const auth = { api: { getSession } } as unknown as Auth;

const TRACE = "11111111-2222-4333-8444-555555555555";

const post = (init?: RequestInit) =>
  new Request("https://example.test/api/posts", { method: "POST", ...init });

beforeEach(() => {
  vi.clearAllMocks();
  getSession.mockResolvedValue(null);
});

describe("corsPreflight", () => {
  it("answers 204 with the allowed methods and no body", async () => {
    const res = corsPreflight();

    expect(res.status).toBe(204);
    expect(res.headers.get("Access-Control-Allow-Methods")).toContain("DELETE");
    await expect(res.text()).resolves.toBe("");
  });
});

describe("apiRoute", () => {
  it("returns the handler result as JSON with status 200", async () => {
    const res = await apiRoute(auth, () => Promise.resolve({ ok: true }))(
      post(),
    );

    expect(res.status).toBe(200);
    expect(res.headers.get("content-type")).toBe("application/json");
    await expect(res.json()).resolves.toEqual({ ok: true });
  });

  it("echoes an incoming trace id rather than inventing one", async () => {
    const res = await apiRoute(auth, () => Promise.resolve(null))(
      post({ headers: { "x-trace-id": TRACE } }),
    );

    expect(res.headers.get("x-trace-id")).toBe(TRACE);
  });

  it("puts a generated trace id on a request that carries none", async () => {
    const res = await apiRoute(auth, () => Promise.resolve(null))(post());

    expect(res.headers.get("x-trace-id")).toMatch(/^[0-9a-f-]{36}$/);
  });

  it("awaits the route segment params and hands them to the handler", async () => {
    const handler = vi.fn().mockResolvedValue(null);

    await apiRoute(auth, handler)(post(), {
      params: Promise.resolve({ id: "42" }),
    });

    expect(handler).toHaveBeenCalledWith(
      expect.objectContaining({ params: { id: "42" } }),
    );
  });

  // The wire carries five codes and the application error carries nine, so the
  // ones a client cannot act on differently collapse while the status stays
  // accurate. Nothing exercised that mapping before.
  it.each([
    ["badRequest", AppError.badRequest("no"), 400, "BAD_REQUEST"],
    ["unauthorized", AppError.unauthorized(), 401, "UNAUTHORIZED"],
    ["forbidden", AppError.forbidden(), 403, "FORBIDDEN"],
    ["notFound", AppError.notFound("gone"), 404, "NOT_FOUND"],
    ["conflict", AppError.conflict("clash"), 409, "BAD_REQUEST"],
    ["payloadTooLarge", AppError.payloadTooLarge("big"), 413, "BAD_REQUEST"],
    [
      "upstream",
      AppError.upstream("db", new Error("x")),
      502,
      "INTERNAL_SERVER_ERROR",
    ],
    ["internal", AppError.internal("boom"), 500, "INTERNAL_SERVER_ERROR"],
  ])(
    "maps %s to status %i and wire code %s",
    async (_name, error, status, code) => {
      const res = await apiRoute(auth, () => Promise.reject(error))(post());
      const body = (await res.json()) as ApiErrorBody;

      expect(res.status).toBe(status);
      expect(body.error.code).toBe(code);
    },
  );

  it("carries the field errors of a rejected input onto the wire", async () => {
    const failure = AppError.badRequest("Invalid input.", {
      fieldErrors: { title: ["Too short"] },
    });

    const res = await apiRoute(auth, () => Promise.reject(failure))(post());
    const body = (await res.json()) as ApiErrorBody;

    expect(body.error.fieldErrors).toEqual({ title: ["Too short"] });
  });

  it("turns an unrecognised throw into a 500 and never leaks its message", async () => {
    const res = await apiRoute(auth, () =>
      Promise.reject(new Error("connection string: postgres://secret")),
    )(post());
    const body = (await res.json()) as ApiErrorBody;

    expect(res.status).toBe(500);
    expect(body.error.message).not.toContain("postgres://");
  });

  // The client hanging up is logged as an abort, not as a completed request, so
  // a disconnect never shows up in the latency numbers as a fast success.
  it("settles an aborted request without failing the response", async () => {
    const controller = new AbortController();
    const req = new Request("https://example.test/api/posts", {
      method: "POST",
      signal: controller.signal,
    });
    controller.abort();

    const res = await apiRoute(auth, () => Promise.resolve({ ok: true }))(req);

    expect(res.status).toBe(200);
  });

  it("answers 500 when the session cannot be read", async () => {
    getSession.mockRejectedValue(new Error("auth is down"));

    const res = await apiRoute(auth, () => Promise.resolve(null))(post());

    expect(res.status).toBe(500);
  });
});

describe("webhookRoute", () => {
  it("hands the handler the raw body and never reads a session", async () => {
    const handler = vi.fn().mockResolvedValue("ok");
    const raw = '{"event":"transaction.completed"}';

    const res = await webhookRoute(handler)(post({ body: raw }));

    expect(res.status).toBe(200);
    expect(handler).toHaveBeenCalledWith(
      expect.objectContaining({ body: raw }),
    );
    expect(getSession).not.toHaveBeenCalled();
  });

  it("turns an unrecognised throw into a 500 rather than leaking it", async () => {
    const res = await webhookRoute(() =>
      Promise.reject(new Error("paddle sdk exploded")),
    )(post({ body: "{}" }));

    expect(res.status).toBe(500);
  });

  it("answers 400 when the signature check throws", async () => {
    const res = await webhookRoute(() =>
      Promise.reject(AppError.badRequest("Invalid webhook signature")),
    )(post({ body: "{}" }));

    expect(res.status).toBe(400);
  });
});
