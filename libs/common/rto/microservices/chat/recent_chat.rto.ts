import { Types } from 'mongoose';
import { LastMessageRTO } from './last_message.rto';

export class RecentChatRTO {
  constructor(
    public roomId: string,
    public participants: Types.ObjectId[],
    public unreadCount: number,
    public updatedAt: Date,
    public lastMessage?: LastMessageRTO,
  ) {}

  static fromAggregatedResult(doc: any): RecentChatRTO {
    return new RecentChatRTO(
      doc.roomId.toString(),
      doc.participants,
      doc.unreadCount ?? 0,
      doc.updatedAt ?? doc.lastMessage?.createdAt ?? new Date(),
      doc.lastMessage
        ? LastMessageRTO.fromDocument(doc.lastMessage)
        : undefined,
    );
  }

  static fromAggregatedResults(docs: any[]): RecentChatRTO[] {
    return docs.map((doc) => this.fromAggregatedResult(doc));
  }
}
