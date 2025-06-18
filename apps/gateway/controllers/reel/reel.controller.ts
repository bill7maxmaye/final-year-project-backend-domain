import {
  Body,
  Controller,
  Delete,
  Get,
  Logger,
  Param,
  Patch,
  Post,
  Query,
  UploadedFile,
  UseInterceptors,
  HttpException,
  HttpStatus,
  UseGuards,
  BadRequestException,
  ParseIntPipe,
  ParseIntPipeOptions,
} from '@nestjs/common';
import { ReelService } from './reel.service';
import { CreateReelGatewayDto } from '@app/common//dto/gateway/reel/create-reel.gateway.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { StorageService } from 'apps/gateway/storage/storage.service';
import { CreateReelDto } from '@app/common//dto/microservices/reel/create-reel.dto';
import { NetworkingService } from '@pp/networking';
import { ReelRto } from '@app/common//rto/microservices/reel/reel.rto';
import { MICROSERVICE } from '@app/common//enum/microservice.enum';
import { CONTROLLER } from '@app/common//enum/controller.enum';
import { ACTION } from '@app/common//enum/action.enum';
import { UpdateReelGatewayDto } from '@app/common//dto/gateway/reel/update-reel.gateway.dto';
import { UpdateReelDto } from '@app/common//dto/microservices/reel/update-reel.dto';
import { PaginationOptions } from '@app/common//dto/interface/pagination-options.interface';
import { CreateLikeGatewayDto } from '@app/common//dto/gateway/reel/create-like.gateway.dto';
import { CreateLikeDto } from '@app/common//dto/microservices/reel/create-like.dto';
import { CreateReportGatewayDto } from '@app/common//dto/gateway/reel/create-report.gateway.dto';
import { ReportRto } from '@app/common//rto/microservices/reel/report.rto';
import { CreateReportDto } from '@app/common//dto/microservices/reel/create-report.dto';
import { UpdateReportGatewayDto } from '@app/common//dto/gateway/reel/update-report.gateway.dto';
import { UpdateReportDto } from '@app/common//dto/microservices/reel/update-report.dto';
import { JwtAuthGuard } from '@app/common//guards/jwt-auth.guard';
import { ActiveUser } from '@app/common//decorators/active-user-decorator';
import { User } from '@app/common//entities/user/user-entity';
import { ReportedEntityType } from '@app/common//enum/reel/reported-entity-type.enum';
import { ReelGatewayRto } from '@app/common//rto/gateway/reel/reel-gateway.rto';
import { SuccessRto } from '@app/common//rto/success.rto';
import { LikeResponseRTO } from '@app/common//rto/microservices/reel/like-response.rto';
import { ShareReelResponseRto } from '@app/common//rto/microservices/reel/Share-reel-response.rto';
import { HttpService } from '@nestjs/axios';
import { catchError, firstValueFrom } from 'rxjs';
import { RecommendedReelGatewayDto } from '@app/common//dto/gateway/reel/recommended-reel.gateway.dto';
import { RecommendedReelDto } from '@app/common//dto/microservices/reel/recommended-reel.dto';
import { AxiosError } from 'axios';
import { ModerationDto } from '@app/common//dto/microservices/reel/comment-moderation.dto';
import { ReelAnalyticsDto } from '@app/common//dto/microservices/reel/reel-analytics.dto';
import { CreateNotificationDto } from '@app/common//dto/microservices/notification/create-notification-dto';
import { Types } from 'mongoose';

export class PredictionDto {
  label: string;
  score: number;
}
export class ModerationResponseDto {
  predictions: PredictionDto[];
}
@Controller('reel')
@UseGuards(JwtAuthGuard)
export class ReelController {
  private readonly logger = new Logger(ReelController.name);

  constructor(
    private readonly reelService: ReelService,
    private readonly storageService: StorageService,
    private readonly networking: NetworkingService,
    private readonly httpService: HttpService,
  ) {}

