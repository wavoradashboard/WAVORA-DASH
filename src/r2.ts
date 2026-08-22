import { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectsCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

const R2_ACCOUNT_ID = (import.meta.env.VITE_R2_ACCOUNT_ID || '26af92aa92f2186d0dfca7f7392cb862').trim();
const R2_ACCESS_KEY_ID = (import.meta.env.VITE_R2_ACCESS_KEY_ID || '686ef4f4dcfa477e4a4d2028fb4f7da1').trim();
const R2_SECRET_ACCESS_KEY = (import.meta.env.VITE_R2_SECRET_ACCESS_KEY || '9ed79089f425e36dff19f8bcf9049247751441806d5c84daceb78ad247248518').trim();
export const R2_BUCKET_NAME = (import.meta.env.VITE_R2_BUCKET_NAME || 'wavoralive').trim();
export const R2_PUBLIC_DOMAIN = (import.meta.env.VITE_R2_PUBLIC_DOMAIN || 'https://pub-2430f3b3d1ef49adb5748b5419f0ab71.r2.dev').trim().replace(/\/+$/, '');

export const isR2Configured = Boolean(R2_ACCOUNT_ID && R2_ACCESS_KEY_ID && R2_SECRET_ACCESS_KEY && R2_BUCKET_NAME);

export const r2Client = new S3Client({
  region: 'auto',
  endpoint: `https://${R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: R2_ACCESS_KEY_ID,
    secretAccessKey: R2_SECRET_ACCESS_KEY,
  },
});

/**
 * Upload a File or Blob directly to Cloudflare R2 bucket
 */
export async function uploadFileToR2(
  storagePath: string,
  file: File | Blob,
  contentType?: string
): Promise<{ key: string; url?: string }> {
  const arrayBuffer = await file.arrayBuffer();
  const uint8Array = new Uint8Array(arrayBuffer);

  const command = new PutObjectCommand({
    Bucket: R2_BUCKET_NAME,
    Key: storagePath,
    Body: uint8Array,
    ContentType: contentType || (file as File).type || 'application/octet-stream',
  });

  await r2Client.send(command);

  let publicUrl: string | undefined = undefined;
  if (R2_PUBLIC_DOMAIN) {
    publicUrl = `${R2_PUBLIC_DOMAIN}/${storagePath}`;
  }

  return { key: storagePath, url: publicUrl };
}

/**
 * Generate a signed or public URL for previewing/streaming an object
 */
export async function getR2FileUrl(storagePath: string, expiresInSeconds: number = 86400): Promise<string> {
  if (!storagePath) return '';
  if (storagePath.startsWith('http://') || storagePath.startsWith('https://') || storagePath.startsWith('blob:') || storagePath.startsWith('data:')) {
    return storagePath;
  }

  // If a public domain is configured (e.g. pub-xxx.r2.dev or custom domain)
  if (R2_PUBLIC_DOMAIN) {
    return `${R2_PUBLIC_DOMAIN}/${storagePath}`;
  }

  try {
    const command = new GetObjectCommand({
      Bucket: R2_BUCKET_NAME,
      Key: storagePath,
    });
    return await getSignedUrl(r2Client, command, { expiresIn: expiresInSeconds });
  } catch (err) {
    console.warn('Failed to generate R2 signed URL for:', storagePath, err);
    return '';
  }
}

/**
 * Delete files from Cloudflare R2
 */
export async function deleteFilesFromR2(storagePaths: string[]): Promise<void> {
  if (!storagePaths.length) return;
  const validKeys = storagePaths.filter(p => p && !p.startsWith('http') && !p.startsWith('blob:'));
  if (!validKeys.length) return;

  try {
    const command = new DeleteObjectsCommand({
      Bucket: R2_BUCKET_NAME,
      Delete: {
        Objects: validKeys.map(Key => ({ Key })),
        Quiet: true,
      },
    });
    await r2Client.send(command);
  } catch (err) {
    console.warn('Failed to delete files from R2:', err);
  }
}
