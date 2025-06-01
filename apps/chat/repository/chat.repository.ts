import { BaseRepository } from '@app/common//baseRepository/base-repository';
import { ChatMessageDocument } from '@app/common//models/chat/chat-message.model';
import { ChatRoomDocument } from '@app/common//models/chat/chat-room.model';
import { InjectModel } from '@nestjs/mongoose';
import { Model, PipelineStage, Types } from 'mongoose';

export class ChatRepository extends BaseRepository<ChatRoomDocument> {
  constructor(
    @InjectModel(ChatRoomDocument.name)
    protected readonly chatRoomModel: Model<ChatRoomDocument>,
    @InjectModel(ChatMessageDocument.name)
    private readonly chatMessageModel: Model<ChatMessageDocument>,
  ) {
    super(chatRoomModel);
  }

  async getRecentChats(userId: Types.ObjectId) {
    const matchFilter = {
      participants: userId,
    };

    const pipeline: PipelineStage[] = [
      {
        $lookup: {
          from: 'chat_messages',
          let: { roomId: '$_id' },
          pipeline: [
            {
              $match: {
                $expr: {
                  $eq: ['$roomId', '$$roomId'],
                },
              },
            },
            { $sort: { createdAt: -1 } },
            { $limit: 1 },
          ],
          as: 'lastMessage',
        },
      },
      {
        $lookup: {
          from: 'chat_messages',
          let: { roomId: '$_id' },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $eq: ['$roomId', '$$roomId'] },
                    { $not: { $in: [userId, '$views.viewerId'] } },
                  ],
                },
              },
            },
            { $count: 'unreadCount' },
          ],
          as: 'unreadMeta',
        },
      },
      {
        $project: {
          roomId: '$_id',
          participants: 1,
          lastMessage: { $arrayElemAt: ['$lastMessage', 0] },
          unreadCount: {
            $ifNull: [{ $arrayElemAt: ['$unreadMeta.unreadCount', 0] }, 0],
          },
          updatedAt: {
            $ifNull: [
              { $arrayElemAt: ['$lastMessage.createdAt', 0] },
              '$createdAt',
            ],
          },
        },
      },
      { $sort: { updatedAt: -1 } },
    ];

    return this.aggregateWithPipeline(matchFilter, pipeline);
  }

  async getOrCreateRoom(sender: Types.ObjectId, receiver: Types.ObjectId) {
    const participants = [sender, receiver].sort();
    let room = await this.chatRoomModel.findOne({
      participants: { $all: participants, $size: 2 },
    });

    if (!room) {
      room = await this.chatRoomModel.create({ participants });
    }

    return room;
  }
}
