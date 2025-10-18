import { ArtWork } from '../crawlers/artwork'
import { dbArtwork } from './db';

export function toSnakeCase(str: string): string {
    return str.replace(/([A-Z])/g, "_$1").toLowerCase();
}

export  function mapKeysToSnakeCase(obj: Record<string, any>): Record<string, any> {
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

        const artworkDb = mapKeysToSnakeCase(artwork);

        const keys = Object.keys(artworkDb);
        const values = Object.values(artworkDb);
        const placeholders = keys.map(() => '?').join(', ');

        const insertStmt = `INSERT INTO art_work (${keys.join(', ')}) VALUES (${placeholders})`;
        console.log(`sql: ${insertStmt}`)
        const insert = dbArtwork.prepare(insertStmt);

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
