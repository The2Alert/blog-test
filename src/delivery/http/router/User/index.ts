import { z } from 'zod';
import { Get, RouteHandlerParams } from '@/delivery/http/route';
import { AbstractRouter } from '@/delivery/http/router/abstract';
import { Router } from '@/delivery/http/router/decorator';

@Router('/user')
export class UserRouter extends AbstractRouter {
  public static getFileParamsSchema = z.object({
    userId: z.coerce.number()
  });

  @Get('/:userId/avatar.png', {
    params: UserRouter.getFileParamsSchema
  })
  public async getAvatar({
    useCase,
    res,
    params: { userId }
  }: RouteHandlerParams<any, typeof UserRouter.getFileParamsSchema>) {
    const { stream, mimeType } = await useCase.user.readAvatar({
      userId
    });

    res.set('Content-Type', mimeType);
    stream.pipe(res);
  }
}
