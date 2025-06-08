import { cloudinary } from '@app/common//config/cloudinary.config';
import { ACTION } from '@app/common//enum/action.enum';
import { CONTROLLER } from '@app/common//enum/controller.enum';
import { MICROSERVICE } from '@app/common//enum/microservice.enum';
import { CreateMessageGatewayDto } from '@app/common//rto/gateway/chat/create-message-gateway.dto';
import { UserRto } from '@app/common//rto/microservices/auth/user.rto';
import { AttachmentsRto } from '@app/common//rto/microservices/chat/attachments.rto';
import { MessageRTO } from '@app/common//rto/microservices/chat/message.rto';
import { RecentChatRTO } from '@app/common//rto/microservices/chat/recent_chat.rto';
import { RecentChatGatewayRTO } from '@app/common//rto/microservices/chat/recent_chat_aggregated.rto';
import { Injectable, Logger } from '@nestjs/common';
import { NetworkingService } from '@pp/networking';
import { CreateAttachmentsDto } from 'apps/chat/dtos/create-attachments.dto';
import { CreateMessageDto } from 'apps/chat/dtos/create-chat.dto';
import { UploadApiResponse } from 'cloudinary';
import { Types } from 'mongoose';

@Injectable()
export class ChatService {
  private readonly logger = new Logger(ChatService.name);
  constructor(private readonly networking: NetworkingService) {}

  async createMessage(
    userId: string,
    body: CreateMessageGatewayDto,
    files?: Express.Multer.File[],
  ): Promise<MessageRTO> {
    if (files && files.length > 0) {
      const fileUrls = await this.handleFileUploads(files);
      const createAttachmentsDto = files.map((file, index) => {
        return CreateAttachmentsDto.fromActiveUserAndFile(
          file,
          fileUrls[index],
          new Types.ObjectId(userId),
        );
      });

      const attachments = await this.networking.send<AttachmentsRto[]>(
        `${MICROSERVICE.CHAT}.${CONTROLLER.MESSAGES}.${ACTION.CREATE_MANY}`,
        createAttachmentsDto,
      );

      const createMessageDto = CreateMessageDto.fromGateway(
        body,
        userId,
        attachments.map((attachment) => new Types.ObjectId(attachment.id)),
      );

      const message = await this.networking.send<MessageRTO>(
        `${MICROSERVICE.CHAT}.${CONTROLLER.MESSAGES}.${ACTION.CREATE}`,
        createMessageDto,
      );

      return message;
    }
    const createMessageDto = CreateMessageDto.fromGateway(
      body,
      userId,
      undefined,
    );

    const message = await this.networking.send<MessageRTO>(
      `${MICROSERVICE.CHAT}.${CONTROLLER.MESSAGES}.${ACTION.CREATE}`,
      createMessageDto,
    );

    return message;
  }

  private getFileType(file: Express.Multer.File): string {
    const type = file.mimetype;

    if (type.startsWith('image/')) return 'image';
    if (type === 'application/pdf') return 'pdf';
    if (type.startsWith('video/')) return 'video';
    if (type === 'application/msword' || type.includes('officedocument'))
      return 'doc';

    return 'unknown';
  }

  private async handleFileUploads(
    files?: Express.Multer.File[],
  ): Promise<string[]> {
    if (!files || files.length === 0) return [];

    try {
      return await Promise.all(
        files.map((file) => this.uploadToCloudinary(file)),
      );
    } catch (error) {
      this.logger.error('Error uploading files:', error);
      throw new Error('Failed to upload files');
    }
  }

  private async uploadToCloudinary(file: Express.Multer.File): Promise<string> {
    return new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        { resource_type: 'auto' },
        (error: any, result: UploadApiResponse) => {
          if (error) {
            this.logger.error('Cloudinary upload error:', error);
            return reject(error);
          }
          resolve(result.secure_url);
        },
      );
      stream.end(file.buffer);
    });
  }

  async getRecentChatRto(senderId: string, receiverId: string): Promise<RecentChatGatewayRTO[]> {
    try {
      const recentChats = await this.networking.send<RecentChatRTO[]>(
        `${MICROSERVICE.CHAT}.${CONTROLLER.MESSAGES}.${ACTION.GET_CHAT_LIST}`,
        receiverId,
      );

      const currentUser = await this.networking.send<UserRto>(
        `${MICROSERVICE.AUTHENTICATION}.${CONTROLLER.AUTH}.${ACTION.GET_USER}`,
        receiverId,
      );

      const rtos = await Promise.all(
        recentChats.map(async (chat) => {
          const participantId = chat.participants.find(
            (p) => p.toString() !== receiverId,
          );

          if (!participantId) {
            throw new Error('No valid participant found in chat room');
          }

          const participant = await this.networking.send<UserRto>(
            `${MICROSERVICE.AUTHENTICATION}.${CONTROLLER.AUTH}.${ACTION.GET_USER}`,
            participantId,
          );

          return RecentChatGatewayRTO.fromRecentChatAndUsers(
            chat,
            participant,
            currentUser,
          );
        }),
      );

      return rtos;
    } catch (error) {
      console.error('Error retrieving recent chats:', error);
      throw new Error('Failed to retrieve recent chats');
    }
  }
}
