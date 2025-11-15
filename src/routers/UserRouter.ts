import express from "express";
import userService from "../services/user.service.js";
import jwt from "jsonwebtoken";
import { optionalAuthJWT } from "../middleware/auth.js";
import { AppError } from "../error/AppError.js";
import { ERROR_CODES } from "../error/errorCodes.js";
import { validate } from "../middleware/validate.js";
import { RegisterSchema } from "../schemas/user.schema.js";
import { error, success } from "../utils/responseHandler.js";
import { StatusCodes } from "http-status-codes";

const router = express.Router();
export const COOKIE_KEY = 'accessToken'
// ======================================
// User API Routes
// Prefix: /api/v1/user
// ======================================
const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
    console.error("Fatal Error: JWT_SECRET is not set in environment variables!");
    process.exit(1);
}

router.post("/register", validate(RegisterSchema), async (req, res, next) => {
    try {
        const { password, email, phone } = req.body;
        const user = await userService.register(password, email, phone);
        success(res, user, StatusCodes.CREATED)
    } catch (err) {
        req.log.error({ err: err })
        if (err instanceof AppError) {
            error(res, StatusCodes.BAD_REQUEST, err.code)
        } else {
            error(res, StatusCodes.INTERNAL_SERVER_ERROR, "Internal server error")
        }
    }
});


router.post("/login", async (req, res, next) => {
    try {
        const { id, password } = req.body;

        const user = await userService.login(id, password);

        const accessToken = jwt.sign(
            { id: user.userId },
            JWT_SECRET,
            {
                expiresIn: "6h",
                subject: user.userId.toString(),
            }
        );


        // 3.set JWT HTTP Only Cookie
        res.cookie(COOKIE_KEY, accessToken, {
            httpOnly: true,
            // secure: process.env.NODE_ENV === 'production',// if TRUE ,only attach cookie in HTTPS request
            sameSite: 'lax',
            maxAge: 6 * 3600000,
        });

        success(res, user,)

    } catch (err) {
        req.log.error({ err: err })
        if (err instanceof AppError) {
            error(res, StatusCodes.UNAUTHORIZED, err.code)
        } else {
            error(res, StatusCodes.INTERNAL_SERVER_ERROR, "Internal server error")
        }
    }
});

/**
 * GET /me
 *
 * This endpoint allows the front-end to restore the user's authentication state
 * after a page refresh without requiring the user to log in again.
 * It relies on the JWT stored in the HttpOnly cookie to identify the user.
 */
router.get('/me', optionalAuthJWT, async (req, res) => {
    try {
        const userId = req.user?.userId;
        if (!userId) {
            if (!userId) throw AppError.unauthorized("No login status found");
        }

        const user = await userService.findUser(userId.toString())
        if (!user) throw new AppError(ERROR_CODES.USER_NOT_FOUND, "User not found", 404);


        success(res, user)

    } catch (err: any) {
        console.error("relogin error:", err);
        res.status(500).json({ success: false, error: "Internal server error" });
    }
})

router.post('/logout', (_, res) => {
    try {
        res.clearCookie(COOKIE_KEY, {
            httpOnly: true,
            sameSite: 'lax',
            // secure: process.env.NODE_ENV === 'production', // 如果 login 时用了 secure
        });

        success(res, '')
    } catch (err) {
        console.error('Logout error:', err);
        return res.status(500).json({ success: false, error: 'Internal server error' });
    }
});


export default router;
