import { sequelize } from '@db/db2.js';
import { ArtworkColorFeature } from '../db/models/ArtworkColorFeature.js';
import { JOIN_ARTWORK_COLOR_FEATURE_JOIN, VincentArtwork } from '../db/models/VincentArtwork.js';
import { COLORE_SCORE_FIELDS } from '../utils/constants.js';
import { Sequelize, Op, literal, Model } from 'sequelize';



/**
 * Interface for all potential filters passed into the search function.
 */
export interface ArtworkSearchParams {
    page: number;
    pageSize: number;
    genres: string[];
    period: string | null;
    techniques: string[];
    hasImage: boolean;
    searchText: string | null;
    colorField: string | null;
}

/**
 * [STEP 1: Filter Builder] Builds the base WHERE clause for the main VincentArtwork table,
 */
function buildArtworkWhereClause(params: ArtworkSearchParams): any {
    let whereClause: any = {};

    if (params.genres && params.genres.length > 0) {
        whereClause['genre'] = params.genres;
    }

    if (params.period) {
        whereClause['period'] = params.period;
    }

    if (params.hasImage) {
        whereClause['primary_image_small'] = literal('length(primary_image_small)>0');
    }

    if (params.techniques && params.techniques.length > 0) {
        // If user specifies techniques, we use Op.in
        whereClause['technique'] = { [Op.in]: params.techniques };
    }

    // Text Search Filter 
    // ❗ TODO OPTIMIZATION: Implement FTS5 for better search performance.
    if (params.searchText) {
        if (isChinese(params.searchText)) {
            whereClause[Op.or] = { title_zh: { [Op.like]: `%${params.searchText}%` } };
        } else {
            const searchTextTerm = params.searchText;
            const searchConditions = [
                { title_en: { [Op.like]: `%${searchTextTerm}%` } },
                Sequelize.literal(`UPPER(f_code) = UPPER(${sequelize.escape(searchTextTerm)})`),
                Sequelize.literal(`UPPER(jh_code) = UPPER(${sequelize.escape(searchTextTerm)})`),
                { collection: { [Op.like]: `%${searchTextTerm}%` } }
            ];
            whereClause[Op.or] = searchConditions;
        }
    }

    return whereClause;
}

/**
 * [STEP 2: Main Execution] Searches and retrieves Vincent Artworks.
 * Applies the 'drawing' exclusion ONLY if a colorField is provided.
 */
export async function findVincentArtworks(params: ArtworkSearchParams) {

    // 1. Pagination
    const offset = (params.page - 1) * params.pageSize;

    // 2. Build Base Main WHERE Clause
    const whereClause = buildArtworkWhereClause(params);

    // 3. Initialize Query Components for JOIN and ORDER
    let orderClause: any[] = [];
    let includeClause: any[] = [];

    // 4. Color Score Filtering, Ordering, and Contextual Exclusion Logic
    if (params.colorField && COLORE_SCORE_FIELDS.includes(params.colorField)) {

        // Requirement: Exclude 'drawing' ONLY when a color search is performed.
        const existingTechnique = whereClause['technique'];

        if (existingTechnique) {
            // If user already specified 'technique', we AND the new exclusion.
            // Example: user search for technique IN ('oil', 'watercolor') AND technique != 'drawing'
            whereClause['technique'] = { [Op.and]: [existingTechnique, { [Op.ne]: 'drawing' }] };
        } else {
            // If user did NOT specify 'technique',  just set the exclusion.
            whereClause['technique'] = { [Op.ne]: 'drawing' };
        }

        // --- 4b. Color JOIN and Filter ---
        const scoreFieldKey = params.colorField as string;

        includeClause.push({
            model: ArtworkColorFeature,
            as: JOIN_ARTWORK_COLOR_FEATURE_JOIN,
            required: true, // INNER JOIN: Only return items that have a color score record
            where: {
                [scoreFieldKey]: { [Op.gt]: 0.05 }, // Filter: score > 0.05
            },
        });

        // --- 4c. Color Order ---
        orderClause = [
            [{ model: ArtworkColorFeature, as: JOIN_ARTWORK_COLOR_FEATURE_JOIN }, scoreFieldKey, 'DESC'],
            ['id', 'DESC']
        ];

    } else {
        // Fallback: If no valid colorField is provided, use default ranking score
        orderClause = [['rank_score', 'DESC']];
    }

    const {rows:artworks, count:totalCount} = await VincentArtwork.findAndCountAll({
        where: whereClause,   // Includes the conditional 'drawing' exclusion
        include: includeClause, // Defines the necessary JOIN for color scores
        order: orderClause,     // Defines the final sort order
        limit: params.pageSize,
        offset: offset,
    });

    return {artworks,totalCount};
}

function isChinese(text: string): boolean {
    const chineseRegex = /[\u4E00-\u9FA5\uF900-\uFA2D]/;
    return chineseRegex.test(text);
}