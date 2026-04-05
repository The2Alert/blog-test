import { z } from 'zod';
import { Auth } from '@/delivery/http/auth';
import { RateLimit } from '@/delivery/http/rate';
import { Get, Post, RouteHandlerParams } from '@/delivery/http/route';
import { AbstractRouter } from '@/delivery/http/router/abstract';
import { Router } from '@/delivery/http/router/decorator';
import { userSchema } from '@/domain/entity/User';
import { InvalidDataError, TooManyRequestsError } from '@/domain/errors';

@Router('/auth')
export class AuthRouter extends AbstractRouter {
  public static authorizeBodySchema = z.object({
    login: z.string(),
    password: z.string()
  });

  @Post('/authorize', {
    body: AuthRouter.authorizeBodySchema,
    result: z.object({
      user: userSchema,
      accessToken: z.string(),
      refreshToken: z.string()
    })
  })
  @RateLimit({ windowMs: 15 * 60 * 1000, max: 10 })
  public async authorize({
    useCase,
    res,
    body: { login, password }
  }: RouteHandlerParams<typeof AuthRouter.authorizeBodySchema>) {
    const { user, accessToken, refreshToken } = await useCase.auth.authorize({
      login,
      password
    });

    return res.status(200).json({ user, accessToken, refreshToken });
  }

  public static registerBodySchema = z.object({
    login: z
      .string()
      .min(3)
      .max(32)
      .regex(/^[a-zA-Z0-9_]+$/),
    password: z.string().min(6).max(128),
    name: z.string().min(1).max(64).optional().nullable()
  });

  @Post('/register', {
    body: AuthRouter.registerBodySchema,
    result: z.object({
      user: userSchema,
      accessToken: z.string(),
      refreshToken: z.string()
    }),
    errors: [InvalidDataError, TooManyRequestsError]
  })
  @RateLimit({ windowMs: 60 * 60 * 1000, max: 5 })
  public async register({
    useCase,
    res,
    body: { login, password, name }
  }: RouteHandlerParams<typeof AuthRouter.registerBodySchema>) {
    const result = await useCase.auth.register({ login, password, name });

    return res.status(201).json(result);
  }

  @Get('/user', {
    result: userSchema
  })
  @Auth({ required: true })
  public async getUser({ useCase, res, userId }: RouteHandlerParams) {
    const { user } = await useCase.auth.getUser({ userId });

    return res.status(200).json(user);
  }

  public static refreshTokensBodySchema = z.object({
    refreshToken: z.string().min(1)
  });

  @Post('/refresh', {
    body: AuthRouter.refreshTokensBodySchema,
    result: z.object({
      accessToken: z.string(),
      refreshToken: z.string()
    })
  })
  @RateLimit({ windowMs: 15 * 60 * 1000, max: 30 })
  public async refreshTokens({
    useCase,
    res,
    body: { refreshToken }
  }: RouteHandlerParams<typeof AuthRouter.refreshTokensBodySchema>) {
    const result = await useCase.auth.refreshTokens({ refreshToken });

    return res.status(200).json(result);
  }
}
