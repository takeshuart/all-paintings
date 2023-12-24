import Database from 'better-sqlite3';
import { ArtWork } from '../crawlers/artwork';

const db = new Database('artwork.db', { verbose: console.log });

// const createTable = db.prepare(`
// CREATE TABLE artwork (
//     id INTEGER PRIMARY KEY AUTOINCREMENT,
//     inventory_number TEXT DEFAULT '', 
//     artist TEXT DEFAULT '',   
//     title TEXT,                      
//     short_desc TEXT DEFAULT '',       
//     is_highlight BOOLEAN DEFAULT 0,   
//     genre TEXT DEFAULT 'None',       
//     subject TEXT DEFAULT '',         
//     depicts TEXT DEFAULT '',         
//     image_detail_url TEXT DEFAULT '',  
//     image_url TEXT DEFAULT '',        
//     image_thumbnail TEXT DEFAULT '',  
//     image_large TEXT DEFAULT '',      
//     image_original TEXT DEFAULT '',   
//     time TEXT DEFAULT '',            
//     year TEXT DEFAULT '',            
//     location TEXT DEFAULT '',        
//     museum TEXT DEFAULT '',   
//     dimension TEXT DEFAULT ''        
// )
// `);
// createTable.run();

function toSnakeCase(str: string): string {
    return str.replace(/([A-Z])/g, "_$1").toLowerCase();
}

function mapObjectKeysToSnakeCase(obj: Record<string, any>): Record<string, any> {
    const mappedObj: Record<string, any> = {};
    Object.keys(obj).forEach((key) => {
        if (obj[key] !== undefined) { // 排除未赋值的字段
            // sqlite3不支持boolean类型
            if (typeof obj[key] === 'boolean') {
                mappedObj[toSnakeCase(key)] = obj[key] ? 1 : 0;
            } else {
                mappedObj[toSnakeCase(key)] = obj[key];
            }
        }
    });
    return mappedObj;
}


// const artwork: ArtWork = new ArtWork({
//     title: 'The bedroom',
//     artist: 'Van Gogh',
//     isHighlight: true,
//     shortDesc: 'Arls',
//     year: '1889',
//     museum: 'The Art Institute of Chicago',
//     inventoryNumber: '134.23',
//     imageUrl: 'https://abc.com/0/default.jpg',
//     imageOriginal: 'https://abc.com/0/default.jpg',
//     dimension: '12x23cm'
// })

export function insert(artwork: ArtWork) {
    try {

        const artworkDb = mapObjectKeysToSnakeCase(artwork);

        const keys = Object.keys(artworkDb);
        const values = Object.values(artworkDb);
        const placeholders = keys.map(() => '?').join(', ');

        const insertStmt = `INSERT INTO art_work (${keys.join(', ')}) VALUES (${placeholders})`;
        console.log(`sql: ${insertStmt}`)
        const insert = db.prepare(insertStmt);

        // 执行插入
        insert.run(...values);

    } catch (error) {
        console.log(error)
    }
}
process.on('uncaughtException', (error) => {
    console.error('Uncaught Exception:', error);
});

// 导出函数
module.exports = {
    insert,
};

export function run() {
    // insert(artwork)
    // const artworkDb = mapObjectKeysToSnakeCase(artwork);
    // console.log(artworkDb)
}

run()