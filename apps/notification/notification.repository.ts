import { BaseRepository } from '@app/common//baseRepository/base-repository';
import { NotificationDocument } from '@app/common//models/notification/notification.model';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

@Injectable()
export class NotificationRepository extends BaseRepository<NotificationDocument> {
  constructor(
    @InjectModel(NotificationDocument.name)
    protected readonly notificationModel: Model<NotificationDocument>,
  ) {
    super(notificationModel);
  }
}
