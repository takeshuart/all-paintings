import { AxiosResponse } from 'axios';
import { axiosAgented } from '../utils/https';
import cheerio from 'cheerio';
import { fileHomePath } from './artic-museum';
import path from 'path';
import fs from 'fs';


//Wikimedia API doc:https://www.mediawiki.org/wiki/API:Properties
//获取wikimedia Category的数据
interface WikiApiResponse {
    continue?: {
        cmcontinue: string;
    };
    query: {
        categorymembers: Array<{
            pageid: number;
            ns: number;
            title: string;
        }>;
    };
}

interface ImageInfoResponse {
    query: {
        pages: {
            [key: number]: {
                imageinfo: Array<{
                    url: string;
                    descriptionurl: string;
                    // Add other fields as needed
                }>;
            };
        };
    };
}
interface WikiMediaArtWorkInfo {
    AccessionNumber: string //博物馆收藏编号，inventory number

}

//该接口返回文件的imageurl\descriptionurl\descriptionshorturl 3个重要信息
//其中descriptionurl是wikiepedia域名，形如：https://en.wikipedia.org/wiki/File:Zuccarelli,_Francesco_-_Landscape_-_Google_Art_Project.jpg
//descriptionshorturl是wikimedia域名，形如：https://commons.wikimedia.org/w/index.php?curid=22001497
//两者内容是完全一样的，shorturl最后的数字为pageid，又category接口返回。
//所以可以直接通过pageid，下载html，跳过中间的imageinfo接口。
async function fetchImageInfo(pageid: number): Promise<void> {
    const endpoint = 'https://commons.wikimedia.org/w/api.php';
    let params = {
        action: 'query',
        prop: 'imageinfo',
        iiprop: 'url|descriptionurl', // Specify additional properties here if needed
        pageids: pageid,
        format: 'json'
    };

    try {
        const response: AxiosResponse<ImageInfoResponse> = await axiosAgented.get(endpoint, { params });
        const imageInfo: any = response.data.query.pages[pageid].imageinfo[0];
        fetchArtWorkDetails(imageInfo.descriptionshorturl)
        // console.log(imageInfo);
    } catch (error) {
        console.error('Error fetching image info:', error);
    }
}

//https://commons.wikimedia.org/wiki/Category:Google_Art_Project_paintings
async function fetchCategory(category: string, continueFrom?: string): Promise<void> {
    const endpoint = 'https://commons.wikimedia.org/w/api.php';
    let params: any = {
        action: 'query',
        list: 'categorymembers',
        cmtitle: category,
        cmlimit: 'max',
        format: 'json',
        formatversion: 2
    };

    if (continueFrom) {
        params.cmcontinue = continueFrom;
    }

    try {
        const allArtworkOfAnC = path.join(fileHomePath, 'google_anc_arworks.txt')
        const response: AxiosResponse<WikiApiResponse> = await axiosAgented.get(endpoint, { params });
        const pages = response.data.query.categorymembers;
        const continueToken = response.data.continue?.cmcontinue;

        // for (const page of pages) {
        //     await fetchImageInfo(page.pageid);
        //     new Promise(resolve => setTimeout(resolve, 10));
        // }

        const artworks = pages.map((item: any) => {
            return `${item.pageid}\t${item.title}`;
        });
        const allStrings=artworks.join('\n')
        fs.appendFileSync(allArtworkOfAnC, allStrings)

        if (continueToken) {
            await fetchCategory(category, continueToken);
        }
    } catch (error) {
        console.error('Error fetching category images:', error);
    }
}

//通过pageid访问：https://commons.wikimedia.org/w/index.php?curid=22491371
async function fetchArtWorkDetails(url: string) {
    try {
        const response = await axiosAgented.get(url);

        const $ = cheerio.load(response.data);
        const artworkDetails = $('table.fileinfotpl-type-artwork tr');

        artworkDetails.each((index: number, element: any) => {
            const property = $(element).find('th').text().trim();
            const value = $(element).find('td').text().trim();

            if (property && value) {
                console.log(`${property}: ${value}`);
            }
        });
        return "";
    } catch (error) {
        console.error('Error fetching image description:', error);
        return '';
    }
}

//wikimedia收录的Google art所有文件，包括painting\drawing\print
//https://commons.wikimedia.org/wiki/Category:Files_from_Google_Arts_%26_Culture
fetchCategory('Category:Files from Google Arts & Culture');


