import { MentionedUser } from '@app/common//entities/reel/mentioned-user.entity';
import { IsNotEmpty, IsString, IsOptional, IsArray } from 'class-validator';

export class CreateCommentGatewayDto {
  @IsNotEmpty()
  @IsString()
  content: string;

  @IsNotEmpty()
  @IsString()
  ownerId: string;

  @IsNotEmpty()
  @IsString()
  targetId: string;

  @IsNotEmpty()
  @IsString()
  onModel: string;

  @IsOptional()
  @IsString()
  parentCommentId?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  mentionedUsers?: MentionedUser[];
}
