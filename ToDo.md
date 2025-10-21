- 上传所有vincent small质量和medium尺寸的图片，
   文件名使用jhcode+fcode命名，例如jh123f12.webp
   如果没有作品编号，自定义编码，v前缀（Vincent）+年份+三位数编码 例如 V89012,即1889年的第12幅
- 使用eagle的色彩信息填充artwork_vincent表的color_palette_json字段，色彩转换成16进制。
- 使用腾讯云接口对图片质量打分，artwork_image表的quality_rating字段
- 提供AI解读功能（接入混元、豆包等API)
- 对艺术品条目打分，评分参数：信息丰富度（编号、介绍、关联书信）、图片清晰度等。默认根据评分排序。