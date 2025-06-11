import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Schema as MongooseSchema, Types } from 'mongoose';
import { BaseDocument, BaseSchema } from '../base.model';
import { NotificationType } from '../../enum/notification/notification-type.enum';

@Schema({ collection: 'notifications' })
export class NotificationDocument extends BaseDocument {
  @Prop({ type: MongooseSchema.Types.ObjectId, required: true })
  receiverId: Types.ObjectId;

  @Prop({ type: [MongooseSchema.Types.ObjectId] })
  senders: Types.ObjectId[];

  @Prop({ type: String, required: true })
  message: string;

  @Prop({ type: String, enum: NotificationType, required: true })
  type: NotificationType;

  @Prop({ type: [Types.ObjectId] })
  entityIds: Types.ObjectId[];

  @Prop({ type: Boolean })
  isRead: boolean;
}

const NotificationSchema = SchemaFactory.createForClass(NotificationDocument);
NotificationSchema.add(BaseSchema);
export { NotificationSchema as NotificationSchema };
