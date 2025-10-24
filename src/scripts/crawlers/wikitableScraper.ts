import { any } from "bluebird";
import { axiosAgented } from "../../utils/https.js"
import * as cheerio from 'cheerio';


const url = '   '

// scrapeWikiTable(url)

async function scrapeWikiTable(url: string) {
    const response = await axiosAgented.get(url);
    const html = response.data;
    const $ = cheerio.load(html);
    const result = scrapTables($)
    const first = result[0];
    // console.log(JSON.stringify(first.slice(100,105)))
    let count = 0;
    for (let i = 0; i < first.length; i++) {
        const row = first[i]
        if (Array.isArray(row[3])) {
            if (String(row[3][0].text).includes('Vincent van Gogh')) {
                count++
                if(!String(row[0].wikiFileUrl).includes('Van_Gogh_Museum')){
                    if(Array.isArray(row[9])){   
                        row[9].forEach((url:any) => {
                            if(url.href.startsWith('http://www.vangoghmuseum.nl')){
                                console.log(url.href)
                            }
                        });
                    }
                }
            }
        }
    }

    console.log(`van gogh total:${count}`)
}
export function scrapTables($: cheerio.Root): any[] {
    try {
        const tables = $('.wikitable');
        const result: any = [];
        tables.each((tableIndex: number, table: any) => {
            const tableData: any = [];
            const rows = $(table).find('tr');

            rows.each((rowIndex: number, row: any) => {
                const rowData: any = [];
                const tdList = $(row).find('td');
                if (tdList.length <= 1) { return; } //invalid wikitable

                tdList.each((colIndex: any, td: any) => {

                    if ($(td).find('img').length > 0) { //image box
                        let imageBox: any = extractImageInfo($(td));
                        rowData.push(imageBox);

                    } else if ($(td).find('a').length > 0) {
                        const arr: any[] = []
                        const aTags = $(td).find('a')
                        aTags.each(function (this: HTMLElement) {
                            const href = $(this).attr("href");
                            const text = $(this).text().trim();
                            arr.push({
                                'href': href,
                                'text': text
                            })
                        });
                        rowData.push(arr)
                    } else {
                        rowData.push($(td).text().trim()); //pure text
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

function extractImageInfo(imageTd: cheerio.Cheerio) {
    let imageBox: any = {};
    const imgTag = imageTd.find('img')
    let imgSrc = imgTag.attr('src');
    if (imgSrc && imgSrc.startsWith('//')) {
        imgSrc = 'https:' + imgSrc;
    }
    imageBox["thumbUrl"] = imgSrc;

    if (imgTag.parent().is('a')) {
        const imageDetailUrl = imgTag.parent().attr('href');
        imageBox['wikiFileUrl'] = imageDetailUrl;
    }

    const figcaption = imageTd.find('figcaption');
    if (figcaption.length > 0) {
        imageBox['title'] = figcaption.text();
    }
    return imageBox;
}