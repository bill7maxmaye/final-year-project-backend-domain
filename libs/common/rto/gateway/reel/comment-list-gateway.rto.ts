import { OmitType } from '@nestjs/mapped-types'; // If you are using NestJS, otherwise remove
import { type CommentGatewayRto } from './comment-gateway.rto';
import { CommentListRto } from '../../microservices/reel/comment-list.rto';
import { PaginationResponseRto } from '../../pagination-response.rto';

export class CommentListGatewayRto extends OmitType(CommentListRto, [
  'data',
  'pagination',
] as const) {
  data: CommentGatewayRto[];
  pagination: PaginationResponseRto;

  constructor(
    comments: CommentGatewayRto[],
    pagination: PaginationResponseRto,
  ) {
    super([], 0, 0);
    this.data = comments;
    this.pagination = pagination;
  }

  static fromAggregatedCommentList(
    comments: CommentGatewayRto[],
    pagination: PaginationResponseRto,
  ): CommentListGatewayRto {
    return new CommentListGatewayRto(comments, pagination);
  }
}
