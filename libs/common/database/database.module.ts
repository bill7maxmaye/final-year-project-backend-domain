import { Module, Logger } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ModelDefinition, MongooseModule } from '@nestjs/mongoose';
import { CONFIG_TOKEN } from '../config/constant/config-token.constant';
import { DatabaseConfig } from '../config/interfaces/database-config.interface';

@Module({
  imports: [
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => {
        const dbConfig = configService.get<DatabaseConfig>(
          CONFIG_TOKEN.DATABASE,
        );
        if (!dbConfig || !dbConfig.uri) {
          throw new Error(
            'MONGODB_URI is not set in the environment variables',
          );
        }
        Logger.log(`Connecting to MongoDB: ${dbConfig.uri}`, 'DatabaseModule');
        return {
          uri: dbConfig.uri,
          connectTimeoutMS: 3000000,
          socketTimeoutMS: 3000000,
        };
      },
      inject: [ConfigService],
    }),
  ],
  exports: [MongooseModule],
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
