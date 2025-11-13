import { Request } from 'express';
import pino from 'pino';

// 扩展 Express Request 接口，加入 log 属性
declare global {
  namespace Express {
    interface Request {
      log: pino.Logger; 
    //   id?: string; 
    }
  }
}