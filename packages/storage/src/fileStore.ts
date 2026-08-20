import {
  DeleteObjectCommand,
  GetObjectCommand,
  HeadObjectCommand,
  PutObjectCommand,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

import { storageClient } from "./storageClient";

/** Structural, so a caller passes a multer file without a framework type here. */
export interface UploadFile {
  buffer: Buffer;
  size: number;
  mimetype: string;
}

export interface ObjectMetadata {
  contentLength: number;
  contentType: string | undefined;
}

function isMissingObject(error: unknown): boolean {
  if (typeof error !== "object" || error === null) return false;

  const { name, $metadata } = error as {
    name?: string;
    $metadata?: { httpStatusCode?: number };
  };

  return (
    name === "NotFound" ||
    name === "NoSuchKey" ||
    $metadata?.httpStatusCode === 404
  );
}

export const fileStore = {
  async putFile(file: UploadFile, filePath: string): Promise<void> {
    await storageClient.internal.send(
      new PutObjectCommand({
        Bucket: storageClient.bucketName,
        Key: filePath,
        Body: file.buffer,
        ContentLength: file.size,
        ContentType: file.mimetype,
      }),
    );
  },

  async deleteFile(filePath: string): Promise<void> {
    await storageClient.internal.send(
      new DeleteObjectCommand({
        Bucket: storageClient.bucketName,
        Key: filePath,
      }),
    );
  },

  async getFile(filePath: string): Promise<Buffer> {
    const response = await storageClient.internal.send(
      new GetObjectCommand({
        Bucket: storageClient.bucketName,
        Key: filePath,
      }),
    );

    if (!response.Body) {
      throw new Error(`The store returned no body for ${filePath}`);
    }

    return Buffer.from(await response.Body.transformToByteArray());
  },

  async headFile(filePath: string): Promise<ObjectMetadata | null> {
    try {
      const response = await storageClient.internal.send(
        new HeadObjectCommand({
          Bucket: storageClient.bucketName,
          Key: filePath,
        }),
      );

      return {
        contentLength: response.ContentLength ?? 0,
        contentType: response.ContentType,
      };
    } catch (error) {
      if (isMissingObject(error)) return null;
      throw error;
    }
  },

  async getTempUrl(filePath: string, expires: number): Promise<string> {
    return await getSignedUrl(
      storageClient.internal,
      new GetObjectCommand({
        Bucket: storageClient.bucketName,
        Key: filePath,
      }),
      { expiresIn: expires },
    );
  },

  async getUploadUrl(
    filePath: string,
    contentType: string,
    expires: number,
  ): Promise<string> {
    return await getSignedUrl(
      storageClient.presign,
      new PutObjectCommand({
        Bucket: storageClient.bucketName,
        Key: filePath,
        ContentType: contentType,
      }),
      { expiresIn: expires },
    );
  },
};
