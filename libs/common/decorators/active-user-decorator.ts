import { createParamDecorator, type ExecutionContext } from '@nestjs/common';
import { type User } from '../entities/user/user-entity';

export const ActiveUser = createParamDecorator(
  (field: keyof User, context: ExecutionContext) => {
    const request = context.switchToHttp().getRequest<{ user: User }>();
    const { user } = request;
    return field ? user?.[field] : user;
  },
);
