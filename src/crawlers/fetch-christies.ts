import { WikiPage, downloadWikiTable } from "./wikipage";
import { wikiPageList } from "./wikitable-config";
import * as cheerio from 'cheerio';
import * as iconv from 'iconv-lite';
import fs from 'fs';
import * as path from 'path';
import { json } from "stream/consumers";
import { axiosAgented, downloadFile } from "../utils/https";

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
        )}&page=${page}&is_past_lots=True&sortby=relevance&language=en&geocountrycode=JP&show_on_loan=true&datasourceId=182f8bb2-d729-4a38-b539-7cf1a901cf2e`;

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
    let totalPages = 1;

    do {
        console.log(`Fetching page ${page} of ${totalPages}`);
        const result = await fetchPage(keyword, page);

        if (result) {
            console.log(`Page ${page} results:`, result.data);

            totalPages = result.totalPages;
            page++;
        } else {
            console.log(`No more data found for keyword: ${keyword}`);
            break;
        }
    } while (page <= totalPages);

    console.log('All pages fetched.');
}
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
                const imagePath = path.join(imageOutputDir, artist, imageName)
                await downloadFile(lot.image.image_src, imagePath);
                console.log(`Image downloaded successfully,${j}/${page.lots.length}:\t${imagePath}',ImageURL:${lot.image.image_src}`);
                await new Promise(resolve => setTimeout(resolve, 100));
            } catch (error) {
                console.error(`Error fetching image! Christies lot: ${lot}`, error);
            }
        }
    }
}
function readJsonFile<T>(fileName: string): T[] {
    const p = path.join(dataBasePath, fileName);
    const dataJson = fs.readFileSync(p, 'utf8');
    return JSON.parse(dataJson) as T[];
}


fetchAllPages('Jan Sluijters')