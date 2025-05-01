import { UpdateReelGatewayDto } from '../../gateway/reel/update-reel.gateway.dto';

export class UpdateReelDto {
  constructor(
    readonly id: string,
    readonly body: UpdateReelGatewayDto,
  ) {}

  static fromGatewayRequest(
    id: string,
    body: UpdateReelGatewayDto,
  ): UpdateReelDto {
    return new UpdateReelDto(id, body);
  }
}
