import { MentionedUser } from '@app/common//entities/reel/mentioned-user.entity';
import { IsOptional, IsString, IsArray, IsNumber } from 'class-validator';

export class UpdateCommentGatewayDto {
  @IsOptional()
  @IsString()
  content?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  mentionedUsers?: MentionedUser[];

  @IsOptional()
  @IsNumber()
  likes?: number;
}
