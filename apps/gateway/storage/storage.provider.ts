import { S3 } from 'aws-sdk';
import { ConfigService } from '@nestjs/config';
import { Provider } from '@nestjs/common';
import { CONFIG_TOKEN } from '@app/common//config/constant/config-token.constant';
import { S3StorageConfig } from '@app/common//config/interfaces/s3-storage-config.interface';
import { S3_PROVIDER } from '@app/common//constant/storage.constants';

export const s3Provider: Provider = {
  provide: S3_PROVIDER,
  useFactory: (configService: ConfigService) => {
    const s3StorageConfig = configService.get<S3StorageConfig>(
      CONFIG_TOKEN.S3_STORAGE,
    );

    if (!s3StorageConfig) {
      throw new Error('S3 Storage configuration not found in ConfigService.');
    }

    return new S3({
      region: s3StorageConfig.region,
      accessKeyId: s3StorageConfig.accessKeyId,
      secretAccessKey: s3StorageConfig.secretAccessKey,
    });
  },
  inject: [ConfigService],
};
