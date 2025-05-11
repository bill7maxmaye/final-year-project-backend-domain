import { IsString, IsEmail, IsNotEmpty } from 'class-validator';
export class ResetPasswordDto {
  @IsEmail()
  @IsNotEmpty()
  @IsString()
  email: string;

  @IsNotEmpty()
  @IsString()
  resetCode: string;

  @IsNotEmpty()
  @IsString()
  newPassword: string;
}
