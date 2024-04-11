import { axiosAgented, downloadFile } from "../utils/https";
import { WikiPage, dataBasePath, downloadWikiTable } from "./wikipage";
import { wikiPageList } from "./wikitable-config";
import * as cheerio from 'cheerio';
import * as iconv from 'iconv-lite';
import fs from 'fs';
import * as path from 'path';
import { json } from "stream/consumers";

//wikipage, museum, open api


downloadWikiTable(wikiPageList.VanGoghNewList)



//佳士得数据抓取
//Christie的数据是通过api同态加载的，无法通过html访问
//这个接口直接访问会返回404: Resource not found
//https://apim.christies.com/search-client?sortby=alllots_asc
//可在chrome inspect中获取接口返回的json
async function fetchFromChristies() {

    const imageDir = 'D:\\Arts\\matisse';
    if (!fs.existsSync(imageDir)) {
        fs.mkdirSync(imageDir, { recursive: true });
    }
    try {

        const jsons = readJsonFile<any>('Matisse-from-Chrities.json')
        for (let i=0;i<jsons.length;i++) {
            const json = jsons[i];
            const imageName = json.title_secondary_txt + "_" + json.object_id + ".jpg"
            const imagePath = path.join(imageDir, imageName)
            await downloadFile(json.image.image_src, imagePath);
            console.log(`Image downloaded successfully,${i}/${jsons.length}:\t${imageName}'`);
            await new Promise(resolve => setTimeout(resolve, 100));
        }

    } catch (error) {
        console.error('Error fetching image:', error);
    }

}

async function fetchHtml(url: string): Promise<cheerio.Root> {
    const response = await axiosAgented.get(url);
    const html = iconv.decode(Buffer.from(response.data), 'utf-8');
    const $ = cheerio.load(html);
    return $
}


function readJsonFile<T>(fileName: string): T[] {
    const p = path.join(dataBasePath, fileName);
    const dataJson = fs.readFileSync(p, 'utf8');
    return JSON.parse(dataJson) as T[];
}

