import type { LifecycleRule } from "@aws-sdk/client-s3";
import {
  CreateBucketCommand,
  GetBucketLifecycleConfigurationCommand,
  HeadBucketCommand,
  PutBucketCorsCommand,
  PutBucketLifecycleConfigurationCommand,
} from "@aws-sdk/client-s3";

import {
  OBJECT_CORS_EXPOSE_HEADERS,
  OBJECT_CORS_HEADERS,
  OBJECT_CORS_MAX_AGE_SECONDS,
  OBJECT_CORS_METHODS,
  OBJECT_CORS_ORIGINS,
  OBJECT_RETENTION_DAYS,
  OBJECT_RETENTION_RULE_ID,
} from "./constants/objectStorage";
import { env } from "./env";
import { storageClient } from "./storageClient";

const retentionRule: LifecycleRule = {
  ID: OBJECT_RETENTION_RULE_ID,
  Status: "Enabled",
  // Garage rejects the deprecated `Prefix` member on the rule itself. An empty
  // prefix inside `Filter` is how you name every object in the bucket.
  Filter: { Prefix: "" },
  Expiration: { Days: OBJECT_RETENTION_DAYS },
  AbortIncompleteMultipartUpload: {
    DaysAfterInitiation: OBJECT_RETENTION_DAYS,
  },
};

function isMissingBucket(error: unknown): boolean {
  const { name, $metadata } = error as {
    name?: string;
    $metadata?: { httpStatusCode?: number };
  };

  return name === "NotFound" || $metadata?.httpStatusCode === 404;
}

function isMissingLifecycle(error: unknown): boolean {
  const { name, $metadata } = error as {
    name?: string;
    $metadata?: { httpStatusCode?: number };
  };

  return (
    name === "NoSuchLifecycleConfiguration" || $metadata?.httpStatusCode === 404
  );
}

function unreachable(error: unknown): Error {
  const { protocol, host } = new URL(env.STORAGE_URL);

  return new Error(
    `Failed to reach storage endpoint ${protocol}//${host}. ` +
      `Check STORAGE_URL host, port, and protocol.`,
    { cause: error },
  );
}

function isCurrent(rule: LifecycleRule): boolean {
  return (
    rule.Status === "Enabled" &&
    rule.Expiration?.Days === OBJECT_RETENTION_DAYS &&
    rule.AbortIncompleteMultipartUpload?.DaysAfterInitiation ===
      OBJECT_RETENTION_DAYS
  );
}

// One rule per origin. Garage joins several `AllowedOrigins` with a comma, and
// the browser then rejects the header.
function corsRules() {
  return OBJECT_CORS_ORIGINS.map((origin: string) => ({
    AllowedOrigins: [origin],
    AllowedMethods: [...OBJECT_CORS_METHODS],
    AllowedHeaders: [...OBJECT_CORS_HEADERS],
    ExposeHeaders: [...OBJECT_CORS_EXPOSE_HEADERS],
    MaxAgeSeconds: OBJECT_CORS_MAX_AGE_SECONDS,
  }));
}

async function readRules(): Promise<LifecycleRule[]> {
  try {
    const response = await storageClient.internal.send(
      new GetBucketLifecycleConfigurationCommand({
        Bucket: storageClient.bucketName,
      }),
    );
    return response.Rules ?? [];
  } catch (error) {
    if (isMissingLifecycle(error)) return [];
    throw error;
  }
}

async function readBucket(): Promise<boolean> {
  try {
    await storageClient.internal.send(
      new HeadBucketCommand({ Bucket: storageClient.bucketName }),
    );
    return true;
  } catch (error) {
    // Only an absent bucket is answerable by creating one. A refused
    // connection, the wrong protocol, or a bad name would throw again on
    // CreateBucket with an opaque trace, so name the endpoint here instead.
    if (isMissingBucket(error)) return false;
    throw unreachable(error);
  }
}

export const bucketSetup = {
  async ensureBucket(): Promise<void> {
    if (await readBucket()) return;

    await storageClient.internal.send(
      new CreateBucketCommand({ Bucket: storageClient.bucketName }),
    );
  },

  async applyCors(): Promise<void> {
    await storageClient.internal.send(
      new PutBucketCorsCommand({
        Bucket: storageClient.bucketName,
        CORSConfiguration: { CORSRules: corsRules() },
      }),
    );
  },

  async applyRetention(): Promise<void> {
    // `PutBucketLifecycleConfiguration` replaces the whole configuration, so a
    // blind write destroys every rule added out of band. Read first, keep each
    // rule that is not ours, and write only when ours drifted.
    const rules = await readRules();
    const current = rules.find((rule) => rule.ID === OBJECT_RETENTION_RULE_ID);

    if (current && isCurrent(current)) return;

    await storageClient.internal.send(
      new PutBucketLifecycleConfigurationCommand({
        Bucket: storageClient.bucketName,
        LifecycleConfiguration: {
          Rules: [
            ...rules.filter((rule) => rule.ID !== OBJECT_RETENTION_RULE_ID),
            retentionRule,
          ],
        },
      }),
    );
  },
};
