interface TimerHost {
  setTimeout: typeof globalThis.setTimeout;
  clearTimeout: typeof globalThis.clearTimeout;
}

type TimerId = ReturnType<typeof globalThis.setTimeout>;

export function trackTimers(host: TimerHost): { sweep: () => void } {
  const pending = new Set<TimerId>();
  const schedule = host.setTimeout;
  const cancel = host.clearTimeout;

  host.setTimeout = ((
    handler: (...args: unknown[]) => void,
    delay?: number,
    ...args: unknown[]
  ) => {
    const id: TimerId = schedule(
      (...called: unknown[]) => {
        pending.delete(id);
        handler(...called);
      },
      delay,
      ...args,
    );
    pending.add(id);
    return id;
  }) as typeof globalThis.setTimeout;

  host.clearTimeout = ((id?: TimerId) => {
    if (id !== undefined) pending.delete(id);
    cancel(id);
  }) as typeof globalThis.clearTimeout;

  return {
    sweep() {
      for (const id of pending) cancel(id);
      pending.clear();
    },
  };
}
