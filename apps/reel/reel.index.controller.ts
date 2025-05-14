import { Controller, Logger } from '@nestjs/common';
import { ReelService } from './reel/reel.service';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { MICROSERVICE } from '@app/common//enum/microservice.enum';
import { CONTROLLER } from '@app/common//enum/controller.enum';
import { ACTION } from '@app/common//enum/action.enum';
import { CreateReelDto } from '@app/common//dto/microservices/reel/create-reel.dto';
import { ReelRto } from '@app/common//rto/microservices/reel/reel.rto';
import { UpdateReelDto } from '@app/common//dto/microservices/reel/update-reel.dto';
import { PaginationOptions } from '@app/common//dto/interface/pagination-options.interface';
import { LikeService } from './like/like.service';
import { CommentService } from './comment/comment.service';
import { CreateLikeDto } from '@app/common//dto/microservices/reel/create-like.dto';
import { LikeReelResponse } from '@app/common//dto/interface/like.interface';
import { CreateCommentDto } from '@app/common//dto/microservices/reel/create-comment.dto';
import { CommentRto } from '@app/common//rto/microservices/reel/comment.rto';
import { UpdateCommentDto } from '@app/common//dto/microservices/reel/update-comment.dto';

@Controller()
export class ReelController {
  private readonly logger = new Logger(ReelController.name);

  constructor(
    private readonly reelService: ReelService,
    private readonly likeService: LikeService,
    private readonly commentService: CommentService,
  ) {}

  @MessagePattern(`${MICROSERVICE.REELS}.${CONTROLLER.REELS}.${ACTION.CREATE}`)
  async handleCreateReel(
    @Payload() createReelDto: CreateReelDto,
  ): Promise<ReelRto> {
    this.logger.log(createReelDto);
    const reel = await this.reelService.createReel(createReelDto);
    return ReelRto.fromEntity(reel);
  }

  @MessagePattern(`${MICROSERVICE.REELS}.${CONTROLLER.REELS}.${ACTION.GET}`)
  async handleGetReel(@Payload() id: string): Promise<ReelRto> {
    this.logger.log(`Handling get reel with id ${id}`);
    const reel = await this.reelService.getReel(id);
    return ReelRto.fromEntity(reel);
  }

  @MessagePattern(`${MICROSERVICE.REELS}.${CONTROLLER.REELS}.${ACTION.UPDATE}`)
  async handleUpdateReel(
    @Payload() payload: { id: string; updateReelDto: UpdateReelDto },
  ): Promise<ReelRto> {
    this.logger.log(`Handling update reel with id ${payload.id}`);
    const reel = await this.reelService.updateReel(
      payload.id,
      payload.updateReelDto,
    );
    return ReelRto.fromEntity(reel);
  }

  @MessagePattern(`${MICROSERVICE.REELS}.${CONTROLLER.REELS}.${ACTION.DELETE}`)
  async handleDeleteReel(@Payload() id: string): Promise<void> {
    this.logger.log(`Handling delete reel with id ${id}`);
    await this.reelService.deleteReel(id);
  }

  @MessagePattern(
    `${MICROSERVICE.REELS}.${CONTROLLER.REELS}.${ACTION.GET_MANY}`,
  )
  async handleGetManyReels(
    @Payload()
    payload: PaginationOptions,
  ): Promise<ReelRto[]> {
    console.log(payload);
    const reels = await this.reelService.getManyReels(payload);
    return ReelRto.fromEntities(reels);
  }

  @MessagePattern(
    `${MICROSERVICE.REELS}.${CONTROLLER.REELS}.${ACTION.LIKE_REEL}`,
  )
  async handleReelLikes(
    @Payload()
    payload: CreateLikeDto,
  ): Promise<LikeReelResponse> {
    const { body } = payload;
    const { userId, targetId } = body;

    this.logger.log(
      `Handling like/unlike request for target ${targetId} by user ${userId}`,
    );

    try {
      const likeResponse = await this.likeService.likeReel(userId, targetId);

      await this.reelService.likeReel(targetId, likeResponse);

      return likeResponse;
    } catch (error) {
      this.logger.error(
        `Error processing like for target ${targetId} by user ${userId}: ${error}`,
      );
      throw error;
    }
  }

  @MessagePattern(
    `${MICROSERVICE.REELS}.${CONTROLLER.REELS}.${ACTION.SHARE_REEL}`,
  )
  async handleShareReel(@Payload() reelId: string): Promise<void> {
    this.logger.log(`Handling share reel with id ${reelId}`);
    try {
      await this.reelService.shareReel(reelId);
    } catch (error) {
      this.logger.error(`Error sharing reel ${reelId}: ${error}`);
      throw error;
    }
  }

