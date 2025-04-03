import { IsBoolean, IsEnum, IsOptional, IsString } from 'class-validator';
import { PostPrivacy } from '@app/common/enum/social/post-privacy.enum';

export class UpdatePostDto {
  @IsOptional()
  @IsString()
  content?: string;

  @IsOptional()
  @IsString()
  mediaUrl?: string;

  @IsOptional()
  @IsEnum(PostPrivacy)
  privacy?: PostPrivacy;

  @IsOptional()
  @IsBoolean()
  isPinned?: boolean;
}
