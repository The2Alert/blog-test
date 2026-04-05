import { Prisma } from '@prisma/client';
import { fileDefaultSelect } from '@/adapter/repository/File';
import { PrismaRepository } from '@/adapter/repository/Prisma';
import { tagDefaultSelect } from '@/adapter/repository/Tag';
import { userDefaultSelect } from '@/adapter/repository/User';
import { RepositoryParams } from '@/adapter/repository/types';
import { Post } from '@/domain/entity/Post';

export const postDefaultSelect: Prisma.PostSelect = {
  id: true,
  slug: true,
  title: true,
  htmlTitle: true,
  description: true,
  htmlDescription: true,
  deleted: true,
  preview1x1Id: true,
  preview4x3Id: true,
  preview16x9Id: true,
  createdAt: true,
  updatedAt: true
};

export const postListSelect: Prisma.PostSelect = {
  ...postDefaultSelect,
  preview1x1: {
    select: fileDefaultSelect
  },
  preview4x3: {
    select: fileDefaultSelect
  },
  preview16x9: {
    select: fileDefaultSelect
  },
  tags: {
    select: {
      postId: true,
      tagId: true,
      order: true,
      tag: {
        select: tagDefaultSelect
      }
    },
    orderBy: { order: 'asc' }
  },
  users: {
    select: {
      postId: true,
      userId: true,
      role: true,
      user: {
        select: {
          ...userDefaultSelect,
          avatar128x128: {
            select: fileDefaultSelect
          }
        }
      },
      createdAt: true
    }
  }
};

export const postItemSelect: Prisma.PostSelect = {
  ...postListSelect,
  content: true,
  htmlContent: true
};

export class PostRepository extends PrismaRepository<
  Post,
  'Post',
  'default' | 'list' | 'item'
> {
  constructor(protected readonly params: RepositoryParams) {
    const {
      clients: { prisma }
    } = params;

    super(params, (tx) => prisma.getContextClient(tx).post, {
      select: {
        default: postDefaultSelect,
        list: postListSelect,
        item: postItemSelect
      }
    });
  }
}
