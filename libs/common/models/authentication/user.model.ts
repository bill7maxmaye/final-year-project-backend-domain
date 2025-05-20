import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { BaseDocument, BaseSchema } from '../base.model';

export enum UserStatus {
  INACTIVE = 'inactive',
  ACTIVE = 'active',
  PENDING = 'pending',
  SUSPENDED = 'suspended',
}

@Schema({ collection: 'users' })
export class UserDocument extends BaseDocument {
  @Prop({ type: String, required: true })
  firstName: string;

  @Prop({ type: String, required: true })
  lastName: string;

  @Prop({ type: String, required: true, unique: true })
  email: string;

  @Prop({ type: String, required: true })
  password: string;

  @Prop({ type: String, unique: true, sparse: true })
  username?: string;

  @Prop({ type: String, default: 'user' })
  role: string;

  @Prop({ type: String })
  phone?: string;

  @Prop({ type: String })
  gender?: string;

  @Prop({ type: String })
  profilePic?: string;

  @Prop({ type: [String], default: [] })
  following: string[];

  @Prop({ type: [String], default: [] })
  followers: string[];

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

  @Prop({ type: String, default: '' })
  resetCode?: string;

  @Prop({ type: Boolean, default: false })
  isVerified: boolean;

  @Prop({
    type: String,
    enum: Object.values(UserStatus),
    default: UserStatus.INACTIVE,
  })
  status: UserStatus;
}

const UserSchema = SchemaFactory.createForClass(UserDocument);
UserSchema.add(BaseSchema);
export { UserSchema };
