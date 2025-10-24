import { Column, DataType, Model, Table, ForeignKey } from "sequelize-typescript";
import { VincentArtwork } from "./VincentArtwork.js";

@Table({
    tableName: 'artwork_color_scores',
    timestamps: false,
})
export class ArtworkColorFeature extends Model<ArtworkColorFeature> {


    //使用 artwork表的id 作为 Primary Key
    @Column({ type: DataType.INTEGER, primaryKey: true, allowNull: false, field: 'image_id' })
    @ForeignKey(() => VincentArtwork)
    image_id!: string;

    @Column({ type: DataType.TEXT, field: 'f_code', allowNull: false, defaultValue: '' })
    fCode!: string;

    @Column({ type: DataType.TEXT, field: 'jh_code', allowNull: false, defaultValue: '' })
    jhCode!: string;

    @Column({ type: DataType.REAL, field: 'score_01', defaultValue: 0 })
    score_01!: number; // 湖水青蓝

    @Column({ type: DataType.REAL, field: 'score_02', defaultValue: 0 })
    score_02!: number; // 深空靛蓝

    @Column({ type: DataType.REAL, field: 'score_03', defaultValue: 0 })
    score_03!: number; // 柔和米灰

    @Column({ type: DataType.REAL, field: 'score_04', defaultValue: 0 })
    score_04!: number; // 清新薄荷绿

    @Column({ type: DataType.REAL, field: 'score_05', defaultValue: 0 })
    score_05!: number; // 深沉橄榄

    @Column({ type: DataType.REAL, field: 'score_06', defaultValue: 0 })
    score_06!: number; // 古典棕绿

    @Column({ type: DataType.REAL, field: 'score_07', defaultValue: 0 })
    score_07!: number; // 浓郁焦棕

    @Column({ type: DataType.REAL, field: 'score_08', defaultValue: 0 })
    score_08!: number; // 暖调赤土

    @Column({ type: DataType.REAL, field: 'score_09', defaultValue: 0 })
    score_09!: number; // 亮金赭石

    @Column({ type: DataType.REAL, field: 'score_10', defaultValue: 0 })
    score_10!: number; // 向日葵亮黄
}