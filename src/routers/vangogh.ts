import express from "express";
import path from "path";
import { DataTypes, Model, Op, QueryTypes, literal } from "sequelize";
import { Sequelize } from 'sequelize-typescript';
import { VincentArtwork } from "../db/models/VincentArtwork";
import { initDatabase, sequelize } from "../db/db2";

const router = express.Router();

initDatabase()

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
        const hexcolors = req.query.hexColor
        console.log(`request:${JSON.stringify(req.query)}`);

        const result = await findAllByPage(
            searchText,
            genres,
            periods,
            techniques,
            hasImage,
            hexcolors,
            page,
            pageSize);

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


async function findAllByPage(
    searchText: string,
    genres: string[],
    periods: string[],
    techniques: string[],
    hasImage: boolean,
    hexColor?: string,
    page = 1,
    pageSize = 10) {

    const offset = (page - 1) * pageSize;

    let whereClause: any = {};
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
    let colorWhere: any = {};
    const tolerance = 30 //越小越精准
    if (hexColor) {
        const rgb = hexToRgb(hexColor);
        if (!rgb) throw new Error('Invalid hex color');

        const { r, g, b } = rgb;

        // SQLite 直接用欧氏距离判断
        colorWhere = Sequelize.literal(`
                    (r - ${r})*(r - ${r}) + 
                    (g - ${g})*(g - ${g}) + 
                    (b - ${b})*(b - ${b}) <= ${tolerance * tolerance}
                `);
        whereClause = {
            ...whereClause,
            technique: { [Op.ne]: 'drawing' }, // technique != 'drawing'
        };
    }

    try {
        // Fetch artworks
        const { count, rows } = await VincentArtwork.findAndCountAll({
            where: Sequelize.and(
                whereClause,
                hexColor ? colorWhere : {}
            ),
            order: [
                // 排序：rankScore降序，分数相同用id排序
                // rankScore计算规则见 db/calc_rankingScore.sql
                ['rank_score', 'DESC'], 
                ['id', 'ASC']
            ],
            limit: pageSize,
            offset: offset,
        });
        console.log(JSON.stringify(whereClause, null, 2));
        console.log('查询结果：' + count)
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

function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
    if (!hex) return null;
    let sanitized = hex.replace('#', '');
    if (sanitized.length === 3) {
        sanitized = sanitized.split('').map(c => c + c).join('');
    }
    if (sanitized.length !== 6) return null;

    const r = parseInt(sanitized.slice(0, 2), 16);
    const g = parseInt(sanitized.slice(2, 4), 16);
    const b = parseInt(sanitized.slice(4, 6), 16);
    return { r, g, b };
}


export default router;

