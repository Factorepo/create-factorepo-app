import { AppError, isAppError, stageLog } from "@acme/service";

export type StageEvent = (durationMs: number) => void;

export async function stage<TResult>(
  name: string,
  event: StageEvent,
  run: () => Promise<TResult>,
): Promise<TResult> {
  const startedAt = Date.now();

  try {
    const result = await run();
    event(Date.now() - startedAt);
    return result;
  } catch (error) {
    const failure = isAppError(error) ? error : AppError.upstream(name, error);
    stageLog.failed(failure, name);
    throw failure;
  }
}
