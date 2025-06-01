import { ManagedUpload } from 'aws-sdk/clients/s3';
import { CreatePostGatewayDto } from '../../../gateway/social/post/post-gateway.dto';
import { UpdatePostGatewayDto } from '../../../gateway/social/post/update-post.dto';
export class CreatePostDto {
  constructor(
    public title?: string,
    public content?: string,
    public mentions?: string[],
    public files?: string[],
    public authorId?: string,
  ) {}

  static fromCreate(
    dto: CreatePostGatewayDto,
    files?: ManagedUpload.SendData[],
    userId?: string,
  ): CreatePostDto {
    let filesArray: string[] = [];
    if (files) {
      filesArray = files.map((file) => file.Location);
    }
    return new CreatePostDto(
      dto.title,
      dto.content,
      dto.mentions,
      filesArray,
      userId,
    );
  }
  static fromUpdate(
    dto: UpdatePostGatewayDto,
    files?: ManagedUpload.SendData[],
    userId?: string,
  ): CreatePostDto {
    let filesArray: string[] = [];
    if (files) {
      filesArray = files.map((file) => file.Location);
    }
    return new CreatePostDto(
      dto.title,
      dto.content,
      dto.mentions,
      filesArray,
      userId,
    );
  }
}
