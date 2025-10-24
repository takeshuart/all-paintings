// 假设这是您的查询函数

import { COLORE_SCORE_FIELDS, VAN_GOGH_PALETTE } from "@utils/constants.js";
import { ArtworkColorFeature } from "./models/ArtworkColorFeature.js";
import { Op } from "sequelize";
import { Sequelize } from "sequelize-typescript";
import { JOIN_ARTWORK_COLOR_FEATURE_JOIN, VincentArtwork } from "./models/VincentArtwork.js";



async function findArtworksByColorScore(
    colorField: string,
    limit: number,
    offset: number,
    whereClause: any = {}
) {

    let orderClause: any[] = [];
    let includeClause: any[] = [];

    //check field exist
    if (!COLORE_SCORE_FIELDS.includes(colorField)) {
        //  todo return error information

        //INNER JOIN
        includeClause.push({
            model: ArtworkColorFeature,
            as: JOIN_ARTWORK_COLOR_FEATURE_JOIN,
            //only join items that has color scores 
            required: true,
            where: {
                ...whereClause,
                [colorField]: { [Op.gt]: 0.05 },  //only return items that color score > 0.05
                technique: { [Op.ne]: 'drawing' }, //not equal ，all drawing are gray color
            },
            orderClause: [
                [{
                    model: ArtworkColorFeature,
                    as: JOIN_ARTWORK_COLOR_FEATURE_JOIN
                },
                    colorField, 'DESC'
                ],
                ['id', 'DESC'] //secondly order
            ]
        });

    } else {
        //order by rank_score if not color search
        orderClause = [['rank_score', 'DESC']];
    }

    const artworks = await VincentArtwork.findAll({
        where: whereClause,
        include: includeClause,
        order: orderClause,
        limit: limit,
        offset: offset,
    });
    return artworks
}