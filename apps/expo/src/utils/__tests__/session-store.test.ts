import { beforeEach, describe, expect, it, vi } from "vitest";

const secureStore = vi.hoisted(() => ({
  getItem: vi.fn(),
  setItem: vi.fn(),
  deleteItemAsync: vi.fn(),
}));

vi.mock("expo-secure-store", () => secureStore);

import { deleteToken, getToken, setToken } from "~/utils/session-store";

// The three calls address one row in the keychain by a string. Nothing
// type-checks that they agree, so a test is the only thing holding them.
const KEY = "session_token";

beforeEach(() => {
  vi.clearAllMocks();
});

describe("the session store", () => {
  it("reads the token under the shared key", () => {
    secureStore.getItem.mockReturnValue("abc");

    expect(getToken()).toBe("abc");
    expect(secureStore.getItem).toHaveBeenCalledWith(KEY);
  });

  it("writes the token under the same key it reads", () => {
    setToken("abc");

    expect(secureStore.setItem).toHaveBeenCalledWith(KEY, "abc");
  });

  it("deletes the token under the same key again", async () => {
    await deleteToken();

    expect(secureStore.deleteItemAsync).toHaveBeenCalledWith(KEY);
  });
});
