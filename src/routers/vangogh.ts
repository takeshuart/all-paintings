import express from "express";
import path from "path";
import { DataTypes, Model, Op, QueryTypes, literal } from "sequelize";
import { Sequelize } from 'sequelize-typescript';
import { VincentArtwork } from "../db/models/VincentArtwork";

const router = express.Router();
export const dbFile = path.join(__dirname, '../../artwork.db');

export const sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: dbFile,
    logging: true,
    models: [VincentArtwork]
});



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


router.get('/bypage', async (req: any, res) => {
    try {
        const page = parseInt(req.query.page) || 0;
        const pageSize = parseInt(req.query.pageSize) || 5;
        const searchText = req.query.search || '';
        const hasImage = req.query.hasImage === 'true';
        const periods: string[] = Array.isArray(req.query.periods) ? req.query.periods : [];
        const genres: string[] = Array.isArray(req.query.genres) ? req.query.genres : [];
        const techniques: string[] = Array.isArray(req.query.techniques) ? req.query.techniques : [];

        console.log(`request:${JSON.stringify(req.query)}`);

        const result = await findAllByPage(searchText, genres, periods, techniques, hasImage, page, pageSize);

        res.json(result);
    } catch (error) {
        res.status(500).json({ error: `Internal server error.\t ${error}` });
    }
});

//test case: http://localhost:5001/artworks/vincent/bypage?page=5&pageSize=10&periods[]=Paris
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


async function findAllByPage(searchText: string, genres: string[], periods: string[],
    techniques: string[], hasImage: boolean, page = 1, pageSize = 10) {
    const offset = (page - 1) * pageSize;

    const whereClause: any = {};
    if (genres.length > 0) {
        whereClause['genre'] = genres
    }
    if (periods.length > 0) {
        whereClause['period'] = periods
    }
    if (techniques.length > 0) {
        whereClause['technique'] = techniques
    }
    if (hasImage) {
        whereClause['primary_image_small'] = literal('length(primary_image_small)>0');
    }
    if (searchText) {
        if (isChinese(searchText)) {
            whereClause[Op.or] = { title_zh: { [Op.like]: `%${searchText}%` } };
        } else {
            //TODO merge multiple field to one field 
            const searchConditions = [
                { title_en: { [Op.like]: `%${searchText}%` } },
                Sequelize.literal(`UPPER(f_code) = UPPER(${sequelize.escape(searchText)})`),
                Sequelize.literal(`UPPER(jh_code) = UPPER(${sequelize.escape(searchText)})`),
                { collection: { [Op.like]: `%${searchText}%` } }
            ];
            whereClause[Op.or] = searchConditions;
        }

    }
    try {
        // Fetch artworks
        const { count, rows } = await VincentArtwork.findAndCountAll({
            where: whereClause,
            limit: pageSize,
            offset: offset,
        });
        return { count, rows };
    } catch (err) {
        console.error(`Error fetching artworks: ${err}, whereClause: ${JSON.stringify(whereClause)}`)
        throw new Error(`Error fetching artworks: ${err}`);//response data
    }
}


function isChinese(text: string): boolean {
    const chineseRegex = /[\u4E00-\u9FA5\uF900-\uFA2D]/;
    return chineseRegex.test(text);
}

export default router;

