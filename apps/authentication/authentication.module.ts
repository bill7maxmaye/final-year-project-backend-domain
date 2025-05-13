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
  ],
  controllers: [AuthenticationController],
  providers: [AuthenticationService, UserRepository, EmailService],
  exports: [AuthenticationService, UserRepository, EmailService],
})
export class AuthenticationModule {}
