import { Types } from 'mongoose';
import { MentionedUserDocument } from '../../models/reel/mentioned-user.model';

export class MentionedUser {
  constructor(
    public userId: Types.ObjectId,
    public username: string,
  ) {}

  static fromDocument(document: MentionedUserDocument): MentionedUser {
    return new MentionedUser(document.userId, document.username);
  }

  static fromDocuments(documents: MentionedUserDocument[]): MentionedUser[] {
    return documents.map((document) => MentionedUser.fromDocument(document));
  }
}
