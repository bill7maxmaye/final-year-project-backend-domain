import { Types } from 'mongoose';

export class BaseEntity {
  constructor(
    public id: string,
    public createdAt: Date,
    public updatedAt: Date,
    public createdBy?: string,
    public updatedBy?: string,
  ) {}

  protected static getIdFromDocument(
    document: Types.ObjectId | { _id: Types.ObjectId },
  ): string {
    return this.isId(document)
      ? document.toHexString()
      : document._id.toHexString();
  }

  protected static getEntityFromDocument<T>(
    document: Types.ObjectId | T,
    entityFactory: (document_: T) => any,
  ): any {
    return this.isId(document) ? undefined : entityFactory(document);
  }

  protected static isId(document: any): document is Types.ObjectId {
    return document instanceof Types.ObjectId;
  }
}
