import { Table, Column, Model, DataType, Unique } from 'sequelize-typescript';
@Table({
  tableName: 'vincent_letters',
  timestamps: false,
})
export class VincentLetter extends Model<VincentLetter> {

  /**
   * 主键 ID
   */
  @Column({
    type: DataType.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    field: 'id',
  })
  declare id: number;

  /**
   * 书信编号 vgl（Vangoghlettes.org,vgl.org）编号
   */
  @Unique
  @Column({ 
    type: DataType.STRING(20), 
    field: 'letter_id', 
    allowNull: false, 
  })
  letterId!: string;

  /**
   * 发件人 (中文)
   */
  @Column({ type: DataType.TEXT, field: 'sender_zh' })
  senderZh?: string;

  /**
   * 发件人 (英文)
   */
  @Column({ type: DataType.TEXT, field: 'sender_en' })
  senderEn?: string;

  /**
   * 收件人 (中文)
   */
  @Column({ type: DataType.TEXT, field: 'recipient_zh' })
  recipientZh?: string;

  /**
   * 收件人 (英文)
   */
  @Column({ type: DataType.TEXT, field: 'recipient_en' })
  recipientEn?: string;

  /**
   * 地点 (中文)
   */
  @Column({ type: DataType.TEXT, field: 'place_zh' })
  placeZh?: string;

  /**
   * 地点 (英文)
   */
  @Column({ type: DataType.TEXT, field: 'place_en' })
  placeEn?: string;

  /**
   * 星期 (中文)
   */
  @Column({ type: DataType.TEXT, field: 'weekday_zh' })
  weekdayZh?: string;

  /**
   * 星期 (英文)
   */
  @Column({ type: DataType.TEXT, field: 'weekday_en' })
  weekdayEn?: string;

  /**
   * 日期 (中文)
   */
  @Column({ type: DataType.TEXT, field: 'date_zh' })
  dateZh?: string;

  /**
   * 日期 (英文)
   */
  @Column({ type: DataType.TEXT, field: 'date_en' })
  dateEn?: string;

  /**
   * vgl.org URL
   */
  @Column({ type: DataType.TEXT, field: 'vgl_url' })
  vglUrl?: string;

  /**
   * 原文 (法语、荷兰语为主)
   */
  @Column({ type: DataType.TEXT, field: 'original' })
  original?: string;

  /**
   * 英文译文 (Van Gogh Museum版本 2009年出版)
   */
  @Column({ type: DataType.TEXT, field: 'translation_en_vgm' })
  translationEnVgm?: string;

  /**
   * 中文译本 (基于vgm英文译文, 由上海美术出版社于2015年出版)
   */
  @Column({ type: DataType.TEXT, field: 'translation_zh_vgm' })
  translationZhVgm?: string;

  /**
   * AI 翻译的中文译本
   */
  @Column({ type: DataType.TEXT, field: 'translation_zh_ai' })
  translationZhAi?: string;

  /**
   * 注释，json文本，以序号排列
   */
  @Column({ type: DataType.TEXT, field: 'notes' })
  notes?: string;

  /**
   * 纸质信件扫描件，主要来自vgl.org。数据结构可能是多张图片的json
   */
  @Column({ type: DataType.TEXT, field: 'facsimile' })
  facsimile?: string;

  /**
   * 信中提到的作品，json格式。包括Vincent自己的作品以及他喜欢的艺术家
   */
  @Column({ type: DataType.TEXT, field: 'artworks' })
  artworks?: string;
}