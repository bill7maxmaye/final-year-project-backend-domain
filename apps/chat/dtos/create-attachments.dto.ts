import { Types } from 'mongoose';
import { CreatePostDto } from '@app/common//dto/microservices/social/post/create-post.dto';
import { ACTION } from '@app/common//enum/action.enum';
import { CONTROLLER } from '@app/common//enum/controller.enum';
import { MICROSERVICE } from '@app/common//enum/microservice.enum';
import { PostRto } from '@app/common//rto/social/post/post.rto';
import { Controller, Logger } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { PostService } from './post.service';
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
