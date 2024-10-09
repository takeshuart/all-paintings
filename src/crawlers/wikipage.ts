import * as cheerio from 'cheerio';
import { axiosAgented } from "../utils/https.js";
import { ArtWork, ArtWorkProperties, createArtWorkFromWikiTable } from './artwork.js';
import { WikiPageWithTable } from './wikitable-config.js';
import Datastore from 'nedb';
import * as fs from 'fs';
import * as path from 'path';
import { AnyARecord } from 'dns';
import { scrapTables } from './wikitableScraper.js';

const db = new Datastore({ filename: './nedb.db', autoload: true });
export const dataBasePath=path.join(__dirname, '../../data/')
const filePath = path.join(__dirname, '../../data/data.json');

export class WikiPage {
    private url?: string;
    $?: any;
    static async load(url: string): Promise<WikiPage> {

        const wikiPage = new WikiPage();
        const response = await axiosAgented.get(url);
        const html = response.data;
        wikiPage.$ = cheerio.load(html);
        return wikiPage;
    }
}

//下载wikitable
export async function downloadWikiTable(wikipageConfig:WikiPageWithTable) {

    console.log(wikipageConfig.url)
    const wikiPage = await WikiPage.load(wikipageConfig.url)
    try {
        const tables = scrapTables(wikiPage.$);
        let artworks: ArtWork[] = []

        tables[0].forEach((element: any) => {
            const artwork = createArtWorkFromWikiTable(element, wikipageConfig.config)
            if(wikipageConfig.museum){
                artwork.museumLocation=wikipageConfig.museum?.location
                artwork.museum=wikipageConfig.museum?.name
            }
            artworks.push(artwork);
            console.log(JSON.stringify(artwork))
        });
        saveArtWorksToJSON(artworks)
        console.log('Tables found:' + artworks.length);
    } catch (error) {
        console.error('Error:', error);
    }
}





export function saveArtWorksToJSON(artworks: ArtWork[]) {
    let jsonData = JSON.stringify(artworks, null, 0);
    fs.writeFile(filePath, jsonData, 'utf8', function (err) {
        if (err) {
            console.log("An error occured while writing JSON Object to File.");
            return console.log(err);
        }
        console.log("JSON file has been saved.");
    });
}

export function saveJsonToFile(jsonString:string,subPath:string) {
    // let jsonData = JSON.stringify(json, null, 0);
    const p=path.join(dataBasePath,subPath)
    fs.writeFile(p, jsonString, 'utf8', function (err) {
        if (err) {
            console.log("An error occured while writing JSON Object to File.");
            return console.log(err);
        }
        console.log("JSON file has been saved.");
    });
}

export function insertDB(artWork: ArtWork) {
    db.insert(artWork, (err, newDoc) => {
        if (err) {
            console.error('Error inserting document:', err);
            return;
        }
        console.log('Inserted', newDoc);
    });
}

