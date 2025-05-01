import {
  IsNotEmpty,
  IsString,
  IsBoolean,
  IsNumber,
  IsArray,
  IsEnum,
  IsOptional,
} from 'class-validator';
import { ReelPrivacy } from '../../../enum/reel/reel-visibility.enum';
import { MentionedUser } from '@app/common//entities/reel/mentioned-user.entity';

export class CreateReelGatewayDto {
  // @IsNotEmpty()
  // videoFile: any;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsBoolean()
  isPremiumContent?: boolean;

  @IsNotEmpty()
  @IsNumber()
  duration: number;

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
}
