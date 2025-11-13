import express, { Request, Response } from "express";
import { QueryTypes } from "sequelize";
import { Sequelize } from 'sequelize-typescript';
import { VincentArtwork } from "../db/models/VincentArtwork.js";
import { initDatabase, sequelize } from "../db/db2.js";
import { ArtworkSearchParams, findVincentArtworks } from "../services/artwork.service.js";
import { optionalAuthJWT } from "../middleware/auth.js";
import { error, success } from "../utils/responseHandler.js";
import { StatusCodes } from "http-status-codes";
import { HttpStatusCode } from "axios";
import { ERROR_CODES } from "../error/errorCodes.js";
import { prisma } from "../lib/prismaDB.js";

const router = express.Router();

/**
 * random a artwork
 * before '/:id'
 */
router.get('/surprise', optionalAuthJWT, async (req: any, res) => {
    try {
        const userId = req.user?.userId;
        console.log(`[API LOG] /surprise.\t UserID:${userId}`)
        const artwork = await VincentArtwork.findOne({
            where: { isHighlight: 1 },
            order: Sequelize.literal('RANDOM()'), // SQLite
        });

        if (artwork) {
            const at: VincentArtwork = artwork as VincentArtwork
            console.log('[API LOG] /surprise:' + at.id)
            // res.json(artwork)
            success(res, artwork, StatusCodes.OK)
        }
    } catch (error) {
        console.error('Error finding surprise', error);
    }
})

//test case: http://localhost:5001/artworks/vincent/bypage?page=5&pageSize=10&period=Paris
router.get('/config', async (req: any, res) => {
    const condition = req.query.cond || ''
    const result = await findSearchConditions(condition)
    res.json(result)
});

async function findSearchConditions(cond: string) {
    try {
        const sql = `SELECT DISTINCT ${cond} FROM artwork_vincent`
        const distinctGenres = await sequelize.query(sql, {
            type: QueryTypes.SELECT
        });
        return distinctGenres;
    } catch (error) {
        console.error('Error executing distinct query:', error);
        throw error;
    }
}



/**
 * GET /api/artworks/vincent
 * Handler for fetching artworks with complex filtering, pagination, and conditional color sorting.
 */
router.get('/', async (req: Request, res: Response) => {
    try {
        // Pagination: default to page 1 and size 5.
        const page = parseInt(req.query.page as string) || 1;
        const pageSize = parseInt(req.query.pageSize as string) || 5;

        const searchText = (req.query.search as string) || null;
        const period = (req.query.period as string) || null;
        const hasImage = (req.query.hasImage === 'true');

        const genres = Array.isArray(req.query.genres) ? (req.query.genres as string[]) : [];
        const techniques = Array.isArray(req.query.techniques) ? (req.query.techniques as string[]) : [];

        // Color Sorting Field: Expecting a score field name string (e.g., 'score_05'), default to null.
        const colorField = (req.query.colorField as string) || null;

        console.log(`Incoming request parameters: ${JSON.stringify(req.query)}\n`);

        // Map query parameters to the service layer
        const searchParams: ArtworkSearchParams = {
            page: page,
            pageSize: pageSize,
            searchText: searchText,
            hasImage: hasImage,
            period: period,
            genres: genres,
            techniques: techniques,
            colorField: colorField,
        };

        const { artworks: rows, totalCount: count } = await findVincentArtworks(searchParams);

        // res.json({
        //     rows: rows,
        //     totalCount: count
        // });
        success(res, rows, StatusCodes.OK, { totalCount: count })
    } catch (err: any) {
        console.error(`Error in /bypage router: ${err.message || err}`);
        res.status(500).json({
            error: `Internal server error during artwork search.`,
            details: err.message || 'An unknown error occurred.'
        });
    }
});

//TODO: switch Squenlize to Prisma,then use join-query
router.get('/:id', optionalAuthJWT, async (req: any, res) => {
    try {
        const artworkID = req.params.id;
        const userId = req.user?.userId;
        const artwork = await VincentArtwork.findByPk(artworkID);
        if (!artwork) {
            return error(res, StatusCodes.NOT_FOUND, ERROR_CODES.NOT_FOUND);
        }
        let jsonObj: any = artwork.toJSON()
        jsonObj.isFavorited = false

        if (userId) {
            const favorite = await prisma.userFavorites.findFirst({
                where: {
                    userId: parseInt(userId),
                    artworkId: parseInt(artworkID),
                    deletedAt: null
                },
                select: { id: true }
            })

            if (favorite) {
                jsonObj.isFavorited = true
            }
        }

        req.log.info({ userId, artworkID })
        success(res, jsonObj)
    } catch (err) {
        req.log.error({ err: err })
        error(res, StatusCodes.INTERNAL_SERVER_ERROR, ERROR_CODES.NOT_FOUND)
    }
})


export default router;

