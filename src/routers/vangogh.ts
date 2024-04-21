import express from "express";
import path from "path";
import { DataTypes, Model, Sequelize, Op } from "sequelize";

const router = express.Router();
const dbFile = path.join(__dirname, '../../artwork.db');

const sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: dbFile,
});


router.get('/vincent', async (req: any, res) => {
    try {
        const page = parseInt(req.query.page) || 0;
        const pageSize = parseInt(req.query.pageSize) || 5;
        const searchText = req.query.search || '';//search input
        const periods: string[] = Array.isArray(req.query.periods) ? req.query.periods : [];
        const genres: string[] = Array.isArray(req.query.genres) ? req.query.genres : [];

        console.log(`request:${JSON.stringify(req.query)}`);

        const result = await findAllByPage(searchText, genres, periods, page, pageSize);
        console.log(JSON.stringify(result));

        res.json(result);
    } catch (error) {
        res.status(500).json({ error: `Internal server error.\t ${error}` });
    }
});

//test case: http://localhost:5001/artwork/vincent?page=5&pageSize=10&periods[]=Paris&periods[]=Antwerp

async function findAllByPage(searchText = '', genres: string[], periods: string[], page = 1, pageSize = 10) {
    const offset = (page - 1) * pageSize;

    const whereClause: any = {};
    if (genres.length > 0) {
        whereClause['genre'] = genres
    }
    if (periods.length > 0) {
        whereClause['period'] = periods
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

class VincentArtwork extends Model { }

VincentArtwork.init({
    id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true,
        field: 'id'
    },
    titleEn: {
        type: DataTypes.TEXT,
        allowNull: false,
        defaultValue: '',
        field: 'title_en'
    },
    titleZh: {
        type: DataTypes.TEXT,
        allowNull: false,
        defaultValue: '',
        field: 'title_zh'
    },
    fCode: {
        type: DataTypes.TEXT,
        allowNull: false,
        defaultValue: '',
        field: 'f_code'
    },
    jhCode: {
        type: DataTypes.TEXT,
        allowNull: false,
        defaultValue: '',
        field: 'jh_code'
    },
    collection: {
        type: DataTypes.TEXT,
        allowNull: false,
        defaultValue: '',
        field: 'collection'
    },
    genre: {
        type: DataTypes.TEXT,
        allowNull: false,
        defaultValue: '',
        field: 'genre'
    },
    depicts: {
        type: DataTypes.TEXT,
        allowNull: false,
        defaultValue: '',
        field: 'depicts'
    },
    period: {
        type: DataTypes.TEXT,
        allowNull: false,
        defaultValue: '',
        field: 'period'
    },
    displayDate: {
        type: DataTypes.TEXT,
        allowNull: false,
        defaultValue: '',
        field: 'display_date'
    },
    locationCity: {
        type: DataTypes.TEXT,
        allowNull: false,
        defaultValue: '',
        field: 'location_city'
    },
    placeOfOrigin: {
        type: DataTypes.TEXT,
        allowNull: false,
        defaultValue: '',
        field: 'place_of_origin'
    },
    dimension: {
        type: DataTypes.TEXT,
        allowNull: false,
        defaultValue: '',
        field: 'dimension'
    },
    isHighlight: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
        field: 'is_highlight'
    },
    shortDesc: {
        type: DataTypes.TEXT,
        allowNull: false,
        defaultValue: '',
        field: 'short_desc'
    },
    primaryColour: {
        type: DataTypes.TEXT,
        allowNull: false,
        defaultValue: '',
        field: 'primary_colour'
    },
    description: {
        type: DataTypes.TEXT,
        allowNull: false,
        defaultValue: '',
        field: 'description'
    },
    technique: {
        type: DataTypes.TEXT,
        allowNull: false,
        defaultValue: '',
        field: 'technique'
    },
    primaryImageSmall: {
        type: DataTypes.TEXT,
        allowNull: false,
        defaultValue: '',
        field: 'primary_image_small'
    },
    primaryImageMedium: {
        type: DataTypes.TEXT,
        allowNull: false,
        defaultValue: '',
        field: 'primary_image_medium'
    },
    primaryImageLarge: {
        type: DataTypes.TEXT,
        allowNull: false,
        defaultValue: '',
        field: 'primary_image_large'
    },
    primaryImageOriginal: {
        type: DataTypes.TEXT,
        allowNull: false,
        defaultValue: '',
        field: 'primary_image_original'
    },
    relatedLetters: {
        type: DataTypes.TEXT,
        allowNull: false,
        defaultValue: '',
        field: 'related_letters'
    },
    relatedArtwork: {
        type: DataTypes.TEXT,
        allowNull: false,
        defaultValue: '',
        field: 'related_artwork'
    },
    extLinks: {
        type: DataTypes.TEXT,
        allowNull: false,
        defaultValue: '',
        field: 'ext_links'
    },
    exhibitions: {
        type: DataTypes.TEXT,
        allowNull: false,
        defaultValue: '',
        field: 'exhibitions'
    },
    literature: {
        type: DataTypes.TEXT,
        allowNull: false,
        defaultValue: '',
        field: 'literature'
    },
    dateStart: {
        type: DataTypes.TEXT,
        allowNull: false,
        defaultValue: '',
        field: 'date_start'
    },
    dateEnd: {
        type: DataTypes.TEXT,
        allowNull: false,
        defaultValue: '',
        field: 'date_end'
    },
    material: {
        type: DataTypes.TEXT,
        allowNull: false,
        defaultValue: '',
        field: 'material'
    },
    inventoryCode: {
        type: DataTypes.TEXT,
        allowNull: false,
        defaultValue: '',
        field: 'inventory_code'
    },
    dataSource: {
        type: DataTypes.TEXT,
        allowNull: false,
        defaultValue: '',
        field: 'data_source'
    }
}, {
    sequelize,
    modelName: 'VincentArtwork',
    tableName: 'artwork_vincent',
    timestamps: false,
});
