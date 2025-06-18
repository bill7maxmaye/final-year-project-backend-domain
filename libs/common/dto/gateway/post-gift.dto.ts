import { IsNotEmpty, IsString, IsOptional } from 'class-validator';

export class PostGiftDto {
  @IsNotEmpty()
  @IsString()
  recipientId: string;

  @IsNotEmpty()
  @IsString()
  senderId: string;

  @IsOptional()
  @IsString()
  star?: string;
}
