import { PartialType } from '@nestjs/mapped-types';
import { CreatePostGatewayDto } from './post-gateway.dto';

export class UpdatePostGatewayDto extends PartialType(CreatePostGatewayDto) {}
