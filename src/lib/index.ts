import * as bcrypt from 'bcrypt';
import crypto from 'crypto';
import fs from 'fs/promises';
import jwt from 'jsonwebtoken';
import path from 'path';
import sharp from 'sharp';
import { MarkdownLib } from './utils/Markdown';

export class Lib {
  public static create(): Lib {
    return new Lib();
  }

  public readonly fs = fs;
  public readonly path = path;
  public readonly jwt = jwt;
  public readonly crypto = crypto;
  public readonly bcrypt = bcrypt;
  public readonly sharp = sharp;
  public readonly markdown = new MarkdownLib();
}
