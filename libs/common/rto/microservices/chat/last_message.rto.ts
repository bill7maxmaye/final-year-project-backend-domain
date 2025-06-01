export class LastMessageRTO {
  constructor(
    public id: string,
    public content: string | null,
    public senderId: string,
    public sentAt: Date,
    public isEdited: boolean,
    public isDeleted: boolean,
    public hasAttachment: boolean,
    public replyTo?: string,
  ) {}

  static fromDocument(doc: any): LastMessageRTO {
    return new LastMessageRTO(
      doc._id?.toString(),
      doc.content ?? null,
      doc.senderId?.toString(),
      doc.createdAt,
      doc.edited ?? false,
      doc.isDeleted ?? false,
      Array.isArray(doc.attachments) && doc.attachments.length > 0,
      doc.replyTo?.toString(),
    );
  }
}
