import { MessageViewDocument } from '../../models/chat/message-view.model';

export class MessageView {
  constructor(
    public viewerId: string,
    public viewedAt: Date,
  ) {}

  static fromDocument(doc: MessageViewDocument): MessageView {
    return new MessageView(doc.viewerId.toString(), doc.viewedAt);
  }

  static fromDocuments(docs: MessageViewDocument[]): MessageView[] {
    return docs.map((doc) => MessageView.fromDocument(doc));
  }
}
