import { Request, Response, NextFunction } from 'express';

export const accessLogger = (req: Request, res: Response, next: NextFunction) => {
    const start = process.hrtime(); 
    
    res.on('finish', () => {
        const [seconds, nanoseconds] = process.hrtime(start);
        const durationMs = (seconds * 1000) + (nanoseconds / 1e6); 
        
        (req as any).log.info({
            req: {
                method: req.method,
                url: req.originalUrl,
                ip: req.ip,
            },
            res: {
                statusCode: res.statusCode,
                durationMs: durationMs.toFixed(2),
            },
            msg: `HTTP Request Finished`
        });
    });
    
    next();
};