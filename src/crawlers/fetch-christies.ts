import { WikiPage, downloadWikiTable } from "./wikipage";
import { wikiPageList } from "./wikitable-config";
import * as cheerio from 'cheerio';
import * as iconv from 'iconv-lite';
import fs from 'fs';
import * as path from 'path';
import { json } from "stream/consumers";
import { axiosAgented, downloadFile, downloadFileWithProxy } from "../utils/https"

//wikipage, museum, open api

const dataBasePath = path.join(__dirname, '../../data/')
/**
 * chrome inspect的headers选项卡最下方有所有所有headers，可通过getman.cn测试
 */
const headers = {
    Accept: 'application/vnd.christies.v1+json',
    'Accept-Encoding': 'gzip, deflate, br, zstd',
    Connection: 'keep-alive',
    Host: 'apim.christies.com',
    Origin: 'https://www.christies.com',
    Referer: 'https://www.christies.com/',
    'Sec-Fetch-Dest': 'empty',
    'Sec-Fetch-Mode': 'cors',
    'Sec-Fetch-Site': 'same-site',
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/129.0.0.0 Safari/537.36',
    'correlation-id': '1a5ed204-42b8-4cf5-872f-b8da0b3af90a',
    'sec-ch-ua': '"Google Chrome";v="129", "Not=A?Brand";v="8", "Chromium";v="129"',
    'sec-ch-ua-platform': '"Windows"',
};

async function fetchPage(keyword: string, page: number): Promise<any | null> {
    try {
        const url = `https://apim.christies.com/search-client?keyword=${encodeURIComponent(
            keyword
        )}&page=${page}&is_past_lots=True&sortby=relevance&language=en&geocountrycode=JP&show_on_loan=true&datasourceId=182f8bb2-d729-4a38-b539-7cf1a9`;

        const response = await axiosAgented.get(url, { headers });

        // 返回分页的结果
        return {
            keyword,
            page,
            totalPages: response.data.totalPages, // 假设API返回totalPages
            data: response.data,
        };
    } catch (error) {
        console.error(`Failed to fetch page ${page}:`, error);
        return null;
    }
}

async function fetchAllPages(keyword: string) {
    let page = 1;
    let totalPages;
    const data:any[]=[]
    do {
        const result = await fetchPage(keyword, page);
        
        if (result) {
            console.log(`Page ${page} results:`, result.data);
            data.push(result.data)
            totalPages = result.data.total_pages;
            page++;
            console.log(`Fetched page ${page} of ${totalPages}`);
        } else {
            console.log(`No more data found for keyword: ${keyword}`);
            break;
        }
    } while (page <= totalPages);
    console.log('All pages fetched.');
    
    console.log('Starting download images..');
    downloadImages(keyword,data)

}
async function downloadImages(artist:string,data:any[]) {
    const noImage = 'non_NoImag'
    const outputDir = path.join('D:\\Arts\\后印象派', artist);
    if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
    }

    for (let i = 0; i < data.length; i++) {
        const page = data[i];
        for (let j = 0; j < page.lots.length; j++) {
            const lot = page.lots[j];
            if (!lot.title_secondary_txt || lot.image.image_src.includes(noImage)) {
                continue;
            }
            const title=lot.title_secondary_txt.replace(':','-')
            try {
                const imageName = artist + '_-_' + title + "_-_from Christies-" + lot.object_id + ".jpg"
                const imagePath = path.join(outputDir, imageName)
                await downloadFileWithProxy(lot.image.image_src, imagePath);
                console.log(`Image downloaded successfully,${j}/${page.lots.length}:\t${imagePath}',ImageURL:${lot.image.image_src}`);
                await new Promise(resolve => setTimeout(resolve, 100));
            } catch (error) {
                console.error(`Error fetching image! Christies lot: ${title} - ${lot.object_id}`, error);
            }
        }
    }
}
function readJsonFile<T>(fileName: string): T[] {
    const p = path.join(dataBasePath, fileName);
    const dataJson = fs.readFileSync(p, 'utf8');
    return JSON.parse(dataJson) as T[];
}


fetchAllPages('Anton Mauve')