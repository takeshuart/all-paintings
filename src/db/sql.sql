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
    primary_colour TEXT DEFAULT '',
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


CREATE TABLE art_work (
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
