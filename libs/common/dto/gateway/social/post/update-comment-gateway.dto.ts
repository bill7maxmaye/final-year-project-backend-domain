import { PartialType } from '@nestjs/mapped-types';
import { CreatePostCommentGatewayDto } from './create-comment-gateway.rto';
import { IsArray, IsOptional, IsString } from 'class-validator';

export class UpdateCommentGatewayDto extends PartialType(
  CreatePostCommentGatewayDto,
) {
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  transcription_keywords?: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  transcription_named_entities?: string[];

  @IsOptional()
  @IsString()
  transcription_text?: string;

  @IsOptional()
  @IsString()
  transcription_label?: string;

  @IsOptional()
  @IsString()
  transcription_sentiment?: string;
}
