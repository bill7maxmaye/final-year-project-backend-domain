import { BaseDocument } from '@app/common/models/base.model';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

@Schema()
export class UserDocument extends BaseDocument {

  @Prop({ required: true })
  firstName: string;

  @Prop({ required: true })
  lastName: string;

  @Prop({ required: true, unique: true })
  email: string;

  @Prop({ required: true })
  password: string;

  @Prop({ default: 'user' })
  role: string;
}

export const UserSchema = SchemaFactory.createForClass(UserDocument);
