import { PartialType } from '@nestjs/mapped-types';
import { CreatePostGatewayDto } from './post-gateway.dto';

// update-post-gateway.dto.ts
export class UpdatePostGatewayDto extends PartialType(CreatePostGatewayDto) {}
