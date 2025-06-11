import { OmitType } from '@nestjs/mapped-types';
import { type ReelGatewayRto } from './reel-gateway.rto';
import { PaginationResponseRto } from '../../pagination-response.rto';
import { ReelListRto } from '../../microservices/reel/reel-list.rto';

export class ReelListGatewayRto extends OmitType(ReelListRto, [
  'data',
  'pagination',
] as const) {
  data: ReelGatewayRto[];
  pagination: PaginationResponseRto;

  constructor(reels: ReelGatewayRto[], pagination: PaginationResponseRto) {
    super([], 0, 0);
    this.data = reels;
    this.pagination = pagination;
  }

  static fromAggregatedReelList(
    reels: ReelGatewayRto[],
    pagination: PaginationResponseRto,
  ): ReelListGatewayRto {
    return new ReelListGatewayRto(reels, pagination);
  }
}
