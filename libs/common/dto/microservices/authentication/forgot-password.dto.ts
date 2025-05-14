import { IsString, IsEmail, IsNotEmpty } from 'class-validator';
export class ForgotPasswordDto {
  @IsEmail()
  @IsNotEmpty()
  @IsString()
  email: string;
}
