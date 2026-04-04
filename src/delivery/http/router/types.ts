import { Middlewares } from '@/delivery/http/middlewares';
import { HttpParams } from '@/delivery/types';

export type RouterParams = HttpParams & Middlewares;
