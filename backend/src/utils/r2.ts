import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
} from "@aws-sdk/client-s3";
import type { Env } from "../types/env";

/* ================= UPLOAD ================= */
export async function uploadToR2(
  file: File,
  key: string,
  env: Env
): Promise<string> {
  const client = new S3Client({
    region: "auto",
    endpoint: `https://${env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
    credentials: {
      accessKeyId: env.R2_ACCESS_KEY_ID,
      secretAccessKey: env.R2_SECRET_ACCESS_KEY,
    },
  });

  const buffer = await file.arrayBuffer();

  await client.send(
    new PutObjectCommand({
      Bucket: env.R2_BUCKET_NAME,
      Key: key,
      Body: new Uint8Array(buffer),

      /* 🔥 CRITICAL HEADERS */
      ContentType: file.type,
      ContentDisposition: "inline", // ✅ THIS FIXES PDF VIEW
      CacheControl: "public, max-age=31536000",
    })
  );

  return `${env.R2_PUBLIC_URL}/${key}`;
}

/* ================= DELETE ================= */
export async function deleteFromR2(
  imageUrl: string,
  env: Env
): Promise<void> {
  const key = imageUrl.replace(`${env.R2_PUBLIC_URL}/`, "");

  const client = getR2Client(env);

  await client.send(
    new DeleteObjectCommand({
      Bucket: env.R2_BUCKET_NAME,
      Key: key,
    })
  );
}

/* ================= PRESIGNED URL ================= */
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

export async function getUploadUrl(
  key: string,
  contentType: string,
  env: Env
): Promise<{ uploadUrl: string; publicUrl: string }> {
  const client = getR2Client(env);

  const command = new PutObjectCommand({
    Bucket: env.R2_BUCKET_NAME,
    Key: key,
    ContentType: contentType,
    CacheControl: "public, max-age=31536000",
  });

  const uploadUrl = await getSignedUrl(client, command, { expiresIn: 3600 });
  const publicUrl = `${env.R2_PUBLIC_URL}/${key}`;

  return { uploadUrl, publicUrl };
}

// Helper to reuse client
function getR2Client(env: Env) {
  return new S3Client({
    region: "auto",
    endpoint: `https://${env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
    credentials: {
      accessKeyId: env.R2_ACCESS_KEY_ID,
      secretAccessKey: env.R2_SECRET_ACCESS_KEY,
    },
  });
}
