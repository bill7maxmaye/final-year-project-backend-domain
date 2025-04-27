import { Module } from '@nestjs/common';
import { MulterModule } from '@nestjs/platform-express';
import * as multer from 'multer';
import { ConfigModule } from '@nestjs/config';
import { StorageService } from './storage.service';
import { s3Provider } from './storage.provider';

@Module({
  imports: [
    ConfigModule.forRoot(),
    MulterModule.register({
      storage: multer.memoryStorage(),
    }),
  ],
  providers: [StorageService, s3Provider],
  exports: [StorageService],
  controllers: [],
})
export class StorageModule {}
