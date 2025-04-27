import { CreateLikeGatewayDto } from '../../gateway/reel/create-like.gateway.dto';

export class CreateLikeDto {
  constructor(
    readonly id: string,
    readonly body: CreateLikeGatewayDto,
  ) {}

  static fromGatewayRequest(
    id: string,
    body: CreateLikeGatewayDto,
  ): CreateLikeDto {
    return new CreateLikeDto(id, body);
  }
}
