
import { initDatabase } from '../db/db2.js';
import { VincentArtwork } from '../db/models/VincentArtwork.js';
import { calculateDeltaE2000, ImageFeature, LabColor, rgbToLab } from '../utils/ColorUtils.js';
import { DE_THRESHOLD, SCORE_FIELDS, VAN_GOGH_PALETTE } from '../utils/constants.js';
import { Op } from 'sequelize';


interface ScoreAttributes {
    image_id: number;
    fCode: string;
    jhCode: string;
    // 索引签名允许动态设置 score_01 到 score_10 字段
    [key: string]: string | number;
}

interface ThemeColorLab {
    fieldName: string;
    lab: LabColor;
}

/**
 * 计算给定图片的色彩特征 (K-Means 聚类结果) 与 10 个预设主题色之间的覆盖率分数。
 * * 工作原理（色彩覆盖率评分）：
 * 1. 遍历图片中的每一个主色块 C' 及其所占比例 (Weight)。(例如：图片的主色块是 48% 的棕色，19% 的黄色等)
 * 2. 将 C' 从 RGB 转换为感知均匀的 L*a*b* 颜色空间，确保距离计算符合人眼感知。
 * 3. 遍历 10 个主题色 C_theme，计算 C' 到 C_theme 的 ΔE2000 色差距离 (de2000)。
 * 4. 如果 de2000 小于等于预设的宽容度阈值 (DE_THRESHOLD)，则认为 C' 被 C_theme 风格所“覆盖”。
 * 5. 将 C' 的比例 (Weight) 累加到 C_theme 对应的分数 (score_XX) 中。
 * * 最终，每个 score_XX 分数表示图片中“与该主题色相似的颜色”所占的总体百分比（0-1）。
 * * @param featureData - 原始色彩特征 JSON 解析后的对象数组。
 * @param themesLab - 10 个主题色的 L*a*b* 值和对应的数据库字段名。
 * @returns 包含 10 个主题得分的对象。
 */
function calculateThemeScores(
    featureData: ImageFeature[],
    themesLab: ThemeColorLab[]
): { [key: string]: number } {


    const scores: { [key: string]: number } = {};
    SCORE_FIELDS.forEach(field => scores[field] = 0);

    for (const feature of featureData) {
        const weight = feature.ratio / 100;
        if (weight === 0) continue;

        //RGB -> L*a*b*
        const C_prime_lab = rgbToLab(feature.color);

        for (const theme of themesLab) {
            const de2000 = calculateDeltaE2000(C_prime_lab, theme.lab);

            if (de2000 <= DE_THRESHOLD) {
                scores[theme.fieldName] = (scores[theme.fieldName] as number) + weight;
            }
        }
    }

    themesLab.forEach(theme => {
        scores[theme.fieldName] = parseFloat((scores[theme.fieldName] as number).toFixed(4));
    });

    return scores;
}

async function precomputeThemeScores() {
    try {

        initDatabase()

        console.log("--- 主题色彩分数预计算开始 ---");

        const THEME_COLORS_LAB = VAN_GOGH_PALETTE.map(item => ({
            fieldName: item.scoreField,
            lab: rgbToLab(item.searchColorRGB as [number, number, number])
        }));

        const BATCH_SIZE = 500;
        let offset = 0;
        let recordsProcessed = 0;

        while (true) {
            const artworks = await VincentArtwork.findAll({
                where: {
                    technique: {
                        [Op.in]: ['painting']
                    }
                },
                limit: BATCH_SIZE,
                offset: offset,
                raw: true
            });
            if (artworks.length === 0) break;

            console.log(artworks.length)
            const scoresToUpsert: ScoreAttributes[] = [];

            for (const artwork of artworks) {
                if(!artwork.colors)continue
                
                const { id: artworkId, colors, fCode, jhCode } = artwork;

                try {
                    const featureData = JSON.parse(colors) as ImageFeature[];

                    const calculatedScores = calculateThemeScores(featureData, THEME_COLORS_LAB);

                    const finalScoreObject: ScoreAttributes = {
                        image_id: artworkId,
                        fCode: fCode as string,
                        jhCode: jhCode as string,
                        ...calculatedScores
                    };
                    scoresToUpsert.push(finalScoreObject);
                    console.log(JSON.stringify(finalScoreObject))
                } catch (error) {
                    console.error(`处理 Artwork ID ${artworkId} 时解析或计算错误:`, error);
                }
            }

            // if (scoresToUpsert.length > 0) {
            //     await ArtworkColorFeature.bulkCreate(scoresToUpsert as any, {
            //         updateOnDuplicate: ['fCode', 'jhCode', ...(SCORE_FIELDS as (keyof ArtworkColorFeature)[])],
            //         ignoreDuplicates: false
            //     });
            // }

            recordsProcessed += artworks.length;
            offset += BATCH_SIZE;
            console.log(`已处理 ${recordsProcessed} 条记录...`);
        }

        console.log(`--- 预计算完成！总共处理了 ${recordsProcessed} 条记录。---`);

    } catch (err) {
        console.error(err)
    }
}
precomputeThemeScores()