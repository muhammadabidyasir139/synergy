import { S3Client, PutObjectCommand, DeleteObjectCommand, GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

export const s3Client = new S3Client({
  region: "auto",
  endpoint: process.env.S3_ENDPOINT,
  credentials: {
    accessKeyId: process.env.S3_ACCESS_KEY || "",
    secretAccessKey: process.env.S3_SECRET_KEY || "",
  },
  forcePathStyle: true,
});

export async function uploadToS3(file: File, keyPrefix: string): Promise<string> {
  const buffer = Buffer.from(await file.arrayBuffer());
  const key = `${keyPrefix}/${Date.now()}_${file.name.replace(/\s+/g, "_")}`;

  await s3Client.send(new PutObjectCommand({
    Bucket: process.env.S3_BUCKET_NAME,
    Key: key,
    Body: buffer,
    ContentType: file.type,
  }));

  return `${process.env.S3_ENDPOINT}/${process.env.S3_BUCKET_NAME}/${key}`;
}

function keyFromUrl(url: string): string | null {
  const prefix = `${process.env.S3_ENDPOINT}/${process.env.S3_BUCKET_NAME}/`;
  if (!url.startsWith(prefix)) return null;
  return url.slice(prefix.length);
}

export async function deleteFromS3(url: string): Promise<void> {
  const key = keyFromUrl(url);
  if (!key) return;

  await s3Client.send(new DeleteObjectCommand({
    Bucket: process.env.S3_BUCKET_NAME,
    Key: key,
  }));
}

// The bucket is private, so stored object URLs aren't directly browsable.
// Exchange the stored URL for a short-lived signed GET URL when serving it to clients.
export async function getSignedMediaUrl(url: string): Promise<string> {
  const key = keyFromUrl(url);
  if (!key) return url;

  return getSignedUrl(
    s3Client,
    new GetObjectCommand({ Bucket: process.env.S3_BUCKET_NAME, Key: key }),
    { expiresIn: 3600 }
  );
}
