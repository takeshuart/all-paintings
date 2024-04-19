import path from "path";
import { dataBasePath } from "../crawlers/wikipage";
import { json } from "stream/consumers";
import { readFileSync, readJSONSync } from "fs-extra";
import Database from "better-sqlite3";

const jsonDataPath = path.join(dataBasePath, './van gogh/merge-vgww-pubhist-vggallery.json')

const pubhistMap = loadWorksMap()

insertToDB()

async function insertToDB() {
    const jsons = readJSONSync(jsonDataPath)
    const dbFile = path.join(__dirname, '../../artwork.db')
    console.log(`DB file: ${dbFile}`)
    const dbArtwork = new Database(dbFile, { verbose: console.log });

    for (const json of jsons) {
        try {

            const dto = convertToDTO(json);
            const keys = Object.keys(dto);
            const values = Object.values(dto);
            const placeholders = keys.map(() => '?').join(',');
            const sql = `INSERT INTO artwork_vincent (${keys.join(',')}) VALUES (${placeholders})`;
            const insert = dbArtwork.prepare(sql);
            insert.run(...values);
        } catch (err) {
            console.error(`failed to insert db: ${json.fCode},${json.jhCode}`, err)
            throw err
        }
    }
}

function convertToDTO(obj: any) {
    const titles = obj.titles;
    let en, zh;
    titles.forEach((t: any) => {
        if (t.language == 'English') {
            en = t.title
        }
        if (t.language == 'Chinese') {
            zh = t.title
        }
    })

    return {
        title_en: en,
        title_zh: zh,
        f_code: obj.fCode,
        jh_code: obj.jhCode,
        collection: obj.owner,
        genre: obj.genre,
        depicts: '',
        period: obj.period,
        display_date: obj.dateDisplay,
        location_city: obj.country,
        place_of_origin: obj.placeOfOrigin,
        dimension: obj.dimension,
        is_highlight: 0,
        short_desc: '',
        primary_colour: '',
        description: '',
        technique: obj.technique,
        primary_image_small: obj.puhhistImageUrl,
        primary_image_medium: '',
        primary_image_large: '',
        primary_image_original: '',
        related_letters: '',
        related_artwork: '',
        ext_links: '',
        exhibitions: '',
        literature: '',
        date_start: obj.dateStart,
        date_end: obj.dateEnd,
        material: obj.material,
        inventory_code: obj.accessionNo,
        data_source: ''
    };
}

function loadWorksMap() {
    const worksMap = new Map<string, any>();

    //用检索条件补充artwork属性
    const jsons = readJSONSync(jsonDataPath)
    for (const obj of jsons) {
        if (obj.pubhistUrl && obj.fCode) {
            worksMap.set(obj.pubhistUrl, obj.fCode)
        }
    }
    return worksMap
}