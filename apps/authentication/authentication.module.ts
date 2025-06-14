import { Module } from '@nestjs/common';
// import {
//   UserDocument,
//   UserSchema,
// } from 'apps/authentication/models/user.model';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthenticationController } from './authentication.controller';
import { AuthenticationService } from './authentication.service';
import { MongooseModule } from '@nestjs/mongoose';
import {
  UserDocument,
  UserSchema,
} from '@app/common//models/authentication/user.model';
import { UserRepository } from '@app/common//baseRepository/userRepository/user.repository';
import { EmailService } from './email.service';
import { StorageModule } from 'apps/gateway/storage/storage.module';
import { s3Provider } from 'apps/gateway/storage/storage.provider';
import s3StorageConfig from '@app/common//config/s3-storage.config';

// import { DatabaseModule } from 'libs/common';
@Module({
  // imports: [
  //   ConfigModule.forRoot({
  //     isGlobal: true,
  //   }),
  //   // DatabaseModule.forFeature([
  //   //   { name: UserDocument.name, schema: UserSchema },
  //   // ]),
  // ],
  imports: [
    ConfigModule.forRoot({
      load: [s3StorageConfig],
      isGlobal: true,
    }),
    MongooseModule.forFeature([
      { name: UserDocument.name, schema: UserSchema },
    ]),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        uri: configService.get<string>('MONGODB_URI'),
      }),
      inject: [ConfigService],
    }),
    StorageModule,
  ],
  controllers: [AuthenticationController],
  providers: [AuthenticationService, UserRepository, EmailService, s3Provider],
  exports: [AuthenticationService, UserRepository, EmailService],
})
export class AuthenticationModule {}
