import { ACTION } from '@app/common//enum/action.enum';
import { CONTROLLER } from '@app/common//enum/controller.enum';
import { MICROSERVICE } from '@app/common//enum/microservice.enum';
import { Injectable, Logger } from '@nestjs/common';
import { NetworkingService } from '@pp/networking';

@Injectable()
export class PostService {
  private readonly logger = new Logger(PostService.name);

  constructor(private readonly networking: NetworkingService) {}

  async getCollectionStats() {
    try {
      const [
        postCount,
        reelCount,
        commentCount,
        userCount,
        postReportCount,
        reelReportCount,
      ] = await Promise.all([
        this.networking.send<number>(
          `${MICROSERVICE.SOCIAL}.${CONTROLLER.SOCIAL_POSTS}.${ACTION.COUNT}`,
          {},
        ),
        this.networking.send<number>(
          `${MICROSERVICE.REELS}.${CONTROLLER.REELS}.${ACTION.COUNT}`,
          {},
        ),
        this.networking.send<number>(
          `${MICROSERVICE.SOCIAL}.${CONTROLLER.SOCIAL_COMMENTS}.${ACTION.COUNT}`,
          {},
        ),
        this.networking.send<number>(
          `${MICROSERVICE.AUTHENTICATION}.${CONTROLLER.AUTH}.${ACTION.COUNT_USERS}`,
          {},
        ),
        this.networking.send<number>(
          `${MICROSERVICE.SOCIAL}.${CONTROLLER.SOCIAL_POSTS}.${ACTION.COUNT_REPORTS}`,
          {},
        ),
        this.networking.send<number>(
          `${MICROSERVICE.REELS}.${CONTROLLER.REELS}.${ACTION.COUNT_REPORTS}`,
          {},
        ),
      ]);

      return {
        posts: postCount,
        reels: reelCount,
        comments: commentCount,
        users: userCount,
        reports: {
          posts: postReportCount,
          reels: reelReportCount,
          total: postReportCount + reelReportCount,
        },
        total:
          postCount +
          reelCount +
          commentCount +
          userCount +
          postReportCount +
          reelReportCount,
      };
    } catch (error) {
      this.logger.error('Error getting collection stats:', error);
      throw error;
    }
  }
}
