import { PartialType } from '@nestjs/mapped-types';
import { CreatePostCommentGatewayDto } from './create-comment-gateway.rto';

export class UpdateCommentGatewayDto extends PartialType(
  CreatePostCommentGatewayDto,
) {}
