import express, { Request, Response } from "express";
import path from "path";
import { DataTypes, Model, Op, QueryTypes, literal } from "sequelize";
import { Sequelize } from 'sequelize-typescript';
import { VincentArtwork } from "../db/models/VincentArtwork.js";
import { initDatabase, sequelize } from "../db/db2.js";
import { ArtworkSearchParams, findVincentArtworks } from "../services/artwork.service.js";

const router = express.Router();

router.get('/supriseme', async (req: any, res) => {
    try {
        const artwork = await VincentArtwork.findOne({
            where: { isHighlight: 1 },
            order: Sequelize.literal('RANDOM()'), // SQLite
        });

        if (artwork) {
            const at: VincentArtwork = artwork as VincentArtwork
            console.log('surpriseme:' + at.id)
            res.json(artwork)
        }
    } catch (error) {
        console.error('Error finding surprise', error);
    }
})


router.get('/id/:id', async (req: any, res) => {
    try {
        const artwork = await VincentArtwork.findByPk(req.params.id);
        if (artwork) {
            res.json(artwork)
        }
    } catch (error) {
        console.error('Error finding artwork by ID:', error);
    }
})


/**
 * GET /api/artworks/bypage
 * Handler for fetching artworks with complex filtering, pagination, and conditional color sorting.
 */
router.get('/bypage', async (req: Request, res: Response) => {
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

        const {artworks:rows,totalCount:count} = await findVincentArtworks(searchParams);

        res.json({
            rows:rows,
            totalCount:count
        });

    } catch (err: any) {
        console.error(`Error in /bypage router: ${err.message || err}`);
        res.status(500).json({
            error: `Internal server error during artwork search.`,
            details: err.message || 'An unknown error occurred.'
        });
    }
});

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

export default router;

