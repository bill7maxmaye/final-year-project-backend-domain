import {
  IsOptional,
  IsString,
  IsBoolean,
  IsNumber,
  IsArray,
  IsEnum,
} from 'class-validator';
import { ReelPrivacy } from '../../../enum/reel/reel-visibility.enum';
import { MentionedUser } from '@app/common//entities/reel/mentioned-user.entity';

export class UpdateReelGatewayDto {
  @IsOptional()
  @IsString()
  videoURL?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsBoolean()
  isPremiumContent?: boolean;

  @IsOptional()
  @IsNumber()
  duration?: number;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  mentionedUsers?: MentionedUser[];

  @IsOptional()
  @IsEnum(ReelPrivacy)
  privacy?: ReelPrivacy;

  @IsOptional()
  @IsBoolean()
  allowComments?: boolean;

  @IsOptional()
  @IsBoolean()
  allowSaveToDevice?: boolean;

  @IsOptional()
  @IsBoolean()
  saveWithWatermark?: boolean;

  @IsOptional()
  @IsBoolean()
  audienceControlUnder18?: boolean;

  @IsOptional()
  @IsNumber()
  likes?: number;

  @IsOptional()
  @IsNumber()
  comments?: number;

  @IsOptional()
  @IsNumber()
  favoriteCount?: number;

  @IsOptional()
  @IsNumber()
  shareCount?: number;
}
