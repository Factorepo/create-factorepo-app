import { beforeEach, describe, expect, it, vi } from "vitest";

import { isAppError } from "@acme/service";

import type { ApiContext } from "../../index";
import { postRoutes } from "../../index";

const repo = vi.hoisted(() => ({
  findAllSummaries: vi.fn(),
  findSummaryById: vi.fn(),
  insert: vi.fn(),
  deleteForUser: vi.fn(),
}));

vi.mock("@acme/db/repository", () => ({
  postRepository: repo,
  likeRepository: { insert: vi.fn(), deleteForUser: vi.fn() },
}));

const AUTHOR = "8c2f0a51-4d3e-4b9c-8a17-5e6d2c9f0b34";
const IMPOSTOR = "1a1a1a1a-2b2b-4c4c-8d8d-9e9e9e9e9e9e";
const POST_ID = "3f1c9b62-6f0f-4a4a-9f2a-2f0b6d5f1a11";

const row = {
  id: POST_ID,
  title: "The install step fails",
  content: "The pipeline stops before it runs a test.",
  createdBy: AUTHOR,
  updatedBy: null,
  createdAt: new Date("2026-08-19T00:00:00.000Z"),
  updatedAt: null,
  likeCount: 2,
};

const signedIn = (userId: string) =>
  ({ session: { user: { id: userId } } }) as unknown as ApiContext;

const anonymous = { session: null } as unknown as ApiContext;

// A read route never touches the request, but RouteContext requires one.
const anyRequest = new Request("https://example.test/api/posts");

const jsonRequest = (body: unknown) =>
  new Request("https://example.test/api/posts", {
    method: "POST",
    body: JSON.stringify(body),
  });

// A route method that is not `async` throws before it returns a promise, so the
// call itself has to sit inside the try. `apiRoute` wraps both the same way.
const codeOf = async (run: () => Promise<unknown>) => {
  try {
    await run();
    return "no error thrown";
  } catch (error) {
    return isAppError(error) ? error.code : `not an AppError: ${String(error)}`;
  }
};

beforeEach(() => {
  vi.clearAllMocks();
});

describe("postRoutes.list", () => {
  it("returns every summary with its dates as ISO strings", async () => {
    repo.findAllSummaries.mockResolvedValue([row]);

    await expect(postRoutes.list()).resolves.toEqual([
      { ...row, createdAt: "2026-08-19T00:00:00.000Z", updatedAt: null },
    ]);
  });
});

describe("postRoutes.byId", () => {
  it("rejects an id that is not a uuid before it reaches the repository", async () => {
    await expect(
      codeOf(() =>
        postRoutes.byId({
          ctx: anonymous,
          req: anyRequest,
          params: { id: "not-a-uuid" },
        }),
      ),
    ).resolves.toBe("BAD_REQUEST");

    expect(repo.findSummaryById).not.toHaveBeenCalled();
  });

  it("answers not found for a post that does not exist", async () => {
    repo.findSummaryById.mockResolvedValue(null);

    await expect(
      codeOf(() =>
        postRoutes.byId({
          ctx: anonymous,
          req: anyRequest,
          params: { id: POST_ID },
        }),
      ),
    ).resolves.toBe("NOT_FOUND");
  });
});

describe("postRoutes.create", () => {
  it("refuses a caller with no session", async () => {
    await expect(
      codeOf(() =>
        postRoutes.create({
          ctx: anonymous,
          req: jsonRequest({ title: "t", content: "c" }),
          params: {},
        }),
      ),
    ).resolves.toBe("UNAUTHORIZED");

    expect(repo.insert).not.toHaveBeenCalled();
  });

  it("takes createdBy from the session and ignores what the body claims", async () => {
    repo.insert.mockResolvedValue(row);

    await postRoutes.create({
      ctx: signedIn(AUTHOR),
      req: jsonRequest({
        title: row.title,
        content: row.content,
        createdBy: IMPOSTOR,
      }),
      params: {},
    });

    expect(repo.insert).toHaveBeenCalledWith({
      title: row.title,
      content: row.content,
      createdBy: AUTHOR,
    });
  });
});

describe("the stage boundary", () => {
  // api.md § 5.4 — an exception at the boundary becomes an upstream error, so a
  // raw driver failure never reaches the caller as itself.
  it("turns a raw repository failure into an upstream error", async () => {
    repo.findAllSummaries.mockRejectedValue(new Error("connection refused"));

    await expect(codeOf(() => postRoutes.list())).resolves.toBe(
      "UPSTREAM_FAILURE",
    );
  });

  it("rejects a body that is not JSON before it reaches the schema", async () => {
    const req = new Request("https://example.test/api/posts", {
      method: "POST",
      body: "not json",
    });

    await expect(
      codeOf(() =>
        postRoutes.create({ ctx: signedIn(AUTHOR), req, params: {} }),
      ),
    ).resolves.toBe("BAD_REQUEST");
  });
});

describe("postRoutes.remove", () => {
  it("scopes the delete to the caller", async () => {
    repo.deleteForUser.mockResolvedValue(POST_ID);

    await postRoutes.remove({
      ctx: signedIn(AUTHOR),
      req: anyRequest,
      params: { id: POST_ID },
    });

    expect(repo.deleteForUser).toHaveBeenCalledWith(POST_ID, AUTHOR);
  });

  it("answers not found, never forbidden, for a post the caller does not own", async () => {
    repo.deleteForUser.mockResolvedValue(null);

    await expect(
      codeOf(() =>
        postRoutes.remove({
          ctx: signedIn(IMPOSTOR),
          req: anyRequest,
          params: { id: POST_ID },
        }),
      ),
    ).resolves.toBe("NOT_FOUND");
  });
});
