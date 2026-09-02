import { S3Client } from "@aws-sdk/client-s3";

import {
  DEFAULT_OBJECT_BUCKET,
  DEFAULT_OBJECT_REGION,
} from "./constants/objectStorage";
import { env } from "./env";

function build(storageUrl: string): S3Client {
  const url = new URL(storageUrl);

  return new S3Client({
    endpoint: `${url.protocol}//${url.host}`,
    region: url.searchParams.get("region") ?? DEFAULT_OBJECT_REGION,
    credentials: {
      accessKeyId: decodeURIComponent(url.username),
      secretAccessKey: decodeURIComponent(url.password),
    },
    forcePathStyle: true,
    // Garage rejects the SDK default CRC32 checksum. Left on, it bakes a
    // checksum of an empty body into a presigned PUT URL, which then fails when
    // the browser uploads the real bytes.
    requestChecksumCalculation: "WHEN_REQUIRED",
    responseChecksumValidation: "WHEN_REQUIRED",
  });
}

function readBucketName(storageUrl: string): string {
  return (
    new URL(storageUrl).searchParams.get("bucket") ?? DEFAULT_OBJECT_BUCKET
  );
}

export const storageClient = {
  // Carries every call between this process and the store.
  internal: build(env.STORAGE_URL),
  // Signs the URLs the browser opens, so its host must be browser-reachable.
  presign: build(env.STORAGE_PUBLIC_URL),
  bucketName: readBucketName(env.STORAGE_URL),
};
