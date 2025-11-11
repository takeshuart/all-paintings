import express from "express";
import userService from "../services/user.service.js";
import jwt from "jsonwebtoken";
import { optionalAuthJWT } from "../middleware/auth.js";
import { AppError } from "../error/AppError.js";
import { ERROR_CODES } from "../error/errorCodes.js";
import { validate } from "../middleware/validate.js";
import { RegisterSchema } from "../schemas/user.schema.js";

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
        res.json({ success: true, user });
    } catch (err) {
        next(err);
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

        return res.status(200).json({
            success: true,
            message: "Login successful",
            user    //without password
        });

    } catch (err) {
        next(err)
    }
});

/**
 * GET /me
 *
 * This endpoint allows the front-end to restore the user's authentication state
 * after a page refresh without requiring the user to log in again.
 * It relies on the JWT stored in the HttpOnly cookie to identify the user.
 */
router.post('/me', optionalAuthJWT, async (req, res) => {
    try {
        const userId = req.user?.userId;
        if (!userId) {
            if (!userId) throw AppError.unauthorized("No login status found");
        }

        const user = await userService.findUser(userId.toString())
        if (!user) throw new AppError(ERROR_CODES.USER_NOT_FOUND, "User not found", 404);

        return res.status(200).json({
            success: true,
            message: "Relogin successful",
            user    //without password
        });
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

        return res.status(200).json({ success: true, message: 'Logout successful' });
    } catch (err) {
        console.error('Logout error:', err);
        return res.status(500).json({ success: false, error: 'Internal server error' });
    }
});

router.get("/", async (req, res) => {
    try {
        const users = await userService.getAllUsers();
        res.json(users);
    } catch (err) {
        console.error("Get users error:", err);
        res.status(500).json({ error: "Failed to fetch users" });
    }
});

router.post("/:userId/favorites", async (req, res) => {
    try {
        const { userId } = req.params;
        const { artworkId } = req.body;
        if (!artworkId) {
            return res.status(400).json({ error: "artworkId is required" });
        }
        const favorite = await userService.addFavorite(Number(userId), Number(artworkId));
        res.json({ success: true, favorite });
    } catch (err: any) {
        console.error("Add favorite error:", err);
        res.status(400).json({ success: false, error: err.message });
    }
});


router.delete("/:userId/favorites/:artworkId", async (req, res) => {
    try {
        const { userId, artworkId } = req.params;
        const result = await userService.removeFavorite(Number(userId), Number(artworkId));
        res.json({ success: true, result });
    } catch (err: any) {
        console.error("Remove favorite error:", err);
        res.status(400).json({ success: false, error: err.message });
    }
});


router.get("/:userId/favorites", async (req, res) => {
    try {
        const { userId } = req.params;
        const favorites = await userService.getUserFavorites(Number(userId));
        res.json(favorites);
    } catch (err) {
        console.error("Get favorites error:", err);
        res.status(500).json({ error: "Failed to fetch favorites" });
    }
});

export default router;
