import { cloudinary } from '@app/common//config/cloudinary.config';
import { CreatePostGatewayDto } from '@app/common//dto/gateway/social/post/post-gateway.dto';
import { UpdatePostGatewayDto } from '@app/common//dto/gateway/social/post/update-post.dto';
import { CreatePostDto } from '@app/common//dto/microservices/social/post/create-post.dto';
import { ACTION } from '@app/common//enum/action.enum';
import { CONTROLLER } from '@app/common//enum/controller.enum';
import { MICROSERVICE } from '@app/common//enum/microservice.enum';
import { PostRto } from '@app/common//rto/social/post/post.rto';
import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { NetworkingService } from '@pp/networking';
import { UploadApiResponse } from 'cloudinary';

@Injectable()
export class PostService {}
