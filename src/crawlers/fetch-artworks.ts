import { WikiPage, downloadWikiTable } from "./wikipage";
import { wikiPageList } from "./wikitable-config";
import * as cheerio from 'cheerio';
import * as iconv from 'iconv-lite';
import fs from 'fs';
import * as path from 'path';
import { json } from "stream/consumers";
import { downloadFile } from "../utils/https";

//wikipage, museum, open api

const dataBasePath = path.join(__dirname, '../../data/')

// downloadWikiTable(wikiPageList.VanGoghNewList)
fetchFromChristies()


//佳士得数据抓取
//Christie的数据是通过api同态加载的，无法通过html访问
//这个接口直接访问会返回404: Resource not found
//https://apim.christies.com/search-client?sortby=alllots_asc
//可在chrome inspect中获取接口返回的json
async function fetchFromChristies() {
    const noImage = 'non_NoImag'
    const imageOutputDir = 'D:\\Arts\\后印象派';
    if (!fs.existsSync(imageOutputDir)) {
        fs.mkdirSync(imageOutputDir, { recursive: true });
    }
    const fileName = 'Christies_-_Egon Schiele.json';
    const artist = 'Egon Schiele'
    //Christies 分页数据
    const pages = readJsonFile<any>(fileName)
    for (let i = 0; i < pages.length; i++) {
        const page = pages[i];
        for (let j = 0; j < page.lots.length; j++) {
            const lot = page.lots[j];
            if (!lot.title_secondary_txt || lot.image.image_src.includes(noImage)) {
                continue;
            }
            try {
                const imageName = artist + '_-_' + lot.title_secondary_txt + "_-_from Christies-" + lot.object_id + ".jpg"
                const imagePath = path.join(imageOutputDir,artist, imageName)
                await downloadFile(lot.image.image_src, imagePath);
                console.log(`Image downloaded successfully,${j}/${page.lots.length}:\t${imagePath}',ImageURL:${lot.image.image_src}`);
                await new Promise(resolve => setTimeout(resolve, 100));
            } catch (error) {
                console.error(`Error fetching image! Christies lot: ${lot}`, error);
            }
        }
    }
}

// async function fetchFromChristiesByUrl() {
//     const url = 'https://www.christies.com/en/lot/lot-6453117'
//     try {

//         const resp = await axiosAgented.get(url)
//         const data = resp.data
//         console.log(data)
//         const html = cheerio.load(data)
//         console.log(html)
//     } catch (error) {
//         console.error('Error fetching data:', error);
//         // Handle error appropriately, e.g., retry, log, or throw
//     }
// }



// async function fetchHtml(url: string): Promise<cheerio.Root> {
//     const response = await axiosAgented.get(url);
//     const html = iconv.decode(Buffer.from(response.data), 'utf-8');
//     const $ = cheerio.load(html);
//     return $
// }


function readJsonFile<T>(fileName: string): T[] {
    const p = path.join(dataBasePath, fileName);
    const dataJson = fs.readFileSync(p, 'utf8');
    return JSON.parse(dataJson) as T[];
}

