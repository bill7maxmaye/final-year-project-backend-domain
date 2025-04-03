import { PostPrivacy } from '@app/common/enum/social/post-privacy.enum';

export class PostRto {
  id: string;
  userId: string;
  content: string;
  mediaUrl?: string;
  privacy?: PostPrivacy;
  isPinned: boolean;
  createdAt: Date;
  updatedAt: Date;

  constructor(partial: Partial<PostRto>) {
    Object.assign(this, partial);
  }
}
