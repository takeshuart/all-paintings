import { Table, Column, Model, DataType } from 'sequelize-typescript';

@Table({
  tableName: 'artwork_vincent',
  timestamps: false,
})
export class VincentArtwork extends Model<VincentArtwork> {

  @Column({
    type: DataType.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    field: 'id',
  })
  declare id: number;

  @Column({ type: DataType.TEXT, field: 'title_en', allowNull: false, defaultValue: '' })
  titleEn!: string;

  @Column({ type: DataType.TEXT, field: 'title_zh', allowNull: false, defaultValue: '' })
  titleZh!: string;

  @Column({ type: DataType.TEXT, field: 'f_code', allowNull: false, defaultValue: '' })
  fCode!: string;

  @Column({ type: DataType.TEXT, field: 'jh_code', allowNull: false, defaultValue: '' })
  jhCode!: string;

  @Column({ type: DataType.TEXT, field: 'collection', allowNull: false, defaultValue: '' })
  collection!: string;

  @Column({ type: DataType.TEXT, field: 'genre', allowNull: false, defaultValue: '' })
  genre!: string;

  @Column({ type: DataType.TEXT, field: 'depicts', allowNull: false, defaultValue: '' })
  depicts!: string;

  @Column({ type: DataType.TEXT, field: 'period', allowNull: false, defaultValue: '' })
  period!: string;

  @Column({ type: DataType.TEXT, field: 'display_date', allowNull: false, defaultValue: '' })
  displayDate!: string;

  @Column({ type: DataType.TEXT, field: 'location_city', allowNull: false, defaultValue: '' })
  locationCity!: string;

  @Column({ type: DataType.TEXT, field: 'place_of_origin', allowNull: false, defaultValue: '' })
  placeOfOrigin!: string;

  @Column({ type: DataType.TEXT, field: 'dimension', allowNull: false, defaultValue: '' })
  dimension!: string;

  @Column({ type: DataType.INTEGER, field: 'is_highlight', allowNull: false, defaultValue: 0 })
  isHighlight!: number;

  @Column({ type: DataType.TEXT, field: 'short_desc', allowNull: false, defaultValue: '' })
  shortDesc!: string;

  @Column({ type: DataType.TEXT, field: 'color_palette_json', allowNull: false, defaultValue: '' })
  colorPalette!: string;

  @Column({ type: DataType.TEXT, field: 'description', allowNull: false, defaultValue: '' })
  description!: string;

  @Column({ type: DataType.TEXT, field: 'technique', allowNull: false, defaultValue: '' })
  technique!: string;

  @Column({ type: DataType.TEXT, field: 'primary_image_small', allowNull: false, defaultValue: '' })
  primaryImageSmall!: string;

  @Column({ type: DataType.TEXT, field: 'primary_image_medium', allowNull: false, defaultValue: '' })
  primaryImageMedium!: string;

  @Column({ type: DataType.TEXT, field: 'primary_image_large', allowNull: false, defaultValue: '' })
  primaryImageLarge!: string;

  @Column({ type: DataType.TEXT, field: 'primary_image_original', allowNull: false, defaultValue: '' })
  primaryImageOriginal!: string;

  @Column({ type: DataType.TEXT, field: 'related_letters', allowNull: false, defaultValue: '' })
  relatedLetters!: string;

  @Column({ type: DataType.TEXT, field: 'related_artwork', allowNull: false, defaultValue: '' })
  relatedArtwork!: string;

  @Column({ type: DataType.TEXT, field: 'ext_links', allowNull: false, defaultValue: '' })
  extLinks!: string;

  @Column({ type: DataType.TEXT, field: 'exhibitions', allowNull: false, defaultValue: '' })
  exhibitions!: string;

  @Column({ type: DataType.TEXT, field: 'literature', allowNull: false, defaultValue: '' })
  literature!: string;

  @Column({ type: DataType.TEXT, field: 'date_start', allowNull: false, defaultValue: '' })
  dateStart!: string;

  @Column({ type: DataType.TEXT, field: 'date_end', allowNull: false, defaultValue: '' })
  dateEnd!: string;

  @Column({ type: DataType.TEXT, field: 'material', allowNull: false, defaultValue: '' })
  material!: string;

  @Column({ type: DataType.TEXT, field: 'inventory_code', allowNull: false, defaultValue: '' })
  inventoryCode!: string;

  @Column({ type: DataType.TEXT, field: 'data_source', allowNull: false, defaultValue: '' })
  dataSource!: string;

  @Column({ type: DataType.TEXT, field: 'colors', allowNull: false, defaultValue: '' })
  colors!: string;

  @Column({ type: DataType.INTEGER, field: 'r', allowNull: false, defaultValue: 0 })
  r!: number;
  @Column({ type: DataType.INTEGER, field: 'g', allowNull: false, defaultValue: 0 })
  g!: number;
  @Column({ type: DataType.INTEGER, field: 'b', allowNull: false, defaultValue: 0 })
  b!: number;
  @Column({ type: DataType.TEXT, field: 'letters', allowNull: false, defaultValue: '' })
  letters!: string;
  @Column({ type: DataType.REAL, field: 'rank_score', allowNull: false, defaultValue: 0.0 })
  rankScore!: string;
}
