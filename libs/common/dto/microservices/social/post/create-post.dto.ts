import { CreatePostGatewayDto } from '../../../gateway/social/post/post-gateway.dto';
import { UpdatePostGatewayDto } from '../../../gateway/social/post/update-post.dto';
export class CreatePostDto {
  constructor(
    public title?: string,
    public content?: string,
    public mentions?: string[],
    public files?: string[],
  ) {}

  static fromCreate(
    dto: CreatePostGatewayDto,
    files?: string[],
  ): CreatePostDto {
    return new CreatePostDto(dto.title, dto.content, dto.mentions, files);
  }
  static fromUpdate(
    dto: UpdatePostGatewayDto,
    files?: string[],
  ): CreatePostDto {
    return new CreatePostDto(dto.title, dto.content, dto.mentions, files);
  }
}
