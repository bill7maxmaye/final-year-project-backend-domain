import {
  Body,
  Controller,
  Delete,
  Get,
  HttpException,
  HttpStatus,
  Logger,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { NetworkingService } from '@pp/networking';
import { MICROSERVICE } from '@app/common//enum/microservice.enum';
import { CONTROLLER } from '@app/common//enum/controller.enum';
import { ACTION } from '@app/common//enum/action.enum';
import { CreateCommentDto } from '@app/common//dto/microservices/reel/create-comment.dto';
import { CommentRto } from '@app/common//rto/microservices/reel/comment.rto';
import { CreateCommentGatewayDto } from '@app/common//dto/gateway/reel/create-comment.gateway.dto';
import { v4 as uuidv4 } from 'uuid';
import { UpdateCommentGatewayDto } from '@app/common//dto/gateway/reel/update-comment.gateway.dto';
import { UpdateCommentDto } from '@app/common//dto/microservices/reel/update-comment.dto';
import { PaginationOptions } from '@app/common//dto/interface/pagination-options.interface';

@Controller('reel-comment')
export class CommentController {
  private readonly logger = new Logger(CommentController.name);

  constructor(private readonly networking: NetworkingService) {}

  @Post()
  async create(
    @Body() createCommentDto: CreateCommentGatewayDto,
  ): Promise<CommentRto> {
    this.logger.log('Received request to create comment');

    try {
      const userId = uuidv4();
      const comment = CreateCommentDto.fromGatewayRequest(
        userId,
        createCommentDto,
      );

      this.logger.debug(`Creating comment: ${JSON.stringify(comment)}`);

      const response = await this.networking.send<CommentRto>(
        `${MICROSERVICE.REELS}.${CONTROLLER.REEL_COMMENTS}.${ACTION.CREATE}`,
        comment,
      );

      return response;
    } catch (error) {
      this.logger.error('Error during create:', error);
      throw error;
    }
  }

  @Get('/:reelId')
  async getCommentsByReelId(
    @Param('reelId') reelId: string,
    @Query('page') page: string,
    @Query('limit') limit: string,
  ): Promise<CommentRto[]> {
    this.logger.log(`Received request to get comments for reel id: ${reelId}`);

    const parsedPage = parseInt(page, 10);
    const parsedLimit = parseInt(limit, 10);

    if (
      isNaN(parsedPage) ||
      isNaN(parsedLimit) ||
      parsedPage < 1 ||
      parsedLimit < 1
    ) {
      throw new HttpException(
        'Invalid pagination parameters. Page and limit must be positive integers.',
        HttpStatus.BAD_REQUEST,
      );
    }

    const paginationOptions: PaginationOptions = {
      page: parsedPage,
      limit: parsedLimit,
    };

    const payload = { reelId, paginationOptions };

    const comments = await this.networking.send<CommentRto[]>(
      `${MICROSERVICE.REELS}.${CONTROLLER.REEL_COMMENTS}.${ACTION.GET_COMMENTS_BY_REELID}`,
      payload,
    );

    return comments;
  }

  @Get(':id')
  async get(@Param('id') id: string): Promise<CommentRto> {
    this.logger.log(`Received request to get comment with id: ${id}`);

    const comment = await this.networking.send<CommentRto>(
      `${MICROSERVICE.REELS}.${CONTROLLER.REEL_COMMENTS}.${ACTION.GET}`,
      id,
    );

    return comment;
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updateCommentDto: UpdateCommentGatewayDto,
  ): Promise<CommentRto> {
    this.logger.log(`Received request to update comment with id: ${id}`);

    const microserviceDto = UpdateCommentDto.fromGatewayRequest(
      id,
      updateCommentDto,
    );

    const payload = { id, updateCommentDto: microserviceDto };

    const comment = await this.networking.send<CommentRto>(
      `${MICROSERVICE.REELS}.${CONTROLLER.REEL_COMMENTS}.${ACTION.UPDATE}`,
      payload,
    );

    return comment;
  }

  @Delete(':id')
  async delete(@Param('id') id: string): Promise<void> {
    this.logger.log(`Received request to delete comment with id: ${id}`);

    await this.networking.send<void>(
      `${MICROSERVICE.REELS}.${CONTROLLER.REEL_COMMENTS}.${ACTION.DELETE}`,
      id,
    );
  }

  // @Post('many')
  // async getMany(
  //   @Body()
  //   body: {
  //     commentIds: string[];
  //     paginationOptions: PaginationOptions;
  //   },
  // ): Promise<CommentRto[]> {
  //   const comments = await this.networking.send<CommentRto[]>(
  //     `${MICROSERVICE.REELS}.${CONTROLLER.REEL_COMMENTS}.${ACTION.GET_MANY}`,
  //     body,
  //   );

  //   return comments;
  // }
}
