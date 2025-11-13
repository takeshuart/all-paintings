import pino from 'pino';

const level = process.env.NODE_ENV === 'production' ? 'info' : 'debug';

const logger = pino({
    level: level,
    transport: process.env.NODE_ENV !== 'production' ? {
        target: 'pino-pretty',
        options: {
            colorize: true,
            translateTime: 'SYS:yyyy-mm-dd HH:MM:ss',
            ignore: 'pid,hostname',
        },
    } : undefined,
    base: {
        application: 'artdb-api',
    }
});

export default logger;