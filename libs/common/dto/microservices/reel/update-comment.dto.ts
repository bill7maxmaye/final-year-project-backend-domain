import { UpdateCommentGatewayDto } from '../../gateway/reel/update-comment.gateway.dto';

export class UpdateCommentDto {
  constructor(
    readonly id: string,
    readonly body: UpdateCommentGatewayDto,
  ) {}

  static fromGatewayRequest(
    id: string,
    body: UpdateCommentGatewayDto,
  ): UpdateCommentDto {
    return new UpdateCommentDto(id, body);
  }
}
