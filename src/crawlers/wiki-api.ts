import { AxiosResponse } from 'axios';
import { axiosAgented } from '../utils/https';
import cheerio from 'cheerio';
import { fileHomePath } from './artic-museum';
import path from 'path';
import fs from 'fs';


//Wikimedia API doc:https://www.mediawiki.org/wiki/API:Properties/
//https://commons.wikimedia.org/w/api.php
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
        const fileName = `wiki/${category.replace(':', '-')}.jsonl`
        const allArtworkOfAnC = path.join(fileHomePath, fileName)
        const response: AxiosResponse<WikiApiResponse> = await axiosAgented.get(endpoint, { params });
        const pages = response.data.query.categorymembers;
        const continueToken = response.data.continue?.cmcontinue;

        // for (const page of pages) {
        //     await fetchImageInfo(page.pageid);
        //     new Promise(resolve => setTimeout(resolve, 10));
        // }

        const artworks = pages.map((item: any) => {
            const aw = {
                pageid: item.pageid,
                title: item.title
            }
            return JSON.stringify(aw);
        });
        const allStrings = artworks.join('\n')


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
// fetchCategory('Category:Featured_pictures_on_Wikimedia_Commons');


async function parseWikimediaSummary() {
    try {
        // 使用Axios获取维基媒体文件详情页的HTML内容
        const response = await axiosAgented.get('https://commons.wikimedia.org/wiki/File:Alfred_Sisley_-_Moret-_The_Banks_of_the_River_Loing,_1877_-_Google_Art_Project.jpg');

        // 使用Cheerio库解析HTML内容
        const $ = cheerio.load(response.data);

        // 在此处查找和提取所有有效信息
        const info: any = {};

        // 查找所有表格行
        $('table.fileinfotpl-type-artwork tbody tr:not([valign="top"])').each((index, row) => {
            const $row = $(row);
            const field = $row.find('td:eq(0)').text().trim();
            const $value = $row.find('td:eq(1)');

            const $subTable = $value.find('.vcard table');
            if ($subTable.length > 0) {
                info[field] = resolveWikiVCard($, $subTable);
            } else {
                const iTag = $value.find('i');
                if (iTag.length > 0) {
                    info[field] = iTag.text().trim()
                } else {
                    info[field] = $value.text()
                }
            }
        });

        console.log('Parsed Information:');
        console.log(JSON.stringify(info));

    } catch (error) {
        console.error('Error parsing Wikimedia summary:', error);
    }
}

//vcard是wikimedia页面中默认折叠起来的信息卡，通常出现在Artist和Collection中。
function resolveWikiVCard($: cheerio.Root, $vcard: cheerio.Cheerio): any {
    const vcardInfo: any = {}

    $vcard.find('tr').each((i, tr) => {
        const $tr = $(tr);
        const $creator = $tr.find('#creator');
        if ($creator.length > 0) {
            vcardInfo['wikipedia_url'] = $creator.find('bdi a').attr('href');
            vcardInfo['title'] = $creator.find('span').attr('title')?.trim();
            vcardInfo['name'] = $creator.find('span').text().trim();
        }
        const $photo = $tr.find('.photo')
        if ($photo.length > 0) {
            const photoUrl = $photo.find('img').attr('src')
            vcardInfo['creatorPhotoUrl'] = photoUrl;
        }

        const th = $tr.find('th');
        if (th.attr('scope')) {
            const field = th.text()

            const tdArray: any = []
            $tr.find('td').each((index, td) => {
                const tdText = $(td).find('div:not([style*="display: none;"])').text().trim();
                tdArray.push(tdText);
            });
            vcardInfo[field] = tdArray
        }

    })
    return vcardInfo

}
// 调用解析函数
parseWikimediaSummary();



