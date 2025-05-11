import { CreateCommentGatewayDto } from '../../gateway/reel/create-comment.gateway.dto';

export class CreateCommentDto {
  constructor(
    readonly id: string,
    readonly body: CreateCommentGatewayDto,
  ) {}

  static fromGatewayRequest(
    id: string,
    body: CreateCommentGatewayDto,
  ): CreateCommentDto {
    return new CreateCommentDto(id, body);
  }
}
