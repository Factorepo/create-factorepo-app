import { describe, expect, it } from "vitest";

import { GET } from "../route";

describe("the health route", () => {
  it("answers a probe with ok", async () => {
    const response = GET();

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toBe("ok");
  });
});
