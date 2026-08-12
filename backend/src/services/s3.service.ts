import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { env } from '../config/env';
import { ApiError } from '../utils/apiError';

export const uploadToS3 = async (
  file: Express.Multer.File,
  productId: number
): Promise<string> => {
  const { awsRegion, awsBucket, awsAccessKeyId, awsSecretAccessKey } = env;

  if (!awsRegion || !awsBucket || !awsAccessKeyId || !awsSecretAccessKey) {
    throw new ApiError(
      500,
      'AWS S3 is not configured. Please set AWS_REGION, AWS_S3_BUCKET, AWS_ACCESS_KEY_ID, and AWS_SECRET_ACCESS_KEY in environment.'
    );
  }

  const s3Client = new S3Client({
    region: awsRegion,
    credentials: {
      accessKeyId: awsAccessKeyId,
      secretAccessKey: awsSecretAccessKey,
    },
  });

  const fileExtension = file.originalname.split('.').pop() || 'jpg';
  const key = `products/${productId}/${Date.now()}-${Math.random().toString(36).substring(2, 8)}.${fileExtension}`;

  const command = new PutObjectCommand({
    Bucket: awsBucket,
    Key: key,
    Body: file.buffer,
    ContentType: file.mimetype,
  });

  await s3Client.send(command);

  // Return standard public S3 URL
  return `https://${awsBucket}.s3.${awsRegion}.amazonaws.com/${key}`;
};
