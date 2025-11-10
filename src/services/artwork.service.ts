import { prisma } from '../lib/prismaDB.js';
import { COLORE_SCORE_FIELDS } from '../utils/constants.js';

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
    const whereClause: any = {};

    if (params.genres && params.genres.length > 0) {
        whereClause.genre = { in: params.genres };
    }

    if (params.period) {
        whereClause.period = params.period;
    }

    if (params.hasImage) {
        // Prisma 没有 literal，但可用 NOT/equals 实现逻辑
        whereClause.primaryImageSmall = { not: '' };
    }

    if (params.techniques && params.techniques.length > 0) {
        whereClause.technique = { in: params.techniques };
    }

    // Text Search Filter 
    // ❗ TODO OPTIMIZATION: Implement FTS5 for better search performance.
    if (params.searchText) {
        if (isChinese(params.searchText)) {
            whereClause.OR = [{ titleZh: { contains: params.searchText } }];
        } else {
            const searchTextTerm = params.searchText;
            whereClause.OR = [
                { titleEn: { contains: searchTextTerm, mode: 'insensitive' } },
                { fCode: { equals: searchTextTerm, mode: 'insensitive' } },
                { jhCode: { equals: searchTextTerm, mode: 'insensitive' } },
                { collection: { contains: searchTextTerm, mode: 'insensitive' } },
            ];
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
    const skip = (params.page - 1) * params.pageSize;
    const take = params.pageSize;

    // 2. Build Base Main WHERE Clause
    const whereClause = buildArtworkWhereClause(params);

    // 3. Initialize Query Components for JOIN and ORDER
    let orderBy: any[] = [];
    let include: any = {};

    // 4. Color Score Filtering, Ordering, and Contextual Exclusion Logic
    if (params.colorField && COLORE_SCORE_FIELDS.includes(params.colorField)) {

        // Requirement: Exclude 'drawing' ONLY when a color search is performed.
        const existingTechnique = whereClause.technique;

        if (existingTechnique) {
            // If user already specified 'technique', we AND the new exclusion.
            whereClause.AND = [
                { technique: existingTechnique },
                { technique: { not: 'drawing' } }
            ];
        } else {
            // If user did NOT specify 'technique',  just set the exclusion.
            whereClause.technique = { not: 'drawing' };
        }

        // --- 4b. Color JOIN and Filter ---
        const scoreFieldKey = params.colorField as string;

        include = {
            colorFeatures: {
                where: {
                    [scoreFieldKey]: { gt: 0.05 },
                },
                select: { imageId: true, [scoreFieldKey]: true },
            },
        };

        // --- 4c. Color Order ---
        orderBy = [
            { colorFeatures: { [scoreFieldKey]: 'desc' } },
            { id: 'desc' },
        ];

    } else {
        // Fallback: If no valid colorField is provided, use default ranking score
        orderBy = [{ rankScore: 'desc' }];
    }

    //findAll and totalCount
    const [artworks, totalCount] = await Promise.all([
        prisma.vincentArtwork.findMany({
            where: whereClause,
            include,
            orderBy,
            skip,
            take,
        }),
        prisma.vincentArtwork.count({ where: whereClause }),
    ]);

    return { artworks, totalCount };
}

function isChinese(text: string): boolean {
    const chineseRegex = /[\u4E00-\u9FA5\uF900-\uFA2D]/;
    return chineseRegex.test(text);
}
