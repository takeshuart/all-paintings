// constants.ts

// 1. 前端展示用的主题色板 (用于检索的 C_theme)
// scoreField 使用固定 ID (score_01 到 score_10)
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

export const SCORE_FIELDS = VAN_GOGH_PALETTE.map(p => p.scoreField);

// 3. 固定的 ΔE2000 宽容度阈值
export const DE_THRESHOLD = 8.0;