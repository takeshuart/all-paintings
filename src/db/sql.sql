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
    display_date TEXT DEFAULT '',
    -- month,year
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
    ext_links TEXT DEFAULT '',
    --json array
    exhibitions TEXT DEFAULT '',
    --json array
    literature TEXT DEFAULT '',
    -- releted books/article etc..
    date_start TEXT DEFAULT '',
    date_end TEXT DEFAULT '',
    material TEXT DEFAULT '',
    inventory_code TEXT DEFAULT '',
    data_source TEXT DEFAULT ''
);

CREATE TABLE artwork (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    inventory_number TEXT DEFAULT '',
    artist TEXT DEFAULT '',
    title TEXT DEFAULT '',
    description TEXT DEFAULT '',
    short_desc TEXT DEFAULT '',
    is_highlight INTEGER DEFAULT 0,
    -- 0 for false, 1 for true
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
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    artwork_id INTEGER NOT NULL,
    artwork_code TEXT,
    -- 图片编码（JH-F）
    img_spec TEXT,
    -- 图片规格 (small, medium, large)
    ext TEXT NOT NULL,
    -- 图片格式/扩展名 (jpg, png, webp, etc.)
    quality_rating TEXT,
    -- 图片质量评级
    source TEXT,
    -- 图片来源 (e.g., 'original_upload', 'system_generated')
    cos_url TEXT NOT NULL,
    -- tencent COS url
    -- 图片元数据
    width_px INTEGER,
    -- 宽度（像素）
    height_px INTEGER,
    -- 高度（像素）
    file_size_bytes INTEGER,
    -- 文件大小（字节）
    -- 时间戳
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL,
    UNIQUE (artwork_id, img_spec)
);

CREATE INDEX idx_art_img_spec ON art_image (artwork_id, img_spec);

CREATE TABLE vincent_letters(
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    letter_id VARCHAR(20) UNIQUE NOT NULL, --书信编号 vgl（Vangoghlettes.org,vgl.org）编号
    sender_zh TEXT,
    sender_en TEXT,
    recipient_zh TEXT,
    recipient_en TEXT,
    place_zh TEXT,
    place_en TEXT,
    weekday_zh TEXT,
    weekday_en TEXT,
    date_zh TEXT,
    date_en TEXT,
    vgl_url TEXT,--  vgl.org url
    -- 文字内容（原文、译文、AI译文）
    original TEXT, -- 原文，法语、荷兰语为主
    translation_en_vgm TEXT, -- 英文译文，Van Gogh Museum版本 2009年出版，此外还有早期的Jo-Bonger版本。
    translation_zh_vgm TEXT, -- 基于vgm英文译文的中文译本(由上海美术出版社于2015年出版)
    translation_zh_ai TEXT, -- 自己用ai翻译,防止上海美术出版社版权问题。
    -- 附加信息，json结构
    notes TEXT, -- 注释， json文本，以序号排列
    facsimile TEXT, -- 纸质信件扫描件，主要来自vgl.org。数据结构可能是多张图片的json
    artworks TEXT -- json格式。信中提到的作品，除了vincent自己的作品，还经常提及他喜欢的艺术家
)

-- 语言较少时，使用同表多列设计
-- 但如果想支持更多语言，应该用翻译表设计
CREATE TABLE letters (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    letter_id VARCHAR(20) UNIQUE NOT NULL,
    date_original TEXT,
    original_language TEXT
);

CREATE TABLE letter_translations (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    letter_id VARCHAR(20) NOT NULL,
    lang CHAR(2) NOT NULL,              -- 语言代码: 'en', 'zh', 'fr' 等
    sender TEXT,
    date_translated TEXT,
    translation TEXT,
    notes TEXT,
    UNIQUE(letter_id, lang),
    FOREIGN KEY (letter_id) REFERENCES letters(letter_id)
);


CREATE TABLE IF NOT EXISTS "artwork_color_scores" (
    -- 主键和外键： INTEGER NOT NULL PRIMARY KEY
    -- 对应 @Column({ type: DataType.INTEGER, primaryKey: true, allowNull: false, field: 'image_id' })
    "image_id" INTEGER NOT NULL PRIMARY KEY, 
    
    -- f_code
    -- 对应 @Column({ type: DataType.TEXT, field: 'f_code', allowNull: false, defaultValue: '' })
    "f_code" TEXT,
    
    -- jh_code
    -- 对应 @Column({ type: DataType.TEXT, field: 'jh_code', allowNull: false, defaultValue: '' })
    "jh_code" TEXT ,
    
    -- score_01 到 score_10 (所有得分字段)
    -- 对应 @Column({ type: DataType.REAL, field: 'score_XX', defaultValue: 0 })
    "score_01" REAL DEFAULT 0.0, -- 湖水青蓝
    "score_02" REAL DEFAULT 0.0, -- 深空靛蓝
    "score_03" REAL DEFAULT 0.0, -- 柔和米灰
    "score_04" REAL DEFAULT 0.0, -- 清新薄荷绿
    "score_05" REAL DEFAULT 0.0, -- 深沉橄榄
    "score_06" REAL DEFAULT 0.0, -- 古典棕绿
    "score_07" REAL DEFAULT 0.0, -- 浓郁焦棕
    "score_08" REAL DEFAULT 0.0, -- 暖调赤土
    "score_09" REAL DEFAULT 0.0, -- 亮金赭石
    "score_10" REAL DEFAULT 0.0, -- 向日葵亮黄
    
    -- 外键约束：确保 image_id 必须引用 VincentArtwork 表中的记录
    -- 假设 VincentArtwork 编译后对应的表名是 'vincent_artworks'，其主键是 'id'。
    FOREIGN KEY("image_id") REFERENCES "artwork_vincent"("id")
);