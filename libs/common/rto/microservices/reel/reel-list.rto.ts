import { Reel } from '@app/common//entities/reel/reel.entity';
import { FindResult } from '../../find-result';
import { PaginationResponseRto } from '../../pagination-response.rto';
import { ReelRto } from './reel.rto';

export class ReelListRto {
  constructor(
    public data: ReelRto[],
    public pagination: PaginationResponseRto,
  ) {}

  static fromFindResult(findResult: FindResult<Reel>): ReelListRto {
    const reelRtos = ReelRto.fromEntities(findResult.data);
    const pagination = new PaginationResponseRto(findResult.total, 1, 10);
    return new ReelListRto(reelRtos, pagination);
  }
}
