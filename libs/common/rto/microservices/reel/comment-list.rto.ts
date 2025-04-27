import { Comment } from '@app/common//entities/reel/comment.entity';
import { CommentRto } from './comment.rto';
import { FindResult } from '../../find-result';
import { PaginationResponseRto } from '../../pagination-response.rto';

export class CommentListRto {
  constructor(
    public data: CommentRto[],
    public pagination: PaginationResponseRto,
  ) {}

  static fromFindResult(findResult: FindResult<Comment>): CommentListRto {
    const commentRtos = CommentRto.fromEntities(findResult.data);
    const pagination = new PaginationResponseRto(findResult.total, 1, 10);
    return new CommentListRto(commentRtos, pagination);
  }
}
