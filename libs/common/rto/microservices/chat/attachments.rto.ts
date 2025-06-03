import { ChatAttachment } from '@app/common//entities/chat/chat-attachment.entity';

export class AttachmentsRto {
  constructor(
    public id: string,
    public url: string,
    public type: string,
    public fileName?: string,
    public sizeInBytes?: number,
    public uploadedBy?: string,
    public uploadedAt?: Date,
  ) {}

  static fromEntity(entity: ChatAttachment): AttachmentsRto {
    return new AttachmentsRto(
      entity.id,
      entity.url,
      entity.type,
      entity.fileName,
      entity.sizeInBytes,
      entity.uploadedBy,
      entity.uploadedAt,
    );
  }

  static fromEntities(entities: any[]): AttachmentsRto[] {
    return entities.map((entity) => AttachmentsRto.fromEntity(entity));
  }
}
