import { RequestHandler } from 'express';
import multer from 'multer';
import { ZodObject, ZodRawShape, z } from 'zod';
import { Auth } from '@/delivery/http/auth';
import { RateLimit } from '@/delivery/http/rate';
import { Get, Post, Put, RouteHandlerParams } from '@/delivery/http/route';
import { AbstractRouter } from '@/delivery/http/router/abstract';
import { Router } from '@/delivery/http/router/decorator';
import { userSchema } from '@/domain/entity/User';
import {
  InvalidDataError,
  NotFoundError,
  TooManyRequestsError,
  UnauthorizedError
} from '@/domain/errors';

@Router('/user')
export class UserRouter extends AbstractRouter {
  public static uploadAvatarHandler = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 10 * 1024 * 1024 }
  }).single('avatar') as unknown as RequestHandler;

  public static updateBodySchema = z.object({
    name: z.string().min(1).max(64).optional().nullable(),
    avatar: z.custom().meta({ type: 'string', format: 'binary' }).optional()
  });

  @Put('/', {
    handlers: [UserRouter.uploadAvatarHandler],
    body: UserRouter.updateBodySchema,
    bodyContentType: 'multipart/form-data',
    result: z.object({ user: userSchema }),
    errors: [
      InvalidDataError,
      UnauthorizedError,
      NotFoundError,
      TooManyRequestsError
    ]
  })
  @Auth({ required: true })
  @RateLimit({ windowMs: 60 * 1000, max: 10 })
  public async update({
    useCase,
    res,
    userId,
    body: { name },
    req
  }: RouteHandlerParams<typeof UserRouter.updateBodySchema>) {
    const avatarBuffer = req.file?.buffer ?? null;
    const { user } = await useCase.user.update({ userId, name, avatarBuffer });

    return res.status(200).json({ user });
  }

  public static getAvatarParamsSchema = z.object({
    userId: z.coerce.number().int()
  });

  @Get('/:userId/avatar.png', {
    params: UserRouter.getAvatarParamsSchema,
    errors: [NotFoundError]
  })
  @RateLimit({ windowMs: 60 * 1000, max: 60 })
  public async getAvatar({
    useCase,
    res,
    params: { userId }
  }: RouteHandlerParams<
    ZodObject<ZodRawShape>,
    typeof UserRouter.getAvatarParamsSchema
  >) {
    const { stream, mimeType } = await useCase.user.readAvatar({ userId });

    res.set('Content-Type', mimeType);
    stream.pipe(res);
  }

  public static getListQuerySchema = z.object({
    cursor: z.coerce.number().int().optional().nullable(),
    limit: z.coerce.number().int().min(1).max(100).optional()
  });

  @Get('/list', {
    query: UserRouter.getListQuerySchema,
    result: z.object({
      data: z.array(userSchema),
      nextCursor: z.number().int().nullable()
    }),
    errors: []
  })
  @RateLimit({ windowMs: 60 * 1000, max: 30 })
  public async getList({
    useCase,
    res,
    query: { cursor, limit }
  }: RouteHandlerParams<typeof UserRouter.getListQuerySchema>) {
    const result = await useCase.user.getList({ cursor, limit });

    return res.status(200).json(result);
  }

  public static getByIdOrLoginParamsSchema = z.object({
    idOrLogin: z.string()
  });

  @Get('/:idOrLogin', {
    params: UserRouter.getByIdOrLoginParamsSchema,
    result: userSchema,
    errors: [NotFoundError]
  })
  @RateLimit({ windowMs: 60 * 1000, max: 60 })
  public async getByIdOrLogin({
    useCase,
    res,
    params: { idOrLogin }
  }: RouteHandlerParams<
    ZodObject<ZodRawShape>,
    typeof UserRouter.getByIdOrLoginParamsSchema
  >) {
    const { user } = await useCase.user.getByIdOrLogin({ idOrLogin });

    return res.status(200).json(user);
  }

  public static banBodySchema = z.object({
    login: z.string().min(1),
    banReason: z.string().nullable().default(null)
  });

  @Post('/ban', {
    body: UserRouter.banBodySchema,
    result: z.object({ success: z.boolean() })
  })
  @Auth({ required: true, adminOnly: true })
  public async ban({
    useCase,
    res,
    body: { login, banReason }
  }: RouteHandlerParams<typeof UserRouter.banBodySchema>) {
    await useCase.user.ban({ login, banReason });

    return res.status(200).json({ success: true });
  }

  public static unbanBodySchema = z.object({
    login: z.string().min(1)
  });

  @Post('/unban', {
    body: UserRouter.unbanBodySchema,
    result: z.object({ success: z.boolean() })
  })
  @Auth({ required: true, adminOnly: true })
  public async unban({
    useCase,
    res,
    body: { login }
  }: RouteHandlerParams<typeof UserRouter.unbanBodySchema>) {
    await useCase.user.unban({ login });

    return res.status(200).json({ success: true });
  }
}
