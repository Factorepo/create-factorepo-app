import { expect, it, vi } from "vitest";

import { trackTimers } from "./leaked-timers";

const PAST_THE_DEADLINE_MS = 60;

function createHost() {
  return {
    setTimeout: globalThis.setTimeout,
    clearTimeout: globalThis.clearTimeout,
  };
}

function afterTheDeadline() {
  return new Promise((resolve) =>
    globalThis.setTimeout(resolve, PAST_THE_DEADLINE_MS),
  );
}

it("cancels a timer that is still pending when the sweep runs", async () => {
  const host = createHost();
  const { sweep } = trackTimers(host);
  const handler = vi.fn();

  host.setTimeout(handler, 10);
  sweep();
  await afterTheDeadline();

  expect(handler).not.toHaveBeenCalled();
});

it("keeps a timer that fires before the sweep, with its arguments", async () => {
  const host = createHost();
  const { sweep } = trackTimers(host);
  const handler = vi.fn();

  host.setTimeout(handler, 1, "kod");
  await vi.waitFor(() => expect(handler).toHaveBeenCalledWith("kod"));
  sweep();

  expect(handler).toHaveBeenCalledTimes(1);
});

it("cancels a timer through clearTimeout", async () => {
  const host = createHost();
  trackTimers(host);
  const handler = vi.fn();

  host.clearTimeout(host.setTimeout(handler, 10));
  await afterTheDeadline();

  expect(handler).not.toHaveBeenCalled();
});