  @Post()
  @UseInterceptors(FileInterceptor('videoFile'))
  async create(
    @ActiveUser() user: User,
    @UploadedFile() file: Express.Multer.File,
    @Body() body: CreateReelGatewayDto,
  ) {
    this.logger.log(
      'Received request to create reel with video upload ,',
      file,
    );

    if (!file) {
      throw new HttpException('No video file provided', HttpStatus.BAD_REQUEST);
    }

    try {
      const uploadResult = await this.storageService.uploadFile(file);
      this.logger.debug(`S3 Upload Result: ${JSON.stringify(uploadResult)}`);

      const fileSignedUrl = await this.storageService.downloadFile(
        uploadResult.Key,
      );

      const userId = user.id;

      const reel = CreateReelDto.fromGateway(
        userId,
        body,
        uploadResult.Location,
        uploadResult.Key,
      );

      this.logger.debug(
        `Creating reel microservice payload: ${JSON.stringify(reel)}`,
      );

      const response = await this.networking.send<ReelRto>(
        `${MICROSERVICE.REELS}.${CONTROLLER.REELS}.${ACTION.CREATE}`,
        reel,
      );

      void this.analyzeVideoAndSendUpdate(
        response.id,
        file,
        response.ownerId,
        response.description,
      );

      return {
        message: 'Reel Created successfully',
        fileInfo: {
          bucket: uploadResult.Bucket,
          key: uploadResult.Key,
          location: uploadResult.Location,
          signedUrl: fileSignedUrl,
        },
        reel: response,
      };
    } catch (error) {
      this.logger.error('Error during reel creation and upload:', error);
      throw new HttpException(
        'Failed to create reel',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updateReelGatewayDto: UpdateReelGatewayDto,
  ): Promise<ReelRto> {
    this.logger.log(`Received request to update reel with id: ${id}`);

    const updateReelDto = UpdateReelDto.fromGatewayRequest(
      id,
      updateReelGatewayDto,
    );

    const payload = { id, updateReelDto };

    const reel = await this.networking.send<ReelRto>(
      `${MICROSERVICE.REELS}.${CONTROLLER.REELS}.${ACTION.UPDATE}`,
      payload,
    );

    console.log('reel ', reel);
    return reel;
  }

  private async moderateTranscription(
    reelId: string,
    transcription: string,
    ownerId: string,
    description: string,
  ): Promise<void> {
    try {
      const moderationResult = await firstValueFrom(
        this.httpService
          .post<ModerationResponseDto>('http://localhost:8001/predict', {
            post: transcription,
          })
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

      console.log(moderationResult?.data?.predictions);

      if (moderationResult?.data?.predictions?.[0]) {
        const prediction: PredictionDto = moderationResult.data.predictions[0];
        if (prediction.label === 'free') {
          const moderationDto = ModerationDto.fromGateway(
            prediction.label,
            prediction.score,
          );

          await this.networking.send(
            `${MICROSERVICE.REELS}.${CONTROLLER.REELS}.${ACTION.MODERATION_RESULT}`,
            { reelId: reelId, moderation: moderationDto },
          );
        } else if (prediction.label === 'hate' && prediction.score >= 0.8) {
          const createNotificationDto =
            CreateNotificationDto.fromCommentRemoved(
              new Types.ObjectId(ownerId),
              new Types.ObjectId(reelId),
              description,
            );

          this.networking.emit(
            `${MICROSERVICE.NOTIFICATION}.${CONTROLLER.NOTIFICATIONS}.${ACTION.CREATE}`,
            createNotificationDto,
          );

          await this.networking.send(
            `${MICROSERVICE.REELS}.${CONTROLLER.REELS}.${ACTION.DELETE}`,
            reelId,
          );
          this.logger.log(
            `Deleted reel ${reelId} due to hate speech in transcription.`,
          );
        }
      }
    } catch (error) {
      this.logger.error(`Error during reel moderation: ${error}`);
    }
  }

  private async analyzeVideoAndSendUpdate(
    reelId: string,
    file: Express.Multer.File,
    ownerId: string,
    description: string,
  ): Promise<void> {
    try {
      const formData = new FormData();
      const contentType = file.mimetype || 'video/mp4';

      // Convert buffer to Blob
      const blob = new Blob([file.buffer], { type: contentType });

      // Append blob with filename
      formData.append('video_file', blob, file.originalname);

      const analysisResult = await firstValueFrom(
        this.httpService
          .post<UpdateReelGatewayDto>(
            'http://127.0.0.1:8000/analyze/video_with_transcription',
            formData,
            {
              headers: {
                'Content-Type': 'multipart/form-data',
              },
            },
          )
          .pipe(
            catchError((error: AxiosError) => {
              this.logger.error(
                `Error during video analysis: ${error.message}`,
                error.stack,
              );
              throw error;
            }),
          ),
      );

      if (!analysisResult?.data) {
        this.logger.warn('No analysis data received. Skipping reel update.');
        return;
      }

      const updateReelGatewayDto = analysisResult.data;

      // Moderate the transcribed text if available
      if (updateReelGatewayDto.transcription_text) {
        void this.moderateTranscription(
          reelId,
          updateReelGatewayDto.transcription_text,
          ownerId,
          description,
        );
      }

      const updateReelDto = UpdateReelDto.fromGatewayRequest(
        reelId,
        updateReelGatewayDto,
      );

      const payload = { id: reelId, updateReelDto };

      await this.networking.send<ReelRto>(
        `${MICROSERVICE.REELS}.${CONTROLLER.REELS}.${ACTION.UPDATE}`,
        payload,
      );
      this.logger.debug(`Reel ${reelId} updated with analysis data.`);
    } catch (error) {
      this.logger.error(
        `Error updating reel ${reelId} with analysis data:`,
        error,
      );
    }
  }

  @Delete(':id')
  async delete(@Param('id') id: string): Promise<SuccessRto> {
    this.logger.log(`Received request to delete reel with id: ${id}`);

    try {
      const reelKey = await this.networking.send<string>(
        `${MICROSERVICE.REELS}.${CONTROLLER.REELS}.${ACTION.DELETE}`,
        id,
      );

      if (reelKey) {
        try {
          await this.storageService.deleteFile(reelKey);
          this.logger.log(`Deleted S3 file: ${reelKey}`);
        } catch (s3Error) {
          this.logger.error(`Failed to delete S3 file ${reelKey}:`, s3Error);
          // Decide how to handle S3 deletion failure (e.g., log and continue, or throw)
          // For example, you could throw the error to stop the process if S3 deletion is critical:
          // throw new Error(`Failed to delete S3 file: ${reelToDelete.s3Key}.  Error: ${s3Error}`);

          // OR you could log and continue, depending on your requirements.
        }
      }

      return new SuccessRto();
    } catch (error) {
      this.logger.error(`Error deleting reel with id: ${id}`, error);
      // Handle the error appropriately.  This might involve throwing an exception,
      // returning a specific error response, or logging and retrying.

      // Example: Throwing a custom error:
      throw new Error(`Failed to delete reel with id: ${id}. Error: ${error}`);

      // Or, return a specific error response:
      // return { success: false, message: 'Failed to delete reel' };
    }
  }

  @Get('report')
  async getReportsByEntityId(
    @Query('reportedEntityId') reportedEntityId: string,
    @Query('reportedEntityType') reportedEntityType: ReportedEntityType,
  ) {
    try {
      console.log(`Handling ${reportedEntityId} , ${reportedEntityType}`);
      const report = await this.networking.send<ReportRto>(
        `${MICROSERVICE.REELS}.${CONTROLLER.REPORTS}.${ACTION.GET_REPORTS_BY_ENTITY}`,
        {
          reportedEntityType: reportedEntityType,
          reportedEntityId: reportedEntityId,
        },
      );
      return report;
    } catch (error) {
      this.logger.error(`Error getting report ${reportedEntityId}:`, error);
      throw new HttpException(
        'Failed to get report',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('many')
  async getMany(
    @ActiveUser() user: User,
    @Query('page') page: string,
    @Query('limit') limit: string,
  ): Promise<ReelGatewayRto[]> {
    console.log('Hello');
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

    this.logger.log(
      `Received request to get many reels with pagination: page=${paginationOptions.page}, limit=${paginationOptions.limit}`,
    );

    const reels = await this.networking.send<ReelRto[]>(
      `${MICROSERVICE.REELS}.${CONTROLLER.REELS}.${ACTION.GET_MANY}`,
      { paginationOptions: paginationOptions, userid: user.id },
    );

    // Optional: If the microservice only returns S3 Keys,
    // you might need to loop through reels and generate signed URLs here
    // for each one before returning the list to the client.
    // E.g.,
    // for (const reel of reels) {
    //     if (reel.s3Key) {
    //         try {
    //             reel.videoUrl = await this.storageService.downloadFile(reel.s3Key);
    //         } catch(urlError) {
    //             this.logger.error(`Failed to generate signed URL for reel ${reel.id} key ${reel.s3Key}`, urlError);
    //             // Handle error - perhaps set videoUrl to null or a placeholder
    //             reel.videoUrl = null;
    //         }
    //     }
    // }

    return this.reelService.populateReelList(reels);
  }

  @Get('after')
  async getReelsCreatedAfter(
    @ActiveUser() user: User,
    @Query('createdAt') createdAtString: string,
    @Query('limit', new ParseIntPipe({ optional: true } as ParseIntPipeOptions))
    limit?: number,
  ): Promise<ReelGatewayRto[]> {
    this.logger.log(
      `Received request to get reels created after "${createdAtString}" with limit ${limit}`,
    );

    // --- START: Date Parsing Logic ---
    let processedDateString = createdAtString.trim(); // Trim whitespace from ends

    // Attempt to correct a common non-standard format: space before offset (e.g., " 00:00")
    // Replace the LAST space with a '+' if it precedes a potential HH:mm offset
    // This is a targeted fix for the specific format shown in the error.
    const lastSpaceIndex = processedDateString.lastIndexOf(' ');
    if (
      lastSpaceIndex > -1 &&
      /^\d{2}:\d{2}$/.test(processedDateString.substring(lastSpaceIndex + 1))
    ) {
      processedDateString =
        processedDateString.substring(0, lastSpaceIndex) +
        '+' +
        processedDateString.substring(lastSpaceIndex + 1);
      this.logger.debug(
        `Corrected date string by replacing last space with +: "${createdAtString}" -> "${processedDateString}"`,
      );
    } else {
      // As a fallback, try replacing ANY space with a + sign.
      // This is less precise but might help with variations.
      // Note: This might incorrectly handle spaces within the date part if your input varies greatly.
      const originalProcessed = processedDateString;
      processedDateString = processedDateString.replace(/\s/g, '+');
      if (originalProcessed !== processedDateString) {
        this.logger.debug(
          `Corrected date string by replacing all spaces with +: "${createdAtString}" -> "${processedDateString}"`,
        );
      }
    }

    const createdAt = new Date(processedDateString); // Attempt parsing with the corrected string

    // Validate the parsed date
    if (isNaN(createdAt.getTime())) {
      this.logger.warn(
        `Failed to parse date string even after correction: "${createdAtString}" -> "${processedDateString}"`,
      );
      throw new BadRequestException(
        `Invalid date format provided for 'createdAt': ${createdAtString}. Expected ISO 8601 or similar.`,
      );
    }
    this.logger.debug(
      `Successfully parsed date string: "${createdAtString}" -> ${createdAt.toISOString()}`,
    );
    // --- END: Date Parsing Logic ---

    try {
      console.log('createdAt', createdAt);
      const reelsRtos = await this.networking.send<ReelRto[]>(
        `${MICROSERVICE.REELS}.${CONTROLLER.REELS}.${ACTION.GET_CREATED_AFTER}`,
        { createdAt: createdAt, limit, userid: user.id }, // Send the ISO string
      );

      // Populate the list of ReelRtos with gateway-specific data (like signed URLs)
      return this.reelService.populateReelList(reelsRtos);
    } catch (error) {
      this.logger.error(
        `Error handling get reels created after ${createdAtString}:`,
        error,
      );
      // Map microservice errors to appropriate HTTP exceptions if needed
      // For example, if the microservice throws NotFoundException, you might
      // catch it here and throw a NestJS NotFoundException.
      // Currently, it throws a generic 500 error for any microservice failure.
      throw new HttpException(
        'Failed to fetch reels',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get(':id')
  async get(@Param('id') id: string): Promise<ReelRto> {
    this.logger.log(`Received request to get reel with id: ${id}`);

    const reel = await this.networking.send<ReelRto>(
      `${MICROSERVICE.REELS}.${CONTROLLER.REELS}.${ACTION.GET}`,
      id,
    );

    // Optional: If the microservice only returns the S3 Key,
    // generate the signed URL here before returning the single reel.
    // E.g.,
    // if (reel && reel.s3Key) { // Assuming reel has an s3Key property
    //      try {
    //          reel.videoUrl = await this.storageService.downloadFile(reel.s3Key);
    //      } catch (urlError) {
    //         this.logger.error(`Failed to generate signed URL for reel ${reel.id} key ${reel.s3Key}`, urlError);
    //         reel.videoUrl = null;
    //      }
    // }

    return reel;
  }

  @Post('like')
  async reelLike(
    @ActiveUser() user: User,
    @Body() body: CreateLikeGatewayDto,
  ): Promise<LikeResponseRTO> {
    const userId = user.id;
    const updateReelDto = CreateLikeDto.fromGatewayRequest(userId, body);

    const reel = await this.networking.send<LikeResponseRTO>(
      `${MICROSERVICE.REELS}.${CONTROLLER.REELS}.${ACTION.LIKE_REEL}`,
      updateReelDto,
    );

    return reel;
  }

  @Post('share/:reelId')
  async shareReel(
    @Param('reelId') reelId: string,
  ): Promise<ShareReelResponseRto> {
    this.logger.log(`Received request to share reel with id: ${reelId}`);
    const response = await this.networking.send<ShareReelResponseRto>(
      `${MICROSERVICE.REELS}.${CONTROLLER.REELS}.${ACTION.SHARE_REEL}`,
      reelId,
    );
    return response;
  }

  @Post('favorite/:reelId')
  async favoriteReel(@Param('reelId') reelId: string): Promise<void> {
    this.logger.log(`Received request to favorite reel with id: ${reelId}`);
    await this.networking.send<void>(
      `${MICROSERVICE.REELS}.${CONTROLLER.REELS}.${ACTION.FAVORITE_REEL}`,
      reelId,
    );
  }

  @Post('report')
  async createReport(
    @ActiveUser() user: User,
    @Body() createReportGatewayDto: CreateReportGatewayDto,
  ): Promise<ReportRto> {
    this.logger.log(
      `Received request to create a report: ${JSON.stringify(createReportGatewayDto)}`,
    );

    try {
      const reporterId = user.id;

      const createReportDto = CreateReportDto.fromGatewayRequest(
        reporterId,
        createReportGatewayDto,
      );

      // If the reported entity is a reel, increment its report count
      if (
        createReportGatewayDto.reportedEntityType === ReportedEntityType.REEL
      ) {
        await this.networking.send(
          `${MICROSERVICE.REELS}.${CONTROLLER.REELS}.${ACTION.INCREMENT_REPORT_COUNT}`,
          createReportGatewayDto.reportedEntityId,
        );
      }

      const report = await this.networking.send<ReportRto>(
        `${MICROSERVICE.REELS}.${CONTROLLER.REPORTS}.${ACTION.CREATE}`,
        createReportDto,
      );

      return report;
    } catch (error) {
      this.logger.error('Error creating report:', error);
      throw new HttpException(
        'Failed to create report',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('report/:id')
  async getReport(@Param('id') id: string): Promise<ReportRto> {
    this.logger.log(`Received request to get report with id: ${id}`);

    try {
      const report = await this.networking.send<ReportRto>(
        `${MICROSERVICE.REELS}.${CONTROLLER.REPORTS}.${ACTION.GET}`,
        id,
      );
      return report;
    } catch (error) {
      this.logger.error(`Error getting report ${id}:`, error);
      throw new HttpException(
        'Failed to get report',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Patch('report/:id')
  async updateReport(
    @Param('id') id: string,
    @Body() updateReportGatewayDto: UpdateReportGatewayDto,
  ): Promise<ReportRto> {
    this.logger.log(`Received request to update report with id: ${id}`);

    try {
      const updateReportDto = UpdateReportDto.fromGatewayRequest(
        id,
        updateReportGatewayDto,
      );

      const report = await this.networking.send<ReportRto>(
        `${MICROSERVICE.REELS}.${CONTROLLER.REPORTS}.${ACTION.UPDATE}`,
        updateReportDto,
      );
      return report;
    } catch (error) {
      this.logger.error(`Error updating report ${id}:`, error);
      throw new HttpException(
        'Failed to update report',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Delete('report/:id')
  async deleteReport(@Param('id') id: string): Promise<SuccessRto> {
    this.logger.log(`Received request to delete report with id: ${id}`);

    try {
      const response = await this.networking.send<SuccessRto>(
        `${MICROSERVICE.REELS}.${CONTROLLER.REPORTS}.${ACTION.DELETE}`,
        id,
      );
      return response;
    } catch (error) {
      this.logger.error(`Error deleting report ${id}:`, error);
      throw new HttpException(
        'Failed to delete report',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Post('recommendations')
  async updateRecommendations(
    @ActiveUser() user: User,
    @Body() recommendationsDto: RecommendedReelGatewayDto,
  ): Promise<RecommendedReelDto> {
    this.logger.log(
      `Received request to update recommendations for user ${user.id}`,
    );

    try {
      const recommendations = await this.networking.send<RecommendedReelDto>(
        `${MICROSERVICE.REELS}.${CONTROLLER.REELS}.${ACTION.UPDATE_RECOMMENDATIONS}`,
        {
          userId: recommendationsDto.userId,
          recommendedReels: recommendationsDto.recommendedReels,
        },
      );

      return recommendations;
    } catch (error) {
      this.logger.error(
        `Error updating recommendations for user ${user.id}:`,
        error,
      );
      throw new HttpException(
        'Failed to update recommendations',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('recommendations/score')
  async getRecommendationsByScore(
    @ActiveUser() user: User,
    @Query('minScore') minScore: string,
    @Query('limit', new ParseIntPipe({ optional: true } as ParseIntPipeOptions))
    limit?: number,
  ): Promise<ReelGatewayRto[]> {
    this.logger.log(
      `Received request to get recommendations by score for user ${user.id}`,
    );

    try {
      const parsedMinScore = parseFloat(minScore);
      if (isNaN(parsedMinScore)) {
        throw new BadRequestException('minScore must be a valid number');
      }

      // First get the recommendations
      const recommendations = await this.networking.send<RecommendedReelDto>(
        `${MICROSERVICE.REELS}.${CONTROLLER.REELS}.${ACTION.GET_RECOMMENDATIONS_BY_SCORE}`,
        {
          userId: user.id,
          minScore: parsedMinScore,
          limit,
        },
      );

      if (!recommendations || recommendations.recommendedReels.length === 0) {
        return [];
      }

      // Sort recommendations by score in descending order
      const sortedRecommendations = recommendations.recommendedReels.sort(
        (a, b) => b.score - a.score,
      );

      // Get the reel IDs in sorted order
      const reelIds = sortedRecommendations.map((rec) => rec.reelId);

      // Fetch the actual reels
      const reels = await this.networking.send<ReelRto[]>(
        `${MICROSERVICE.REELS}.${CONTROLLER.REELS}.${ACTION.GET_MANY}`,
        {
          paginationOptions: {
            page: 1,
            limit: reelIds.length,
          },
          userid: user.id,
          reelIds: reelIds,
        },
      );

      // Populate the reels with gateway-specific data
      return this.reelService.populateReelList(reels);
    } catch (error) {
      this.logger.error(
        `Error getting recommendations by score for user ${user.id}:`,
        error,
      );
      throw new HttpException(
        'Failed to get recommendations',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('analytics/liked')
  async getLikedReelsAnalytics(
    @Query('userId') userId: string,
  ): Promise<ReelAnalyticsDto> {
    this.logger.log(`Getting liked reels analytics for user ${userId}`);

    try {
      const analytics = await this.networking.send<ReelAnalyticsDto>(
        `${MICROSERVICE.REELS}.${CONTROLLER.REELS}.${ACTION.GET_LIKED_REELS_ANALYTICS}`,
        userId,
      );

      return analytics;
    } catch (error) {
      this.logger.error(
        `Error getting liked reels analytics for user ${userId}:`,
        error,
      );
      throw new HttpException(
        'Failed to get liked reels analytics',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('user/:userId')
  async getReelsByUserId(
    @ActiveUser() user: User,
    @Param('userId') userId: string,
    @Query('page') page: string,
    @Query('limit') limit: string,
  ): Promise<ReelGatewayRto[]> {
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

    this.logger.log(
      `Received request to get reels for user ${userId} with pagination: page=${paginationOptions.page}, limit=${paginationOptions.limit}`,
    );

    const reels = await this.networking.send<ReelRto[]>(
      `${MICROSERVICE.REELS}.${CONTROLLER.REELS}.${ACTION.GET_BY_USER_ID}`,
      {
        userId,
        paginationOptions,
        userid: user.id,
      },
    );

    return this.reelService.populateReelList(reels);
  }
}
