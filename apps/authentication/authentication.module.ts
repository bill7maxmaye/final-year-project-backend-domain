import { Module } from '@nestjs/common';
// import {
//   UserDocument,
//   UserSchema,
// } from 'apps/authentication/models/user.model';
import { ConfigModule } from '@nestjs/config';
import { AuthenticationController } from './authentication.controller';
import { AuthenticationService } from './authentication.service';

// import { DatabaseModule } from 'libs/common';
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    // DatabaseModule.forFeature([
    //   { name: UserDocument.name, schema: UserSchema },
    // ]),
  ],
  controllers: [AuthenticationController],
  providers: [AuthenticationService],
  exports: [AuthenticationService],
})
export class AuthenticationModule {}
