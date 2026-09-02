import { beforeEach, describe, expect, it, vi } from "vitest";

const constants = vi.hoisted(() => ({ expoConfig: null as unknown }));

vi.mock("expo-constants", () => ({ default: constants }));

import { getBaseUrl } from "~/utils/base-url";

beforeEach(() => {
  constants.expoConfig = null;
});

describe("getBaseUrl", () => {
  it("points at the Metro host on the port the web app serves", () => {
    constants.expoConfig = { hostUri: "192.168.1.24:8081" };

    expect(getBaseUrl()).toBe("http://192.168.1.24:3000");
  });

  // A build carries no debugger host, and a silent fallback to localhost would
  // send every request on the device to the device itself.
  it("throws rather than guessing when there is no debugger host", () => {
    constants.expoConfig = {};

    expect(() => getBaseUrl()).toThrowError(/production server/);
  });

  it("throws when expoConfig is absent altogether", () => {
    expect(() => getBaseUrl()).toThrowError(/production server/);
  });
});
