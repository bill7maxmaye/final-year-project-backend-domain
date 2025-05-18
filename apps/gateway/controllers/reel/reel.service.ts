import { ACTION } from '@app/common//enum/action.enum';
import { CONTROLLER } from '@app/common//enum/controller.enum';
import { MICROSERVICE } from '@app/common//enum/microservice.enum';
import { CommentGatewayRto } from '@app/common//rto/gateway/reel/comment-gateway.rto';
import { ProfileSummaryRto } from '@app/common//rto/gateway/reel/profile-summary.rto';
import { ReelGatewayRto } from '@app/common//rto/gateway/reel/reel-gateway.rto';
import { UserRto } from '@app/common//rto/microservices/auth/user.rto';
import { CommentRto } from '@app/common//rto/microservices/reel/comment.rto';
import { ReelRto } from '@app/common//rto/microservices/reel/reel.rto';
import { Injectable, Logger } from '@nestjs/common';
import { NetworkingService } from '@pp/networking';

@Injectable()
export class ReelService {
  private readonly logger = new Logger(ReelService.name);

  constructor(private readonly networking: NetworkingService) {}

  populate(user: UserRto, comment: CommentRto): CommentGatewayRto {
    const profile = ProfileSummaryRto.fromProfileRto(user, false);
    return CommentGatewayRto.fromPostAggregatedData(comment, profile);
  }

  async populateCommentList(
    comments: CommentRto[],
  ): Promise<CommentGatewayRto[]> {
    const populatedComments: CommentGatewayRto[] = [];

    for (const comment of comments) {
      try {
        const user = await this.networking.send<UserRto>(
          `${MICROSERVICE.AUTHENTICATION}.${CONTROLLER.AUTH}.${ACTION.GET_USER}`,
          comment.ownerId,
        );

        if (user) {
          console.log(user);
          const profile = ProfileSummaryRto.fromProfileRto(user, false);
          console.log(profile);
          const populatedComment = CommentGatewayRto.fromPostAggregatedData(
            comment,
            profile,
          );
          populatedComments.push(populatedComment);
        } else {
          this.logger.warn(
            `User not found for comment ownerId: ${comment.ownerId}`,
          );

          continue;
        }
      } catch (error) {
        this.logger.error(
          `Error fetching user for comment ${comment.id}: ${error}`,
        );
        continue;
      }
    }

    return populatedComments;
  }

  async populateReelList(reels: ReelRto[]): Promise<ReelGatewayRto[]> {
    const populatedReels: ReelGatewayRto[] = [];

    for (const reel of reels) {
      try {
        const user = await this.networking.send<UserRto>(
          `${MICROSERVICE.AUTHENTICATION}.${CONTROLLER.AUTH}.${ACTION.GET_USER}`,
          reel.ownerId,
        );

        if (user) {
          const profile = ProfileSummaryRto.fromProfileRto(user, false);
          const populatedReel = ReelGatewayRto.fromPostAggregatedData(
            reel,
            profile,
          );
          populatedReels.push(populatedReel);
        } else {
          this.logger.warn(
            `User not found for comment ownerId: ${reel.ownerId}`,
          );

          continue;
        }
      } catch (error) {
        this.logger.error(
          `Error fetching user for comment ${reel.id}: ${error}`,
        );
        continue;
      }
    }

    return populatedReels;
  }
}
