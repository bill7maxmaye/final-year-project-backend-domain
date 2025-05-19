import { IsOptional, IsString, IsArray, IsNumber } from 'class-validator';

export class UpdateCommentGatewayDto {
  @IsOptional()
  @IsString()
  content?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  mentionedUsers?: string[];

  @IsOptional()
  @IsNumber()
  likes?: number;
}
