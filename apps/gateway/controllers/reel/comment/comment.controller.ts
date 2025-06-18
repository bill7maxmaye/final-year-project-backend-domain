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
import { HttpService } from '@nestjs/axios';
import { catchError, firstValueFrom } from 'rxjs';
import { AxiosError } from 'axios';
import { ModerationDto } from '@app/common//dto/microservices/reel/comment-moderation.dto';
import { CreateNotificationDto } from '@app/common//dto/microservices/notification/create-notification-dto';
import { Types } from 'mongoose';

export class PredictionDto {
  label: string;
  score: number;
}
export class ModerationResponseDto {
  predictions: PredictionDto[];
}
@Controller('reel-comment')
@UseGuards(JwtAuthGuard)
export class CommentController {
  private readonly logger = new Logger(CommentController.name);

  constructor(
    private readonly networking: NetworkingService,
    private readonly reelService: ReelService,
    private readonly httpService: HttpService,
  ) {}

  @Post()
  async create(
    @ActiveUser() user: User,
    @Body() createCommentDto: CreateCommentGatewayDto,
  ): Promise<CommentGatewayRto> {
    try {
      const userId = user.id;
      const comment = CreateCommentDto.fromGatewayRequest(
        userId,
        createCommentDto,
      );

      this.logger.debug(`Creating comment: ${JSON.stringify(comment)}`);

      const response = await this.networking.send<CommentRto>(
        `${MICROSERVICE.REELS}.${CONTROLLER.REEL_COMMENTS}.${ACTION.CREATE}`,
        comment,
      );

      const authorDetails = await this.networking.send<UserRto>(
        `${MICROSERVICE.AUTHENTICATION}.${CONTROLLER.AUTH}.${ACTION.GET_USER}`,
        response.ownerId,
      );

      void this.moderateComment(
        response.id,
        createCommentDto.content,
        response.ownerId,
      );

      return this.reelService.populate(authorDetails, response);
    } catch (error) {
      this.logger.error('Error during create:', error);

      throw error;
    }
  }

  private async moderateComment(
    commentId: string,
    content: string,
    ownerId: string,
  ): Promise<void> {
    try {
      console.log('Am here');
      const moderationResult = await firstValueFrom(
        this.httpService
          .post('http://localhost:8001/predict', { post: content })
          .pipe(
            catchError((error: AxiosError) => {
              this.logger.error(
                `Error during moderation: ${error.message}`,
                error.stack,
              );
              return [];
            }),
          ),
      );

      console.log(JSON.stringify(moderationResult.data));

      if (!moderationResult || !moderationResult.data) {
        this.logger.warn(
          `No moderation predictions received for comment ${commentId}. Skipping moderation actions.`,
        );
        return; // Exit if there are problems with the response.
      }

      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
      const prediction: PredictionDto = moderationResult.data.predictions[0];

      if (prediction.label === 'free') {
        const moderationDto = ModerationDto.fromGateway(
          prediction.label,
          prediction.score,
        );

        await this.networking.send(
          `${MICROSERVICE.REELS}.${CONTROLLER.REEL_COMMENTS}.${ACTION.COMMENT_MODERATION_RESULT}`,
          { commentId: commentId, moderation: moderationDto },
        );
      } else if (prediction.label === 'hate' && prediction.score >= 0.8) {
        try {
          const createNotificationDto =
            CreateNotificationDto.fromCommentRemoved(
              new Types.ObjectId(ownerId),
              new Types.ObjectId(commentId),
              content,
            );

          this.networking.emit(
            `${MICROSERVICE.NOTIFICATION}.${CONTROLLER.NOTIFICATIONS}.${ACTION.CREATE}`,
            createNotificationDto,
          );

          await this.networking.send<DeleteCommentResponseRto>(
            `${MICROSERVICE.REELS}.${CONTROLLER.REEL_COMMENTS}.${ACTION.DELETE}`,
            { id: commentId },
          );
          this.logger.log(`Deleted comment ${commentId} due to hate speech.`);
        } catch (err) {
          this.logger.error(
            `Error deleting comment ${commentId} after moderation: ${err}`,
            err,
          );
        }
      } else {
        // Handle other cases (e.g., neutral, or hate with score < 0.8).  You may want to log these.
        this.logger.log(
          `Comment moderation result is ${prediction.label} with score ${prediction.score}. No action taken.`,
        );
      }
    } catch (error) {
      this.logger.error(
        `Error during comment moderation for comment ${commentId}:`,
        error,
      );
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
