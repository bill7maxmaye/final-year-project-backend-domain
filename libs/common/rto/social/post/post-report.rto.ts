import { PostReportDocument } from '@app/common//models/social/post-report.model';
import { PostRto } from './post.rto';

export class PostReportRto {
  constructor(
    public id: string,
    public contentId: string,
    public reporterId: string | null,
    public mainReason: string,
    public subreason: string | null,
    public status: 'PENDING' | 'REVIEWED' | 'RESOLVED' | 'DISMISSED',
    public resolvedBy: string | null,
    public resolvedAt: Date | null,
    public createdAt: Date,
    public updatedAt: Date,
    public post?: PostRto, // Optional populated post data
  ) {}

  static fromEntity(entity: PostReportDocument): PostReportRto {
    return new PostReportRto(
      entity._id.toString(),
      entity.content_id.toString(),
      entity.reporterId?.toString() ?? null,
      entity.mainReason,
      entity.subreason ?? null,
      entity.status,
      entity.resolvedBy?.toString() ?? null,
      entity.resolvedAt ?? null,
      entity.createdAt,
      entity.updatedAt,
    );
  }
}
