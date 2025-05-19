import { UpdateReportGatewayDto } from '../../gateway/reel/update-report.gateway.dto';

export class UpdateReportDto {
  constructor(
    readonly id: string,
    readonly body: UpdateReportGatewayDto,
  ) {}

  static fromGatewayRequest(
    id: string,
    body: UpdateReportGatewayDto,
  ): UpdateReportDto {
    return new UpdateReportDto(id, body);
  }
}
