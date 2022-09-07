import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export interface IAuth {
  id: number;

  userId: string;

  password: string;

  role: string;
}
export const Auth = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): IAuth => {
    const request = ctx.switchToHttp().getRequest();
    const authUser = request.authUser;

    return authUser;
  },
);
