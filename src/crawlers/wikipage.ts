import * as cheerio from 'cheerio';
import { axiosAgented } from "../utils/https.js";
import { ArtWork, ArtWorkProperties, createArtWorkFromWikiTable } from './artwork.js';
import { WikiPageWithTable } from './wikitable-config.js';
import Datastore from 'nedb';
import * as fs from 'fs';
import * as path from 'path';

export class WikiPage {
    private url?: string;
    private $?: any;
    static async load(url: string): Promise<WikiPage> {

        const wikiPage = new WikiPage();
        const response = await axiosAgented.get(url);
        const html = response.data;
        wikiPage.$ = cheerio.load(html);
        return wikiPage;
    }

    tables(): any[] {
        try {
            const tables = this.$('.wikitable');
            const result: any = [];

            tables.each((tableIndex: number, table: any) => {
                const tableData: any = [];
                const rows = this.$(table).find('tr');

                rows.each((rowIndex: number, row: any) => {
                    const rowData: any = [];
                    const tdList = this.$(row).find('td');
                    if (tdList.length <= 1) { return; } //invalid wikitable

                    tdList.each((colIndex: any, td: any) => {
                        const imgTag = this.$(td).find('img');
                        if (imgTag.length > 0) { //image box
                            let imageBox: any = {}
                            let imgSrc = imgTag.attr('src');
                            if (imgSrc && imgSrc.startsWith('//')) {
                                imgSrc = 'https:' + imgSrc;
                            }
                            imageBox["src"] = imgSrc

                            if (imgTag.parent().is('a')) {
                                const imageDetailUrl = imgTag.parent().attr('href');
                                imageBox['href'] = imageDetailUrl
                            }

                            const figcaption = this.$(td).find('figcaption');
                            if (figcaption.length > 0) {
                                imageBox['title'] = figcaption.text();
                            }
                            rowData.push(imageBox);

                        } else { //pure text
                            rowData.push(this.$(td).text().trim());
                        }
                    });

                    if (rowData.length > 0) {
                        tableData.push(rowData);
                    }
                });

                if (tableData.length > 0) {
                    result.push(tableData);
                }
            });

            return result;
        } catch (error) {
            console.error('Failed to parse wikitable:', error);
            return [];
        }
    }

}

//下载wikitable
export async function downloadWikiTable(wikipageConfig:WikiPageWithTable) {

    console.log(wikipageConfig.url)
    const wikiPage = await WikiPage.load(wikipageConfig.url)
    try {
        const tables = wikiPage.tables();
        let artworks: ArtWork[] = []

        tables[0].forEach((element: any) => {
            const artwork = createArtWorkFromWikiTable(element, wikipageConfig.config)
            if(wikipageConfig.museum){
                artwork.location=wikipageConfig.museum?.location
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



const db = new Datastore({ filename: './nedb.db', autoload: true });
const filePath = path.join(__dirname, '../../data/data.json');


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

export function insertDB(artWork: ArtWork) {
    db.insert(artWork, (err, newDoc) => {
        if (err) {
            console.error('Error inserting document:', err);
            return;
        }
        console.log('Inserted', newDoc);
    });
}