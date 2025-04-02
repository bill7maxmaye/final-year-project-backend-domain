import { Module, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ModelDefinition, MongooseModule } from '@nestjs/mongoose';
import { ConfigModule } from '../config';

@Module({
  imports: [
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => {
        const uri = configService.get<string>('MONGODB_URI');
        if (!uri) {
          throw new Error('MONGODB_URI is not set in the environment variables');
        }
        Logger.log(`Connecting to MongoDB: ${uri}`, 'DatabaseModule');
        return {
          uri,
          connectTimeoutMS: 3000000,
          socketTimeoutMS: 3000000,
        };
      },
      inject: [ConfigService],
    }),
  ],
  exports: [MongooseModule], // Crucial: Export MongooseModule
})
export class DatabaseModule {
  static forFeature(models: ModelDefinition[]) {
    return {
      module: DatabaseModule,
      imports: [MongooseModule.forFeature(models)],
      exports: [MongooseModule],
    };
  }
}