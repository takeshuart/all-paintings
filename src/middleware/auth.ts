import { Request, Response, NextFunction } from 'express';
import jwt, { JwtPayload } from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
    console.error("Fatal Error: JWT_SECRET is not set in environment variables!");
    process.exit(1);
}

declare global {
    namespace Express {
        interface Request {
            user?: {
                userId: string;
            };
        }
    }
}

/**
 * Optional Authentication Middleware (Soft Auth):
 * This middleware attempts to authenticate the user but always allows the request to proceed.
 * 1. Attempts to retrieve the 'accessToken' from the HTTP Only Cookie.
 * 2. If the token exists and is valid, it extracts the user ID and attaches the user's { id } to req.user.
 * 3. Always calls next() regardless of token presence or validity (unless a critical error occurs).
 * 4. Usage: If req.user is set, the business logic (e.g., logging) can treat the user as logged in.
 */
export const optionalAuthJWT = (req: Request, res: Response, next: NextFunction) => {

    //set access token when user login
    const accessToken = req.cookies?.accessToken;

    if (!accessToken) {
        return next();
    }
    try {
        const decoded = jwt.verify(accessToken, JWT_SECRET) as JwtPayload;

        req.user = { userId: decoded.id };

    } catch (err) {
        console.log("Optional Auth: Token found but invalid/expired. Continuing as unauthenticated user.");
    }

    // ALWAYS allow access
    next();
};