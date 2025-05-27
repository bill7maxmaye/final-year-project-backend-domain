import { PostRepository } from '@app/common//baseRepository/social/post-repositories/post.repository';
import { PostReportRepository } from '@app/common//baseRepository/social/post-repositories/report-repository';
import { PostReportDto } from '@app/common//dto/gateway/social/post/post-report.dto';
import { CreatePostDto } from '@app/common//dto/microservices/social/post/create-post.dto';
import { ListAllDto } from '@app/common//dto/microservices/social/post/list-all.dto';
import { PostReportDocument } from '@app/common//models/social/post-report.model';
import { PostDocument } from '@app/common//models/social/post.model';
import { FindResult } from '@app/common//rto/find-result';
import { Injectable, NotFoundException } from '@nestjs/common';

@Injectable()
export class PostService {
  constructor(
    private readonly postRepository: PostRepository,
    private readonly postReportRepository: PostReportRepository,
  ) {}

  async createPost(createPostDto: CreatePostDto): Promise<PostDocument> {
    const post = await this.postRepository.create({
      ...createPostDto,
    });
    console.log('Post created:', post);
    return post;
  }

  async updatePost(
    id: string,
    updatedPostDto: CreatePostDto,
  ): Promise<PostDocument> {
    try {
      console.log('Post before update:', updatedPostDto, id);
      const post = await this.postRepository.updateOneAndRetrieve(
        { _id: id },
        updatedPostDto,
      );

      console.log('Post after update:', post);

      if (!post) {
        throw new NotFoundException(`Post with ID ${id} not found`);
      }

      return post;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new NotFoundException(`Post with ID ${id} not found`);
    }
  }

  async deletePost(id: string): Promise<boolean> {
    try {
      const post = await this.postRepository.findOneAndDelete({ _id: id });

      return post !== null;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new NotFoundException(`Post with ID ${id} not found`);
    }
  }

  async toggleReaction(postId: string, userId: string): Promise<PostDocument> {
    try {
      const post = await this.postRepository.findOne({ _id: postId });

      if (!post) {
        throw new NotFoundException(`Post with ID ${postId} not found`);
      }
      const likedByStrings = post.likedBy.map((id) => id.toString());
      const isLiked = likedByStrings.includes(userId);
      console.log('Post liked by:', post.likedBy, isLiked, userId);
      const updateQuery = isLiked
        ? { $pull: { likedBy: userId } } // remove if already liked
        : { $addToSet: { likedBy: userId } }; // add only if not already there

      await this.postRepository.updateOne({ _id: postId }, updateQuery);

      // Return the updated post (optional: you can refetch it or return original)
      return await this.postRepository.findOne({ _id: postId });
    } catch (error) {
      console.error('Error toggling like/unlike:', error);
      throw new NotFoundException(
        `Post with ID ${postId} failed to update reaction`,
      );
    }
  }

  async findByContentId(contentId: string): Promise<PostReportDocument[]> {
    const response = await this.postReportRepository
      .find({ content_id: contentId })
      .exec();

    return response;
  }

  async getById(id: string): Promise<PostDocument> {
    return this.postRepository.findOne({ _id: id });
  }

  async listAllPosts(query: ListAllDto): Promise<FindResult<PostDocument>> {
    const page = Number(query.page) || 1;
    const limit = Number(query.limit) || 300;
    const skip = (page - 1) * limit;

    const filter: any = {};

    if (query.search) {
      filter.$or = [
        { content: { $regex: query.search, $options: 'i' } },
        { title: { $regex: query.search, $options: 'i' } },
      ];
    }

    const [data, total] = await Promise.all([
      this.postRepository.findMany(filter, {
        skip,
        limit,
        sort: { createdAt: -1 },
      }),
      this.postRepository.countDocuments(filter),
    ]);

    const totalPages = Math.ceil(total / limit);

    const nextPage = page < totalPages ? page + 1 : null;
    const prevPage = page > 1 ? page - 1 : null;

    const baseUrl = '/posts'; // or inject base URL if needed
    const next = nextPage
      ? `${baseUrl}?page=${nextPage}&limit=${limit}`
      : undefined;
    const previous = prevPage
      ? `${baseUrl}?page=${prevPage}&limit=${limit}`
      : undefined;

    return FindResult.fromListAll(data, total, next, previous);
  }
  // Hard delete alternative (uncomment if needed)
  /*
    async hardDeletePost(id: string): Promise<{ success: boolean }> {
      try {
        const result = await this.postRepository.deleteOne({ _id: id });
        if (result.deletedCount === 0) {
          throw new NotFoundException(`Post with ID ${id} not found`);
        }
        return { success: true };
      } catch (error) {
        if (error instanceof NotFoundException) {
          throw error;
        }
        throw new NotFoundException(`Post with ID ${id} not found`);
      }
    }
    */

  async resolveReport(
    reportId: string,
    resolvedBy: string,
  ): Promise<{ success: boolean }> {
    try {
      console.log('Resolving report with ID:', reportId);
      const report = await this.postReportRepository.findOneAndUpdate(
        { _id: reportId },
        {
          status: 'RESOLVED',
          resolvedBy,
          resolvedAt: new Date(),
        },
      );
      console.log('Report found:', report);
      if (!report) {
        console.log('Report not found>>>>>');
        throw new NotFoundException(`Report with ID ${reportId} not found`);
      }
      console.log('Report resolved:', report);
      return { success: true };
    } catch (error) {
      console.error('Error resolving report:', error);
      return { success: false };
    }
  }

  async reportPost(report: PostReportDto): Promise<{ success: boolean }> {
    try {
      console.log('Reporting post:', report);

      const post = await this.postRepository.findOne({
        _id: report.content_id,
      });

      console.log('Post found:', post);

      if (!post) {
        console.log('Post not found>>>>>');
        throw new NotFoundException(
          `Post with ID ${report.content_id} not found`,
        );
      }
      

      console.log('Post found>>>:', post);

      // const existingReport = await this.postReportRepository.findOne({
      //   content_id: report.content_id,
      //   reporter_id: report?.reporter_id,
      // });
      // console.log('Existing report:', existingReport);

      // if (existingReport) {
      //   throw new NotFoundException(
      //     `Post with ID ${report.content_id} already reported by this user`,
      //   );
      // }

      await this.postReportRepository.create(report);

      return { success: true };
    } catch (error) {
      console.error('Error reporting post:', error);
      throw new NotFoundException(
        `Post with ID ${report.content_id} not found`,
      );
    }
  }
}
