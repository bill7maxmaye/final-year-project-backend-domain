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
  UseGuards,
} from '@nestjs/common';
import { NetworkingService } from '@pp/networking';
import { MICROSERVICE } from '@app/common//enum/microservice.enum';
import { CONTROLLER } from '@app/common//enum/controller.enum';
import { ACTION } from '@app/common//enum/action.enum';
import { CreateCommentDto } from '@app/common//dto/microservices/reel/create-comment.dto';
import { CommentRto } from '@app/common//rto/microservices/reel/comment.rto';
import { CreateCommentGatewayDto } from '@app/common//dto/gateway/reel/create-comment.gateway.dto';
import { UpdateCommentGatewayDto } from '@app/common//dto/gateway/reel/update-comment.gateway.dto';
import { UpdateCommentDto } from '@app/common//dto/microservices/reel/update-comment.dto';
import { PaginationOptions } from '@app/common//dto/interface/pagination-options.interface';
import { User } from '@app/common//entities/user/user-entity';
import { ActiveUser } from '@app/common//decorators/active-user-decorator';
import { CommentGatewayRto } from '@app/common//rto/gateway/reel/comment-gateway.rto';
import { ReelService } from '../reel.service';
import { JwtAuthGuard } from '@app/common//guards/jwt-auth.guard';
import { UserRto } from '@app/common//rto/microservices/auth/user.rto';
import { DeleteCommentResponseRto } from '@app/common//rto/microservices/reel/delete-comment-response.rto';

@Controller('reel-comment')
@UseGuards(JwtAuthGuard)
export class CommentController {
  private readonly logger = new Logger(CommentController.name);

  constructor(
    private readonly networking: NetworkingService,
    private readonly reelService: ReelService,
  ) {}

  @Post()
  async create(
    @ActiveUser() user: User, // This is the authenticated user parameter
    @Body() createCommentDto: CreateCommentGatewayDto,
  ): Promise<CommentGatewayRto> {
    // this.logger.log(`Received request to create comment ${createCommentDto}`);

    try {
      const userId = user.id; // Use the ID from the authenticated user parameter
      const comment = CreateCommentDto.fromGatewayRequest(
        userId,
        createCommentDto,
      );

      this.logger.debug(`Creating comment: ${JSON.stringify(comment)}`);

      const response = await this.networking.send<CommentRto>(
        `${MICROSERVICE.REELS}.${CONTROLLER.REEL_COMMENTS}.${ACTION.CREATE}`,
        comment,
      );

      // --- FIX START ---
      // Rename this variable to avoid conflict with the 'user' parameter
      const authorDetails = await this.networking.send<UserRto>(
        `${MICROSERVICE.AUTHENTICATION}.${CONTROLLER.AUTH}.${ACTION.GET_USER}`,
        response.ownerId, // Assuming response.ownerId holds the ID needed
      );

      // Use the new variable name in the populate call
      return this.reelService.populate(authorDetails, response);
      // --- FIX END ---
    } catch (error) {
      this.logger.error('Error during create:', error);
      // It's generally better to throw a specific HttpException here
      // to provide meaningful status codes to the client.
      // Example:
      // if (error instanceof HttpException) {
      //   throw error;
      // }
      // throw new HttpException('Failed to create comment', HttpStatus.INTERNAL_SERVER_ERROR);
      throw error; // Re-throw the original error if you prefer
    }
  }

  @Get('/:reelId')
  async getCommentsByReelId(
    @ActiveUser() user: User,
    @Param('reelId') reelId: string,
    @Query('page') page: string,
    @Query('limit') limit: string,
  ): Promise<CommentGatewayRto[]> {
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

    const payload = { reelId, paginationOptions, userid: user.id };
    const comments = await this.networking.send<CommentRto[]>(
      `${MICROSERVICE.REELS}.${CONTROLLER.REEL_COMMENTS}.${ACTION.GET_COMMENTS_BY_REELID}`,
      payload,
    );

    return this.reelService.populateCommentList(comments);
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
  ): Promise<CommentGatewayRto> {
    this.logger.log(
      `Received request to update comment with id: ${id} ${JSON.stringify(updateCommentDto)}`,
    );

    const microserviceDto = UpdateCommentDto.fromGatewayRequest(
      id,
      updateCommentDto,
    );

    const payload = { id, updateCommentDto: microserviceDto };

    const comment = await this.networking.send<CommentRto>(
      `${MICROSERVICE.REELS}.${CONTROLLER.REEL_COMMENTS}.${ACTION.UPDATE}`,
      payload,
    );

    const authorDetails = await this.networking.send<UserRto>(
      `${MICROSERVICE.AUTHENTICATION}.${CONTROLLER.AUTH}.${ACTION.GET_USER}`,
      comment.ownerId,
    );

    return this.reelService.populate(authorDetails, comment);
  }

  @Delete(':id')
  async delete(@Param('id') id: string): Promise<DeleteCommentResponseRto> {
    this.logger.log(`Received request to delete comment with id: ${id}`);

    const result = await this.networking.send<DeleteCommentResponseRto>(
      `${MICROSERVICE.REELS}.${CONTROLLER.REEL_COMMENTS}.${ACTION.DELETE}`,
      { id },
    );

    console.log(result);

    return result;
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
