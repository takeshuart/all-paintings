// constants.ts


/**
 * 计算过程见Notion笔记
 * @searchColorRGB  使用 K-Means 聚类对梵高的所有作品分析得出的10个主要色调。
 * @displayColor 前端展示色块，饱和度、亮度略高于主题色（searchColorRGB）
 * @scoreFiled 对应的数据库字段
 */
export const VAN_GOGH_PALETTE = [
    { id: 1, name: '湖水青蓝', displayColor: '#4A97A8', searchColorRGB: [102, 125, 131], scoreField: 'score_01' },
    { id: 2, name: '深空靛蓝', displayColor: '#4F6FA8', searchColorRGB: [107, 134, 172], scoreField: 'score_02' },
    { id: 3, name: '柔和米灰', displayColor: '#E5EAE8', searchColorRGB: [192, 206, 201], scoreField: 'score_03' },
    { id: 4, name: '清新薄荷绿', displayColor: '#B7D9A6', searchColorRGB: [170, 189, 161], scoreField: 'score_04' },
    { id: 5, name: '深沉橄榄', displayColor: '#7F8D44', searchColorRGB: [104, 114, 51], scoreField: 'score_05' },
    { id: 6, name: '古典棕绿', displayColor: '#8F754D', searchColorRGB: [100, 91, 59], scoreField: 'score_06' },
    { id: 7, name: '浓郁焦棕', displayColor: '#594E3F', searchColorRGB: [26, 23, 14], scoreField: 'score_07' },
    { id: 8, name: '暖调赤土', displayColor: '#C7906B', searchColorRGB: [174, 127, 95], scoreField: 'score_08' },
    { id: 9, name: '亮金赭石', displayColor: '#C79B48', searchColorRGB: [153, 124, 80], scoreField: 'score_09' },
    { id: 10, name: '向日葵亮黄', displayColor: '#F3D860', searchColorRGB: [217, 197, 103], scoreField: 'score_10' }
];

export const COLORE_SCORE_FIELDS = VAN_GOGH_PALETTE.map(p => p.scoreField);

/**
 * ΔE2000 宽容度阈值
 * 精确匹配（几乎相同颜色） 	1.5 – 2.5	如校色工具
 * 同色系识别（视觉一致）	    3 – 4 	推荐用于橙色占比统计
 * 主色调归类（大致属于橙色）	5 – 6 	推荐用于检索“橙色图片”
 * 宽松聚类（粗略分组）	        7 – 10	聚类或初筛阶段
*/
export const DE_THRESHOLD = 5.0;