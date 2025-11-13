import logger from '../utils/logger.js';
import { Request, Response, NextFunction } from 'express';
import { v4 as uuidv4 } from 'uuid';

export const requestTracer = (req: Request, res: Response, next: NextFunction) => {
    const reqId = uuidv4();
    (req as any).id = reqId; 
    res.setHeader('X-Request-ID', reqId);
    
    (req as any).log = logger.child({ reqId });
    
    next();
};