  @MessagePattern(
    `${MICROSERVICE.REELS}.${CONTROLLER.REELS}.${ACTION.FAVORITE_REEL}`,
  )
  async handleFavoriteReel(@Payload() reelId: string): Promise<void> {
    this.logger.log(`Handling favorite reel with id ${reelId}`);
    try {
      await this.reelService.favoriteReel(reelId);
    } catch (error) {
      this.logger.error(`Error favoriting reel ${reelId}: ${error}`);
      throw error;
    }
  }

  @MessagePattern(
    `${MICROSERVICE.REELS}.${CONTROLLER.REEL_COMMENTS}.${ACTION.CREATE}`,
  )
  async handleCreateComment(
    @Payload() createCommentDto: CreateCommentDto,
  ): Promise<CommentRto> {
    try {
      this.logger.log(createCommentDto);
      const comment = await this.commentService.createComment(createCommentDto);

      // await this.reelService.incrementCommentCount(createCommentDto.id);

      return CommentRto.fromEntity(comment);
    } catch (error) {
      this.logger.error(`Error creating comment for reel ${error}`);
      throw error;
    }
  }

  @MessagePattern(
    `${MICROSERVICE.REELS}.${CONTROLLER.REEL_COMMENTS}.${ACTION.UPDATE}`,
  )
  async handleUpdateComment(
    @Payload() payload: { id: string; updateCommentDto: UpdateCommentDto },
  ): Promise<CommentRto> {
    this.logger.log(`Handling update comment with id ${payload.id}`);
    try {
      const comment = await this.commentService.updateComment(
        payload.id,
        payload.updateCommentDto,
      );
      return CommentRto.fromEntity(comment);
    } catch (error) {
      this.logger.error(`Error updating comment ${payload.id}: ${error}`);
      throw error;
    }
  }

  @MessagePattern(
    `${MICROSERVICE.REELS}.${CONTROLLER.REEL_COMMENTS}.${ACTION.DELETE}`,
  )
  async handleDeleteComment(
    @Payload() payload: { id: string; targetId: string },
  ): Promise<void> {
    this.logger.log(`Handling delete comment with id ${payload.id}`);
    try {
      await this.reelService.decrementCommentCount(payload.targetId);

      await this.commentService.deleteComment(payload.id);
    } catch (error) {
      this.logger.error(`Error deleting comment ${payload.id}: ${error}`);
      throw error;
    }
  }

  @MessagePattern(
    `${MICROSERVICE.REELS}.${CONTROLLER.REEL_COMMENTS}.${ACTION.GET}`,
  )
  async handleGetComment(@Payload() id: string): Promise<CommentRto> {
    this.logger.log(`Handling get comment with id ${id}`);
    try {
      const comment = await this.commentService.getComment(id);
      return CommentRto.fromEntity(comment);
    } catch (error) {
      this.logger.error(`Error getting comment ${id}: ${error}`);
      throw error;
    }
  }

  // @MessagePattern(
  //   `${MICROSERVICE.REELS}.${CONTROLLER.REEL_COMMENTS}.${ACTION.GET_MANY}`,
  // )
  // async handleGetManyComments(
  //   @Payload()
  //   payload: {
  //     commentIds: string[];
  //     paginationOptions: PaginationOptions;
  //   },
  // ): Promise<CommentRto[]> {
  //   this.logger.log(`Handling get many comments`);
  //   try {
  //     const comments = await this.commentService.getManyComments(
  //       payload.commentIds,
  //       payload.paginationOptions,
  //     );
  //     return CommentRto.fromEntities(comments);
  //   } catch (error) {
  //     this.logger.error(`Error getting many comments: ${error}`);
  //     throw error;
  //   }
  // }

  @MessagePattern(
    `${MICROSERVICE.REELS}.${CONTROLLER.REEL_COMMENTS}.${ACTION.GET_COMMENTS_BY_REELID}`,
  )
  async handleGetCommentsByReelId(
    @Payload()
    payload: {
      reelId: string;
      paginationOptions: PaginationOptions;
    },
  ): Promise<CommentRto[]> {
    this.logger.log(`Handling get comments by reel ID: ${payload.reelId}`);
    try {
      const comments = await this.commentService.getCommentsByReelId(
        payload.reelId,
        payload.paginationOptions,
      );
      return CommentRto.fromEntities(comments);
    } catch (error) {
      this.logger.error(
        `Error getting comments by reel ID ${payload.reelId}: ${error}`,
      );
      throw error;
    }
  }
}
