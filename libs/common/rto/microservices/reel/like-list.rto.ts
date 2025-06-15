import { Like } from '@app/common//entities/reel/like.entity';
import { PaginationResponseRto } from '../../pagination-response.rto';
import { LikeRto } from './like.rto';
import { FindResult } from '../../find-result';

export class LikeListRto {
  constructor(
    public data: LikeRto[],
    public pagination: PaginationResponseRto,
  ) {}

  static fromFindResult(findResult: FindResult<Like>): LikeListRto {
    const likeRtos = LikeRto.fromEntities(findResult.data);
    const pagination = new PaginationResponseRto(findResult.total, 1, 10);
    return new LikeListRto(likeRtos, pagination);
  }
}
