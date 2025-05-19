import { CreateReportGatewayDto } from '../../gateway/reel/create-report.gateway.dto';

export class CreateReportDto {
  constructor(
    readonly reporterId: string,
    readonly body: CreateReportGatewayDto,
  ) {}

  static fromGatewayRequest(
    reporterId: string,
    body: CreateReportGatewayDto,
  ): CreateReportDto {
    return new CreateReportDto(reporterId, body);
  }
}
