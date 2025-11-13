
import { StatusCodes } from "http-status-codes";
import { error, success } from "../utils/responseHandler.js";
import express, { Request, Response } from "express";
import userService from "../services/user.service.js";

const router = express.Router();

// POST /:userId/favorites 
router.post("/:userId/favorites", async (req: Request, res: Response) => {
    const userId = Number(req.params.userId);
    const artworkId = Number(req.body.artworkId);

    try {
        if (!req.body.artworkId) {
            return error(res, StatusCodes.BAD_REQUEST, "MISSING_FIELD", " 'artworkId' is required");
        }

        const favorite = await userService.addFavorite(userId, artworkId);

        req.log.info({ userId: userId, artworkId: artworkId, favoriteId: favorite.id, msg: `User ${userId} successfully added artwork ${artworkId} to favorites.` });

        return success(res, favorite, StatusCodes.CREATED);

    } catch (err: any) {

        req.log.error({ err: err, userId: userId, artworkId: artworkId, msg: "" });

        return error(res, StatusCodes.INTERNAL_SERVER_ERROR, "SERVER_ERROR", "添加收藏失败，请稍后重试。");
    }
});


// DELETE /:userId/favorites/:artworkId 
router.delete("/:userId/favorites/:artworkId", async (req: Request, res: Response) => {
    const userId = Number(req.params.userId);
    const artworkId = Number(req.params.artworkId);

    try {
        await userService.removeFavorite(userId, artworkId);

        req.log.info({ userId: userId, artworkId: artworkId });

        return success(res, null, StatusCodes.NO_CONTENT);

    } catch (err: any) {
        req.log.error({ err: err, userId: userId, artworkId: artworkId });
        return error(res, StatusCodes.INTERNAL_SERVER_ERROR, "SERVER_ERROR", "移除收藏失败");
    }
});


// GET /:userId/favorites
router.get("/:userId/favorites", async (req: Request, res: Response) => {
    const userId = Number(req.params.userId);

    try {
        const favorites = await userService.getUserFavorites(userId);

        req.log.info({ userId: userId });

        return success(res, favorites, StatusCodes.OK);

    } catch (err: any) {
        req.log.error({ err: err, userId: userId });
        return error(res, StatusCodes.INTERNAL_SERVER_ERROR, "SERVER_ERROR", "获取收藏列表失败。");
    }
});


export default router;