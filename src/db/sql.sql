CREATE TABLE artwork_vincent (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title_en TEXT DEFAULT '',
    title_zh TEXT DEFAULT '',
    f_code TEXT DEFAULT '',
    jh_code TEXT DEFAULT '',    
    collection TEXT DEFAULT '',
    genre TEXT DEFAULT '',
    depicts TEXT DEFAULT '',
    period TEXT DEFAULT '',
    display_date TEXT DEFAULT '', -- month,year
    location_city TEXT DEFAULT '',
    place_of_origin TEXT DEFAULT '',
    dimension TEXT DEFAULT '',
    is_highlight INTEGER DEFAULT 0, 
    short_desc TEXT DEFAULT '',
    color_palette_json TEXT DEFAULT '',
    description TEXT DEFAULT '',
    technique TEXT DEFAULT '',
    primary_image_small TEXT DEFAULT '',
    primary_image_medium TEXT DEFAULT '',
    primary_image_large TEXT DEFAULT '',
    primary_image_original TEXT DEFAULT '',
    related_letters TEXT DEFAULT '',
    related_artwork TEXT DEFAULT '',
    ext_links TEXT DEFAULT '',--json array
    exhibitions TEXT DEFAULT '',--json array
    literature TEXT DEFAULT '', -- releted books/article etc..
    date_start TEXT DEFAULT '',
    date_end TEXT DEFAULT '',
    material TEXT DEFAULT '',
    inventory_code  TEXT DEFAULT '',
    data_source TEXT DEFAULT ''

);


CREATE TABLE artwork (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    inventory_number TEXT DEFAULT '',
    artist TEXT DEFAULT '',
    title TEXT DEFAULT '',
    description TEXT DEFAULT '',
    short_desc TEXT DEFAULT '',
    is_highlight INTEGER DEFAULT 0, -- 0 for false, 1 for true
    art_movement TEXT DEFAULT '',
    artwork_type TEXT DEFAULT '',
    genre TEXT DEFAULT '',
    subject TEXT DEFAULT '',
    depicts TEXT DEFAULT '',
    place_of_origin TEXT DEFAULT '',
    artwork_wikipedia_url TEXT DEFAULT '',
    artwork_museum_url TEXT DEFAULT '',
    data_source TEXT DEFAULT '',
    image_wikimedia_url TEXT DEFAULT '',
    primary_image_small TEXT DEFAULT '',
    primary_image_medium TEXT DEFAULT '',
    primary_image_large TEXT DEFAULT '',
    primary_image_original TEXT DEFAULT '',
    artwork_date TEXT DEFAULT '',
    museum_location TEXT DEFAULT '',
    museum TEXT DEFAULT '',
    dimension TEXT DEFAULT '',
    cat_no TEXT DEFAULT '',
    color TEXT DEFAULT ''
);

-- ArtImage 表：存储艺术品的图片关联信息和元数据
CREATE TABLE artwork_image (
    id              INTEGER PRIMARY KEY AUTOINCREMENT,
    artwork_id      INTEGER NOT NULL,
	artwork_code	TEXT ,																-- 图片编码（JH-F）
    img_spec        TEXT ,                                                                      -- 图片规格 (small, medium, large)
    ext             TEXT NOT NULL,                                                              -- 图片格式/扩展名 (jpg, png, webp, etc.)
    quality_rating  TEXT ,                                                                      -- 图片质量评级
    source          TEXT ,                                                                      -- 图片来源 (e.g., 'original_upload', 'system_generated')
    cos_url         TEXT NOT NULL,                                                              -- tencent COS url
    
    -- 图片元数据
    width_px        INTEGER,                                                                    -- 宽度（像素）
    height_px       INTEGER,                                                                    -- 高度（像素）
    file_size_bytes INTEGER,                                                                    -- 文件大小（字节）
    
    -- 时间戳
    created_at      TEXT NOT NULL,
    updated_at      TEXT NOT NULL,
    
    UNIQUE (artwork_id, img_spec)
);

CREATE INDEX idx_art_img_spec ON art_image (artwork_id, img_spec);