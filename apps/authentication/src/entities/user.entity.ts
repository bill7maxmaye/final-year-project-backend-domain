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

  @Prop({ type: String })
  phone?: string;

  @Prop({ type: String })
  gender?: string;

  @Prop({ type: String, default: '' })
  profilePic: string;

  @Prop({ type: Date })
  lastLogin: Date;

  @Prop({ type: Date })
  dob?: Date;

  @Prop({ type: String, default: '' })
  bio: string;

  @Prop({ type: [String] })
  preferences: string[];

  @Prop({ type: String, required: false })
  verificationCode?: string;

  @Prop({ type: Boolean, default: false })
  isVerified: boolean;

  @Prop({ type: String, default: 'inactive' })
  status: string;
}

export const UserSchema = SchemaFactory.createForClass(UserDocument);
