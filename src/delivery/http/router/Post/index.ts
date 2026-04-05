import { RequestHandler } from 'express';
import multer from 'multer';
import { z } from 'zod';
import { Auth } from '@/delivery/http/auth';
import { RateLimit } from '@/delivery/http/rate';
import {
  Delete,
  Get,
  Post,
  Put,
  RouteHandlerParams
} from '@/delivery/http/route';
import { AbstractRouter } from '@/delivery/http/router/abstract';
import { Router } from '@/delivery/http/router/decorator';
import { postSchema } from '@/domain/entity/Post';
import {
  ForbiddenError,
  InvalidDataError,
  NotFoundError,
  TooManyRequestsError,
  UnauthorizedError
} from '@/domain/errors';

@Router('/post')
export class PostRouter extends AbstractRouter {
  public static uploadPreviewHandler = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 10 * 1024 * 1024 }
  }).single('preview') as unknown as RequestHandler;

  public static tagsPreprocess = z.preprocess(
    (value) => {
      if (typeof value === 'string') {
        try {
          return JSON.parse(value);
        } catch {
          return value.replace(/ /g, '').split(',');
        }
      }

      return value;
    },
    z.array(z.string().min(1).max(64)).optional()
  );

  public static slugSchema = z.string().max(200).optional().nullable();

  public static createBodySchema = z.object({
    title: z.string().min(1).max(500),
    description: z.string().min(1).max(2000),
    content: z.string().min(1),
    slug: PostRouter.slugSchema,
    tags: PostRouter.tagsPreprocess,
    preview: z.custom().meta({ type: 'string', format: 'binary' }).optional()
  });

  @Post('/', {
    handlers: [PostRouter.uploadPreviewHandler],
    body: PostRouter.createBodySchema,
    bodyContentType: 'multipart/form-data',
    result: z.object({ post: postSchema }),
    errors: [
      InvalidDataError,
      UnauthorizedError,
      ForbiddenError,
      TooManyRequestsError
    ]
  })
  @Auth({ required: true })
  @RateLimit({ windowMs: 60 * 1000, max: 10 })
  public async create({
    useCase,
    res,
    userId,
    body: { title, description, content, slug, tags },
    req
  }: RouteHandlerParams<typeof PostRouter.createBodySchema>) {
    const previewBuffer = req.file?.buffer ?? null;
    const { post } = await useCase.post.create({
      userId,
      title,
      description,
      content,
      slug,
      tags,
      previewBuffer
    });

    return res.status(201).json({ post });
  }

  public static updateParamsSchema = z.object({
    postId: z.coerce.number().int()
  });

  public static updateBodySchema = z.object({
    title: z.string().max(500).optional(),
    description: z.string().max(2000).optional(),
    content: z.string().optional(),
    slug: PostRouter.slugSchema,
    tags: PostRouter.tagsPreprocess,
    preview: z.custom().meta({ type: 'string', format: 'binary' }).optional()
  });

  @Put('/:postId', {
    handlers: [PostRouter.uploadPreviewHandler],
    params: PostRouter.updateParamsSchema,
    body: PostRouter.updateBodySchema,
    bodyContentType: 'multipart/form-data',
    result: z.object({ post: postSchema }),
    errors: [
      InvalidDataError,
      UnauthorizedError,
      ForbiddenError,
      NotFoundError,
      TooManyRequestsError
    ]
  })
  @Auth({ required: true })
  @RateLimit({ windowMs: 60 * 1000, max: 20 })
  public async update({
    useCase,
    res,
    userId,
    params: { postId },
    body: { title, description, content, slug, tags },
    req
  }: RouteHandlerParams<
    typeof PostRouter.updateBodySchema,
    typeof PostRouter.updateParamsSchema
  >) {
    const previewBuffer = req.file?.buffer ?? null;
    const { post } = await useCase.post.update({
      postId,
      userId,
      title,
      description,
      content,
      slug,
      tags,
      previewBuffer
    });

    return res.status(200).json({ post });
  }

  public static deleteParamsSchema = z.object({
    postId: z.coerce.number().int()
  });

  @Delete('/:postId', {
    params: PostRouter.deleteParamsSchema,
    result: z.object({ success: z.boolean() }),
    errors: [UnauthorizedError, ForbiddenError, NotFoundError]
  })
  @Auth({ required: true })
  @RateLimit({ windowMs: 60 * 1000, max: 20 })
  public async delete({
    useCase,
    res,
    userId,
    params: { postId }
  }: RouteHandlerParams<
    typeof PostRouter.updateBodySchema,
    typeof PostRouter.deleteParamsSchema
  >) {
    await useCase.post.delete({ postId, userId });

    return res.status(200).json({ success: true });
  }

  public static getListQuerySchema = z.object({
    cursor: z.coerce.number().int().optional().nullable(),
    limit: z.coerce.number().int().min(1).max(100).optional()
  });

  @Get('/list', {
    query: PostRouter.getListQuerySchema,
    result: z.object({
      data: z.array(postSchema),
      nextCursor: z.number().int().nullable()
    }),
    errors: []
  })
  @RateLimit({ windowMs: 60 * 1000, max: 60 })
  public async getList({
    useCase,
    res,
    query: { cursor, limit }
  }: RouteHandlerParams<typeof PostRouter.getListQuerySchema>) {
    const result = await useCase.post.getList({ cursor, limit });

    return res.status(200).json(result);
  }

  public static getParamsSchema = z.object({
    idOrSlug: z.string()
  });

  @Get('/:idOrSlug', {
    params: PostRouter.getParamsSchema,
    result: z.object({ post: postSchema }),
    errors: [NotFoundError]
  })
  @RateLimit({ windowMs: 60 * 1000, max: 60 })
  public async getByIdOrSlug({
    useCase,
    res,
    params: { idOrSlug }
  }: RouteHandlerParams<
    typeof PostRouter.updateBodySchema,
    typeof PostRouter.getParamsSchema
  >) {
    const { post } = await useCase.post.getByIdOrSlug({ idOrSlug });

    return res.status(200).json({ post });
  }

  public static previewParamsSchema = z.object({
    postId: z.coerce.number().int(),
    ratio: z.enum(['1x1', '4x3', '16x9'])
  });

  @Get('/:postId/preview/:ratio.png', {
    params: PostRouter.previewParamsSchema,
    errors: [NotFoundError]
  })
  @RateLimit({ windowMs: 60 * 1000, max: 120 })
  public async getPreview({
    useCase,
    res,
    params: { postId, ratio }
  }: RouteHandlerParams<
    typeof PostRouter.updateBodySchema,
    typeof PostRouter.previewParamsSchema
  >) {
    const { stream, mimeType } = await useCase.post.readPreview({
      postId,
      ratio
    });

    res.set('Content-Type', mimeType);
    stream.pipe(res);
  }
}
