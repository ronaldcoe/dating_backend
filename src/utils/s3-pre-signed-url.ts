import { S3Client, GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

// Create S3 client
const s3Client = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
  }
});

/**
 * Generate a pre-signed URL for S3 object
 * @param bucket S3 bucket name
 * @param key S3 object key
 * @param expiresIn URL expiration time in seconds (default: 1 hour)
 */
export async function generatePresignedUrl(
  bucket: string,
  key: string,
  expiresIn: number = 3600
): Promise<string> {
  const command = new GetObjectCommand({
    Bucket: bucket,
    Key: key,
  });

  return await getSignedUrl(s3Client, command, { expiresIn });
}

/**
 * Extract S3 key from a URL
 * @param url Full S3 URL
 */
export function getKeyFromUrl(url: string): string | null {
  try {
    // For URLs like https://bucket-name.s3.region.amazonaws.com/key/path
    const parts = url.split('.amazonaws.com/');
    if (parts.length > 1) {
      return parts[1];
    }
    return null;
  } catch (error) {
    console.error('Error extracting key from URL:', error);
    return null;
  }
}

/**
 * Generate pre-signed URLs for a photo object
 * @param photo Photo object with S3 URLs
 * @param expiresIn URL expiration time in seconds
 */
export async function generatePhotoUrls(photo: any, expiresIn: number = 3600): Promise<any> {
  const bucket = process.env.AWS_S3_BUCKET || '';
  const result = { ...photo };
  
  if (photo.standardUrl) {
    const standardKey = getKeyFromUrl(photo.standardUrl);
    if (standardKey) {
      result.standardUrl = await generatePresignedUrl(bucket, standardKey, expiresIn);
    }
  }
  
  if (photo.thumbnailUrl) {
    const thumbnailKey = getKeyFromUrl(photo.thumbnailUrl);
    if (thumbnailKey) {
      result.thumbnailUrl = await generatePresignedUrl(bucket, thumbnailKey, expiresIn);
    }
  }
  
  return result;
}