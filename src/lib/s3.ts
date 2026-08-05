import { S3Client, PutObjectCommand, DeleteObjectCommand, GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import fs from "fs";
import path from "path";

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
  try {
    if (!process.env.S3_ENDPOINT || !process.env.S3_BUCKET_NAME) {
      throw new Error("S3 config is missing");
    }
    const buffer = Buffer.from(await file.arrayBuffer());
    const key = `${keyPrefix}/${Date.now()}_${file.name.replace(/\s+/g, "_")}`;

    await s3Client.send(new PutObjectCommand({
      Bucket: process.env.S3_BUCKET_NAME,
      Key: key,
      Body: buffer,
      ContentType: file.type,
    }));

    return `${process.env.S3_ENDPOINT}/${process.env.S3_BUCKET_NAME}/${key}`;
  } catch (err) {
    console.warn("[S3 Upload Warning] Saving file to local public/uploads fallback:", err);
    try {
      const buffer = Buffer.from(await file.arrayBuffer());
      const safeName = `${Date.now()}_${file.name.replace(/[^a-zA-Z0-9._-]/g, "_")}`;
      const uploadDir = path.join(process.cwd(), "public", "uploads", keyPrefix);
      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
      }
      const filePath = path.join(uploadDir, safeName);
      fs.writeFileSync(filePath, buffer);
      return `/uploads/${keyPrefix}/${safeName}`;
    } catch (localErr) {
      console.error("[Local File Upload Error]", localErr);
      return `/uploads/${keyPrefix}/default.png`;
    }
  }
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
  try {
    const key = keyFromUrl(url);
    if (!key) return url;

    return await getSignedUrl(
      s3Client,
      new GetObjectCommand({ Bucket: process.env.S3_BUCKET_NAME, Key: key }),
      { expiresIn: 3600 }
    );
  } catch (err) {
    console.error("[S3] getSignedMediaUrl error:", err);
    return url;
  }
}
