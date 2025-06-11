import { PaginationOptionsGatewayDto } from '../gateway/pagination-options.gateway.dto';

export class PaginationOptionsDto {
  constructor(
    readonly page: number,
    readonly limit: number,
  ) {}

  static fromGatewayRequest(
    body: PaginationOptionsGatewayDto,
  ): PaginationOptionsDto {
    return new PaginationOptionsDto(body.page, body.limit);
  }
}
