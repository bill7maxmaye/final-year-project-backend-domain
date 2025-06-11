import { ManagedUpload } from 'aws-sdk/clients/s3';
import { CreatePostCommentGatewayDto } from '../../../gateway/social/post/create-comment-gateway.rto';
import { UpdateCommentGatewayDto } from '../../../gateway/social/post/update-comment-gateway.dto';

export class CreateCommentDto {
  constructor(
    public content: string,
    public postId: string,
    public parentId?: string,
    public mentions?: string[],
    public files?: string[],
    public authorId?: string,
  ) {}

  static fromCreate(
    dto: CreatePostCommentGatewayDto,
    files?: ManagedUpload.SendData[],
    userId?: string,
  ): CreateCommentDto {
    const filesArray: string[] = files?.map((file) => file.Location) || [];

    return new CreateCommentDto(
      dto.content,
      dto.postId,
      dto.parentId,
      dto.mentions,
      filesArray,
      userId,
    );
  }

  static fromUpdate(
    dto: UpdateCommentGatewayDto,
    files?: ManagedUpload.SendData[],
    userId?: string,
  ): CreateCommentDto {
    const filesArray: string[] = files?.map((file) => file.Location) || [];

    return new CreateCommentDto(
      dto.content ?? '',
      dto.postId!,
      dto.parentId,
      dto.mentions,
      filesArray,
      userId,
    );
  }
}
