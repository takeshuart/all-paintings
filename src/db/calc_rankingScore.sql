-- 计算并更新 推荐评分 (总权重 = 1.00)
UPDATE artwork_vincent
SET rank_score = 
  ROUND(
    (
      -- S1: 编号完整性 (w=0.15)
      ( ( (f_code IS NOT NULL AND f_code != '') + (jh_code IS NOT NULL AND jh_code != '') + (inventory_code IS NOT NULL AND inventory_code != '') ) / 3.0 ) * 0.15 +

      -- S2: 中文标题 (w=0.10)
      ( (title_zh IS NOT NULL AND title_zh != '') ) * 0.10 +

      -- S3: 关键信息完整性 (w=0.15)
      ( ( (collection IS NOT NULL AND collection != '') + (display_date IS NOT NULL AND display_date != '') + (dimension IS NOT NULL AND dimension != '') ) / 3.0 ) * 0.15 +

      -- S4: 详细介绍 (w=0.10)
      ( (short_desc IS NOT NULL AND short_desc != '') OR (description IS NOT NULL AND description != '') ) * 0.10 +

      -- S5: 关联书信 (w=0.15)
      ( (letters IS NOT NULL AND letters != '' AND letters != '[]') ) * 0.15 +

      -- S6: 附加信息丰富度 (w=0.10)
      ( ( (exhibitions IS NOT NULL AND exhibitions != '') + (literature IS NOT NULL AND literature != '') + (ext_links IS NOT NULL AND ext_links != '') ) / 3.0 ) * 0.10 +

      -- S7: 图片清晰度 (w=0.15)
      ( (primary_image_large IS NOT NULL AND primary_image_large != '') OR (primary_image_original IS NOT NULL AND primary_image_original != '') ) * 0.15 +

      -- S8: 高亮/特色 (w=0.10)
      is_highlight * 0.10 
    ) * 100 
  , 5); -- 小数点后 5 位