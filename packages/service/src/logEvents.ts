import { logger } from "./logger";

export const httpLog = {
  requestStarted: (meta: {
    ip?: string;
    userAgent?: string;
    contentLength?: string;
    referer?: string;
  }) => logger.info("http.request.started", meta),

  requestCompleted: (status: number, durationMs: number) =>
    logger[status >= 500 ? "error" : status >= 400 ? "warn" : "info"](
      "http.request.completed",
      { status, durationMs },
    ),

  requestAborted: (durationMs: number) =>
    logger.warn("http.request.aborted", { durationMs }),

  // Status-driven rather than `logger.failure`: anything reaching the global
  // error handler may be a bare framework error, so the resolved status is the
  // only reliable signal for whether it is our fault.
  requestFailed: (
    error: unknown,
    meta: { route: string; method: string; status: number },
  ) =>
    logger[meta.status >= 500 ? "error" : "warn"](
      "http.request.unhandled_error",
      { ...meta, err: error },
    ),
};

export const authLog = {
  sessionUnavailable: (error: unknown) =>
    logger.debug("auth.log_context.session_unavailable", { err: error }),

  apiFailed: (error: unknown) =>
    logger.error("auth.api.failed", { err: error }),
};

export const stageLog = {
  failed: (error: unknown, stage: string) =>
    logger.failure("stage.failed", error, { stage }),
};

export const postLog = {
  listed: (durationMs: number) => logger.info("post.listed", { durationMs }),

  read: (durationMs: number) => logger.info("post.read", { durationMs }),

  created: (durationMs: number) => logger.info("post.created", { durationMs }),

  deleted: (durationMs: number) => logger.info("post.deleted", { durationMs }),
};

export const likeLog = {
  created: (durationMs: number) => logger.info("like.created", { durationMs }),

  deleted: (durationMs: number) => logger.info("like.deleted", { durationMs }),
};
