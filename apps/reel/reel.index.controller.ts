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
import { CreateCommentDto } from '@app/common//dto/microservices/reel/create-comment.dto';
import { CommentRto } from '@app/common//rto/microservices/reel/comment.rto';
import { UpdateCommentDto } from '@app/common//dto/microservices/reel/update-comment.dto';
import { CreateReportDto } from '@app/common//dto/microservices/reel/create-report.dto';
import { ReportRto } from '@app/common//rto/microservices/reel/report.rto';
import { ReportService } from './report/report.service';
import { UpdateReportDto } from '@app/common//dto/microservices/reel/update-report.dto';
import { ReportedEntityType } from '@app/common//enum/reel/reported-entity-type.enum';
import { LikeResponse } from '@app/common//dto/interface/like.interface';
import { LikeableType } from '@app/common//enum/reel/likeable-type.enum';
import { LikeResponseRTO } from '@app/common//rto/microservices/reel/like-response.rto';
import { DeleteCommentResponseRto } from '@app/common//rto/microservices/reel/delete-comment-response.rto';
import { ShareReelResponseRto } from '@app/common//rto/microservices/reel/Share-reel-response.rto';

@Controller()
export class ReelController {
  private readonly logger = new Logger(ReelController.name);

  constructor(
    private readonly reelService: ReelService,
    private readonly likeService: LikeService,
    private readonly commentService: CommentService,
    private readonly reportService: ReportService,
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
  async handleDeleteReel(@Payload() id: string): Promise<string> {
    this.logger.log(`Handling delete reel with id ${id}`);

    try {
      const reelKey = await this.reelService.deleteReel(id);
      this.logger.log(
        `Successfully deleted reel with id ${id} and key ${reelKey}`,
      );
      return reelKey;
    } catch (error) {
      this.logger.error(`Error deleting reel with id ${id}:`, error);

      throw new Error(`Failed to delete reel with id ${id}. Error: ${error}`);
    }
  }

  @MessagePattern(
    `${MICROSERVICE.REELS}.${CONTROLLER.REELS}.${ACTION.GET_MANY}`,
  )
  async handleGetManyReels(
    @Payload()
    payload: {
      paginationOptions: PaginationOptions;
      // Ensure 'userid' is typed correctly based on your microservice payload
      // It should match what the client sends and what you expect.
      // Make it nullable if unauthenticated users can fetch the feed.
      userid?: string | null;
    },
  ): Promise<ReelRto[]> {
    console.log('Received handleGetManyReels payload:', payload);

    // 2. Fetch the reels using the ReelService
    const reels = await this.reelService.getManyReels(
      payload.paginationOptions,
    );

    // If no reels are fetched, return an empty array immediately
    if (!reels || reels.length === 0) {
      console.log('No reels found.');
      return [];
    }

    // 3. Extract the IDs of the fetched reels and put them in a Set
    const reelIdSet = new Set<string>(reels.map((reel) => reel.id));
    console.log(
      `Fetched ${reels.length} reels. Extracted IDs: ${Array.from(reelIdSet).join(', ')}`,
    );

    // 4. Initialize a variable for liked reel IDs set (default to empty if no user or no likes)
    let likedReelIds: Set<string> | null = null;

    // 5. If a userId is provided in the payload, query the LikeService
    // Check if payload.userid exists and is not null or empty
    if (payload.userid) {
      console.log(
        `User ${payload.userid} is logged in. Checking liked reels...`,
      );
      try {
        likedReelIds = await this.likeService.findLikedTargetIds(
          payload.userid,
          reelIdSet, // Pass the set of IDs to check
          LikeableType.REEL, // Specify the target type
        );
        console.log(
          `Found ${likedReelIds.size} liked reels for user ${payload.userid} among the fetched ones.`,
        );
      } catch (error) {
        // Log the error but don't block the feed fetching.
        // Treat it as if the user liked none of the reels for this request.
        console.error(
          `Error fetching liked reel IDs for user ${payload.userid}:`,
          error,
        );
        likedReelIds = new Set(); // Fallback to empty set on error
      }
    } else {
      console.log(
        'User ID not provided. Returning reels without like status for current user.',
      );
      // likedReelIds remains null, which ReelRto.fromEntities handles by setting isLiked to false
    }

    // 6. Map the fetched Reel entities to ReelRto, passing the likedReelIds set
    // The fromEntities method in ReelRto is designed to use this set
    // to determine the 'isLiked' status for each reel.
    const reelRtos = ReelRto.fromEntities(reels, likedReelIds);
    console.log(`Mapped ${reelRtos.length} reels to RTOs.`);

    // 7. Return the resulting ReelRto array
    return reelRtos;
  }

  @MessagePattern(
    `${MICROSERVICE.REELS}.${CONTROLLER.REELS}.${ACTION.GET_CREATED_AFTER}`,
  )
  async handleGetReelsCreatedAfter(
    @Payload()
    payload: {
      createdAt: Date;
      limit: number;
      userid?: string | null;
      // --------------------------------------------
    },
  ): Promise<ReelRto[]> {
    try {
      // 1. Fetch the reels using the ReelService
      const reels = await this.reelService.getReelsCreatedAfter(
        payload.createdAt,
      );

      // Handle case where no reels are returned
      if (!reels || reels.length === 0) {
        console.log('No reels found created after the specified time.');
        return [];
      }

      // 2. Extract the IDs of the fetched reels into a Set
      const reelIdSet = new Set<string>(reels.map((reel) => reel.id));
      console.log(
        `Fetched ${reels.length} reels created after time. Extracted IDs: ${Array.from(reelIdSet).join(', ')}`,
      );

      // 3. Initialize variable for liked reel IDs
      let likedReelIds: Set<string> | null = null;

      // 4. If a userId is provided, query the LikeService
      if (payload.userid) {
        console.log(
          `User ${payload.userid} is logged in. Checking liked reels created after time...`,
        );
        try {
          likedReelIds = await this.likeService.findLikedTargetIds(
            payload.userid,
            reelIdSet, // Pass the set of IDs
            LikeableType.REEL, // Specify the type
          );
          console.log(
            `Found ${likedReelIds.size} liked reels for user ${payload.userid} among the fetched 'created after' ones.`,
          );
        } catch (error) {
          // Log error but don't block
          console.error(
            `Error fetching liked reel IDs for user ${payload.userid} (created after):`,
            error,
          );
          likedReelIds = new Set(); // Fallback on error
        }
      } else {
        console.log(
          'User ID not provided. Returning reels without like status for current user (created after).',
        );
      }

      // 5. Map the fetched Reel entities to ReelRto, passing the likedReelIds set
      const reelRtos = ReelRto.fromEntities(reels, likedReelIds);
      console.log(`Mapped ${reelRtos.length} reels to RTOs (created after).`);

      // 6. Return the resulting ReelRto array
      return reelRtos;
    } catch (error) {
      // Log and re-throw any errors from reelService.getReelsCreatedAfter or other critical errors
      console.error(
        `Critical Error handling get reels created after ${JSON.stringify(payload)} for user ${payload.userid ?? 'N/A'}`,
        error,
      );
      throw error;
    }
  }

  @MessagePattern(
    `${MICROSERVICE.REELS}.${CONTROLLER.REELS}.${ACTION.LIKE_REEL}`,
  )
  async handleReelLikes(
    @Payload()
    payload: CreateLikeDto,
  ): Promise<LikeResponseRTO> {
    const { body } = payload;
    const { userId, targetId } = body;
    const onModel = body.onModel;

    this.logger.log(
      `Handling like/unlike request for ${onModel} target ${targetId} by user ${userId}`,
    );

    let likeStatusResponseFromLikeService: LikeResponse;
    let updatedLikeCount: number;

    try {
      likeStatusResponseFromLikeService = await this.likeService.likeReel(
        userId,
        targetId,
        onModel,
      );

      if (onModel === LikeableType.REEL) {
        updatedLikeCount = await this.reelService.likeReel(
          targetId,
          likeStatusResponseFromLikeService,
        );
      } else if (onModel === LikeableType.COMMENT) {
        updatedLikeCount = await this.commentService.likeComment(
          targetId,
          likeStatusResponseFromLikeService,
        );
      } else {
        // Handle unexpected `onModel` values if necessary
        throw new Error(`Unsupported likeable type: ${payload.body.onModel}`);
      }

      // Step 3: Construct the final response object (LikeResponseRTO)
      // combining the status from the like service and the count from the reel/comment service.
      const resultRto: LikeResponseRTO = {
        status: likeStatusResponseFromLikeService.status,
        likeCount: updatedLikeCount,
      };
      // If LikeResponseRTO is a class with a constructor like we made earlier:
      // const resultRto = new LikeResponseRTO(likeStatusResponseFromLikeService.status, updatedLikeCount);

      this.logger.log(
        `Like/unlike successful for ${onModel} target ${targetId}. New count: ${updatedLikeCount}, Status: ${likeStatusResponseFromLikeService.status}`,
      );

      // Step 4: Return the final RTO
      return resultRto;
    } catch (error) {
      this.logger.error(
        `Error processing like for ${onModel} target ${targetId} by user ${userId}: ${error}`, // Log the error message
      );
      // Re-throw the error so NestJS can handle it appropriately (e.g., return an error response to the client or requeue the message)
      throw error;
    }
  }

  @MessagePattern(
    `${MICROSERVICE.REELS}.${CONTROLLER.REELS}.${ACTION.SHARE_REEL}`,
  )
  async handleShareReel(
    @Payload() reelId: string,
  ): Promise<ShareReelResponseRto> {
    this.logger.log(`Handling share reel with id ${reelId}`);
    try {
      const shareCount = await this.reelService.shareReel(reelId);
      return ShareReelResponseRto.from(reelId, shareCount);
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

      const currentCommentCount = await this.reelService.incrementCommentCount(
        createCommentDto.body.reelId,
      );

      console.log(comment, currentCommentCount);

      return CommentRto.fromEntity(comment, currentCommentCount);
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
    this.logger.log(
      `Handling update comment with id ${payload.id} ${JSON.stringify(payload.updateCommentDto)}`,
    );
    try {
      const comment = await this.commentService.updateComment(
        payload.id,
        payload.updateCommentDto,
      );
      return CommentRto.fromEntity(comment, 0);
    } catch (error) {
      this.logger.error(`Error updating comment ${payload.id}: ${error}`);
      throw error;
    }
  }

  @MessagePattern(
    `${MICROSERVICE.REELS}.${CONTROLLER.REEL_COMMENTS}.${ACTION.DELETE}`,
  )
  async handleDeleteComment(
    @Payload() payload: { id: string },
  ): Promise<DeleteCommentResponseRto> {
    this.logger.log(`Handling delete comment with id ${payload.id}`);
    try {
      const comment = await this.commentService.deleteComment(payload.id);

      const currentCommentCount = await this.reelService.decrementCommentCount(
        comment.reelId,
      );

      console.log('currentCommentCount ${}');

      return DeleteCommentResponseRto.from(comment.reelId, currentCommentCount);
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
      return CommentRto.fromEntity(comment, 0);
    } catch (error) {
      this.logger.error(`Error getting comment ${id}: ${error}`);
      throw error;
    }
  }

  @MessagePattern(
    `${MICROSERVICE.REELS}.${CONTROLLER.REEL_COMMENTS}.${ACTION.GET_COMMENTS_BY_REELID}`,
  )
  async handleGetCommentsByReelId(
    @Payload()
    payload: {
      reelId: string;
      paginationOptions: PaginationOptions;
      // --- ADD userId to the payload definition ---
      userid?: string | null;
      // --------------------------------------------
    },
  ): Promise<CommentRto[]> {
    // Use the logger if you have one, or console.log
    console.log(
      `Handling get comments by reel ID: ${payload.reelId} with pagination ${JSON.stringify(payload.paginationOptions)}. User: ${payload.userid ?? 'N/A'}`,
    );

    try {
      // 1. Fetch the comments using the CommentService
      const comments = await this.commentService.getCommentsByReelId(
        payload.reelId,
        payload.paginationOptions,
      );

      // Handle case where no comments are returned
      if (!comments || comments.length === 0) {
        this.logger.log(`No comments found for reel ID: ${payload.reelId}`);
        return [];
      }

      // 2. Extract the IDs of the fetched comments into a Set
      const commentIdSet = new Set<string>(
        comments.map((comment) => comment.id),
      );
      this.logger.log(
        `Fetched ${comments.length} comments. Extracted IDs: ${Array.from(commentIdSet).join(', ')}`,
      );

      // 3. Initialize variable for liked comment IDs set
      let likedCommentIds: Set<string> | null = null;

      // 4. If a userId is provided, query the LikeService for comment likes
      // Check if payload.userid exists and is not null or empty
      if (payload.userid) {
        this.logger.log(
          `User ${payload.userid} is logged in. Checking liked comments for reel ${payload.reelId}...`,
        );
        try {
          likedCommentIds = await this.likeService.findLikedTargetIds(
            payload.userid, // Pass the user ID
            commentIdSet, // Pass the set of comment IDs to check
            LikeableType.COMMENT, // Specify the target type is COMMENT
          );
          this.logger.log(
            `Found ${likedCommentIds.size} liked comments for user ${payload.userid} among the fetched ones.`,
          );
        } catch (error) {
          // Log the error but don't block the comment fetching.
          // Treat it as if the user liked none of these comments for this request.
          this.logger.error(
            `Error fetching liked comment IDs for user ${payload.userid} on reel ${payload.reelId}:`,
            error,
          );
          likedCommentIds = new Set(); // Fallback to an empty set on error
        }
      } else {
        this.logger.log(
          'User ID not provided. Returning comments without like status for current user.',
        );
        // likedCommentIds remains null, which CommentRto.fromEntities handles by setting isLiked to false
      }

      // 5. Map the fetched Comment entities to CommentRto, passing the likedCommentIds set
      // The fromEntities method in CommentRto is designed to use this set
      // to determine the 'isLiked' status for each comment.
      const commentRtos = CommentRto.fromEntities(comments, 0, likedCommentIds);
      this.logger.log(
        `Mapped ${commentRtos.length} comments to RTOs for reel ${payload.reelId}.`,
      );

      // 6. Return the resulting CommentRto array
      return commentRtos;
    } catch (error) {
      // Log and re-throw any errors from commentService.getCommentsByReelId or other critical errors
      this.logger.error(
        `Critical Error handling get comments by reel ID ${payload.reelId} for user ${payload.userid ?? 'N/A'}:`,
        error,
      );
      throw error;
    }
  }

  @MessagePattern(
    `${MICROSERVICE.REELS}.${CONTROLLER.REPORTS}.${ACTION.CREATE}`,
  )
  async handleCreateReport(
    @Payload() createReportDto: CreateReportDto,
  ): Promise<ReportRto> {
    try {
      this.logger.log(
        `Handling create report: ${JSON.stringify(createReportDto)}`,
      );
      const report = await this.reportService.createReport(createReportDto);
      return ReportRto.fromEntity(report);
    } catch (error) {
      this.logger.error(`Error creating report: ${error}`);
      throw error;
    }
  }

  @MessagePattern(`${MICROSERVICE.REELS}.${CONTROLLER.REPORTS}.${ACTION.GET}`)
  async handleGetReport(@Payload() id: string): Promise<ReportRto> {
    this.logger.log(`Handling get report with id ${id}`);
    try {
      const report = await this.reportService.getReport(id);
      return ReportRto.fromEntity(report);
    } catch (error) {
      this.logger.error(`Error getting report ${id}: ${error}`);
      throw error;
    }
  }

  @MessagePattern(
    `${MICROSERVICE.REELS}.${CONTROLLER.REPORTS}.${ACTION.UPDATE}`,
  )
  async handleUpdateReport(
    @Payload() payload: { id: string; updateReportDto: UpdateReportDto },
  ): Promise<ReportRto> {
    this.logger.log(`Handling update report with id ${payload.id}`);
    try {
      const report = await this.reportService.updateReport(
        payload.id,
        payload.updateReportDto,
      );
      return ReportRto.fromEntity(report);
    } catch (error) {
      this.logger.error(`Error updating report ${payload.id}: ${error}`);
      throw error;
    }
  }

  @MessagePattern(
    `${MICROSERVICE.REELS}.${CONTROLLER.REPORTS}.${ACTION.DELETE}`,
  )
  async handleDeleteReport(@Payload() id: string): Promise<void> {
    this.logger.log(`Handling delete report with id ${id}`);
    try {
      await this.reportService.deleteReport(id);
    } catch (error) {
      this.logger.error(`Error deleting report ${id}: ${error}`);
      throw error;
    }
  }

  @MessagePattern(
    `${MICROSERVICE.REELS}.${CONTROLLER.REPORTS}.${ACTION.GET_REPORTS_BY_ENTITY}`,
  )
  async handleGetReportsByEntity(
    @Payload()
    payload: {
      reportedEntityId: string;
      reportedEntityType: ReportedEntityType;
    },
  ): Promise<ReportRto[]> {
    this.logger.log(
      `Handling get reports by entity ID ${payload.reportedEntityId} and type ${payload.reportedEntityType}`,
    );
    try {
      const reports = await this.reportService.getReportsByEntity(
        payload.reportedEntityId,
        payload.reportedEntityType,
      );
      return ReportRto.fromEntities(reports);
    } catch (error) {
      this.logger.error(
        `Error getting reports by entity ID ${payload.reportedEntityId} and type ${payload.reportedEntityType}: ${error}`,
      );
      throw error;
    }
  }

  @MessagePattern(`${MICROSERVICE.REELS}.${CONTROLLER.REELS}.${ACTION.SEARCH}`)
  async handleSearchReels(
    @Payload()
    payload: {
      query: string;
      paginationOptions: PaginationOptions;
      userid?: string | null;
    },
  ): Promise<ReelRto[]> {
    this.logger.log(
      `Handling search reels with query "${payload.query}" and pagination: page=${payload.paginationOptions.page}, limit=${payload.paginationOptions.limit}`,
    );

    // 1. Search for reels using the ReelService
    const reels = await this.reelService.searchReels(
      payload.query,
      payload.paginationOptions,
    );

    // If no reels are found, return an empty array immediately
    if (!reels || reels.length === 0) {
      this.logger.log('No reels found matching the search query.');
      return [];
    }

    // 2. Extract the IDs of the found reels and put them in a Set
    const reelIdSet = new Set<string>(reels.map((reel) => reel.id));
    this.logger.log(
      `Found ${reels.length} reels matching the search query. Extracted IDs: ${Array.from(reelIdSet).join(', ')}`,
    );

    // 3. Initialize a variable for liked reel IDs set
    let likedReelIds: Set<string> | null = null;

    // 4. If a userId is provided, query the LikeService
    if (payload.userid) {
      this.logger.log(
        `User ${payload.userid} is logged in. Checking liked reels...`,
      );
      try {
        likedReelIds = await this.likeService.findLikedTargetIds(
          payload.userid,
          reelIdSet,
          LikeableType.REEL,
        );
        this.logger.log(
          `Found ${likedReelIds.size} liked reels for user ${payload.userid} among the search results.`,
        );
      } catch (error) {
        this.logger.error(
          `Error fetching liked reel IDs for user ${payload.userid}:`,
          error,
        );
        likedReelIds = new Set(); // Fallback to empty set on error
      }
    } else {
      this.logger.log(
        'User ID not provided. Returning search results without like status for current user.',
      );
    }

    // 5. Map the found Reel entities to ReelRto
    const reelRtos = ReelRto.fromEntities(reels, likedReelIds);
    this.logger.log(`Mapped ${reelRtos.length} reels to RTOs.`);

    // 6. Return the resulting ReelRto array
    return reelRtos;
  }

  @MessagePattern(
    `${MICROSERVICE.REELS}.${CONTROLLER.REELS}.${ACTION.GET_BY_USER_ID}`,
  )
  async handleGetReelsByUserId(
    @Payload()
    payload: {
      userId: string;
      paginationOptions: PaginationOptions;
      userid?: string | null;
    },
  ): Promise<ReelRto[]> {
    this.logger.log(
      `Handling get reels by user ID ${payload.userId} with pagination: page=${payload.paginationOptions.page}, limit=${payload.paginationOptions.limit}`,
    );

    // 1. Fetch the reels using the ReelService
    const reels = await this.reelService.getReelsByUserId(
      payload.userId,
      payload.paginationOptions,
    );

    // If no reels are found, return an empty array immediately
    if (!reels || reels.length === 0) {
      this.logger.log(`No reels found for user ${payload.userId}.`);
      return [];
    }

    // 2. Extract the IDs of the fetched reels and put them in a Set
    const reelIdSet = new Set<string>(reels.map((reel) => reel.id));
    this.logger.log(
      `Fetched ${reels.length} reels for user ${payload.userId}. Extracted IDs: ${Array.from(reelIdSet).join(', ')}`,
    );

    // 3. Initialize a variable for liked reel IDs set
    let likedReelIds: Set<string> | null = null;

    // 4. If a userId is provided, query the LikeService
    if (payload.userid) {
      this.logger.log(
        `User ${payload.userid} is logged in. Checking liked reels...`,
      );
      try {
        likedReelIds = await this.likeService.findLikedTargetIds(
          payload.userid,
          reelIdSet,
          LikeableType.REEL,
        );
        this.logger.log(
          `Found ${likedReelIds.size} liked reels for user ${payload.userid} among the fetched ones.`,
        );
      } catch (error) {
        this.logger.error(
          `Error fetching liked reel IDs for user ${payload.userid}:`,
          error,
        );
        likedReelIds = new Set(); // Fallback to empty set on error
      }
    } else {
      this.logger.log(
        'User ID not provided. Returning reels without like status for current user.',
      );
    }

    // 5. Map the fetched Reel entities to ReelRto
    const reelRtos = ReelRto.fromEntities(reels, likedReelIds);
    this.logger.log(`Mapped ${reelRtos.length} reels to RTOs.`);

    // 6. Return the resulting ReelRto array
    return reelRtos;
  }
}
