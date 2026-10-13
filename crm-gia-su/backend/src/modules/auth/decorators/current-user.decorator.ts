import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const CurrentUser = createParamDecorator(
  (data: string, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    const user = request.user;
    if (data === 'profileId') {
      return user?.profileId || user?.sub || user?.id;
    }
    if (data === 'id' || data === 'userId') {
      return user?.sub || user?.id;
    }
    return data ? user?.[data] : user;
  },
);
