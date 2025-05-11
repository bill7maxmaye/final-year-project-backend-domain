import { registerAs } from '@nestjs/config';
import { CONFIG_TOKEN } from './constant/config-token.constant';
import { S3StorageConfig } from './interfaces/s3-storage-config.interface';

export default registerAs(
  CONFIG_TOKEN.S3_STORAGE,
  (): S3StorageConfig => ({
    region: process.env.AWS_REGION!,
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
    bucketName: process.env.AWS_S3_BUCKET!,
  }),
);
