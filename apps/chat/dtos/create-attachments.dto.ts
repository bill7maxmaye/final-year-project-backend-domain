import { Types } from 'mongoose';
export class CreateAttachmentsDto {
  constructor(
    public url: string,
    public type: string,
    public fileName?: string,
    public sizeInBytes?: number,
    public uploadedBy?: Types.ObjectId,
    public uploadedAt?: Date,
  ) {}

  static fromActiveUserAndFile(
    file: Express.Multer.File,
    url: string,
    userId: Types.ObjectId,
  ): CreateAttachmentsDto {
    return new CreateAttachmentsDto(
      url,
      file.mimetype,
      file.originalname,
      file.size,
      userId,
      new Date(),
    );
  }
}
