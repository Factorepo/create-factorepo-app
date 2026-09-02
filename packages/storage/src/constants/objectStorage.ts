export const OBJECT_RETENTION_DAYS = 1;

export const OBJECT_RETENTION_RULE_ID = `expire-uploads-after-${OBJECT_RETENTION_DAYS}-day`;

export const OBJECT_CORS_ORIGINS = ["http://localhost:3000"] as const;

export const OBJECT_CORS_METHODS = ["PUT", "GET", "HEAD"] as const;

export const OBJECT_CORS_HEADERS = ["*"] as const;

export const OBJECT_CORS_EXPOSE_HEADERS = ["ETag"] as const;

export const OBJECT_CORS_MAX_AGE_SECONDS = 3000;

export const DEFAULT_OBJECT_BUCKET = "default";

export const DEFAULT_OBJECT_REGION = "garage";
