import { beforeEach, describe, expect, it, vi } from "vitest";

import { isAppError } from "@acme/service";

import type { ApiContext } from "../../index";
import { likeRoutes } from "../../index";

const posts = vi.hoisted(() => ({
  findAllSummaries: vi.fn(),
  findSummaryById: vi.fn(),
  insert: vi.fn(),
  deleteForUser: vi.fn(),
}));

const likes = vi.hoisted(() => ({
  insert: vi.fn(),
  deleteForUser: vi.fn(),
}));

vi.mock("@acme/db/repository", () => ({
  postRepository: posts,
  likeRepository: likes,
}));

const USER = "8c2f0a51-4d3e-4b9c-8a17-5e6d2c9f0b34";
const POST_ID = "3f1c9b62-6f0f-4a4a-9f2a-2f0b6d5f1a11";
const LIKE_ID = "5d7e1f30-9c2b-4e6a-8f31-0a4b7c2d9e18";

const signedIn = (userId: string) =>
  ({ session: { user: { id: userId } } }) as unknown as ApiContext;

const anonymous = { session: null } as unknown as ApiContext;

// Neither like route reads the request, but RouteContext requires one.
const req = new Request("https://example.test/api/likes");

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

describe("likeRoutes.create", () => {
  it("refuses a caller with no session", async () => {
    await expect(
      codeOf(() =>
        likeRoutes.create({ ctx: anonymous, req, params: { id: POST_ID } }),
      ),
    ).resolves.toBe("UNAUTHORIZED");

    expect(likes.insert).not.toHaveBeenCalled();
  });

  // The like used to go straight to the insert, so a missing post reached the
  // foreign key and came back as a 502 for what is plainly a 404.
  it("answers not found when the post does not exist, and never inserts", async () => {
    posts.findSummaryById.mockResolvedValue(null);

    await expect(
      codeOf(() =>
        likeRoutes.create({
          ctx: signedIn(USER),
          req,
          params: { id: POST_ID },
        }),
      ),
    ).resolves.toBe("NOT_FOUND");

    expect(likes.insert).not.toHaveBeenCalled();
  });

  it("takes the user from the session once the post is known to exist", async () => {
    posts.findSummaryById.mockResolvedValue({ id: POST_ID });
    likes.insert.mockResolvedValue({ id: LIKE_ID, postId: POST_ID });

    await expect(
      likeRoutes.create({ ctx: signedIn(USER), req, params: { id: POST_ID } }),
    ).resolves.toEqual({ id: LIKE_ID, postId: POST_ID });

    expect(likes.insert).toHaveBeenCalledWith({
      postId: POST_ID,
      createdBy: USER,
    });
  });
});

describe("likeRoutes.remove", () => {
  it("scopes the delete to the caller", async () => {
    likes.deleteForUser.mockResolvedValue(LIKE_ID);

    await likeRoutes.remove({
      ctx: signedIn(USER),
      req,
      params: { id: LIKE_ID },
    });

    expect(likes.deleteForUser).toHaveBeenCalledWith(LIKE_ID, USER);
  });

  it("answers not found for a like the caller does not own", async () => {
    likes.deleteForUser.mockResolvedValue(null);

    await expect(
      codeOf(() =>
        likeRoutes.remove({
          ctx: signedIn(USER),
          req,
          params: { id: LIKE_ID },
        }),
      ),
    ).resolves.toBe("NOT_FOUND");
  });
});
