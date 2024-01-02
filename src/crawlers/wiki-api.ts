import { AxiosResponse } from 'axios';
import { axiosAgented } from '../utils/https';
import cheerio from 'cheerio';
import { fileHomePath } from './artic-museum';
import path from 'path';
import fs from 'fs';
import { JSONSchemaObject } from 'openai/lib/jsonschema';
import { each } from 'jquery';


//Wikimedia API doc:https://www.mediawiki.org/wiki/API:Properties/
//https://commons.wikimedia.org/w/api.php
//获取wikimedia Category的数据
async function crawlerWikimediaFileInfoFromPageIDs() {
    const wikiPageUrl = 'https://commons.wikimedia.org/w/index.php?curid='
    const file = path.join(fileHomePath, 'wiki/Category-Files_from_Google_Arts_-_Culture.jsonl')
    const saveFile = path.join(fileHomePath, 'wiki/AllData_Category-Files_from_Google_Arts_-_Culture.jsonl')
    const wikiPages = fs.readFileSync(file, 'utf-8').split('\n')

    const artworks: any = []
    for (let index = 0; index < wikiPages.length; index++) {
        const page = wikiPages[index];
        console.log(page)
        const pageid = JSON.parse(page)['pageid']
        const response = await axiosAgented.get(wikiPageUrl + pageid);
        const info = scrapeMWFilePage(response);
        artworks.push(info)
        new Promise(resolve => setTimeout(resolve, 1))
        if (index == 20) {

            const allFields = artworks.reduce((fields: Set<String>, obj: JSONSchemaObject) => {
                for (const key in obj) {
                    if (obj.hasOwnProperty(key)) {
                        fields.add(key);
                    }
                }
                return fields;
            }, new Set<String>());

            // 转换为数组
            const uniqueFields = Array.from(allFields);
            console.log(uniqueFields)
            break;
        }
    }

    const json = JSON.stringify(artworks, null, 2)
    // fs.appendFileSync(saveFile,json)
}

// fetchCategoryListToFile('Category:Files from Google Arts & Culture')

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

//Api doc: https://www.mediawiki.org/wiki/API:Categorymembers
//通过continueToken自动获取下一页，default pagesize is 200
//保存category列表中的pageid到文件
async function fetchCategoryListToFile(category: string, continueFrom?: string): Promise<void> {
    const endpoint = 'https://commons.wikimedia.org/w/api.php';
    let params: any = {
        action: 'query',
        list: 'categorymembers',
        cmtitle: category, //Must include the Category: prefix. For example 'Category:Physics'
        cmlimit: 'max',
        format: 'json',
        formatversion: 2
    };

    if (continueFrom) { //pagination
        params.cmcontinue = continueFrom;
    }

    try {
        const fileName = `wiki/${category.replace(/[:&]/g, '-').replace(/\s+/g, '_')}.jsonl`
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
        fs.appendFileSync(allArtworkOfAnC, allStrings)

        if (continueToken) {
            await fetchCategoryListToFile(category, continueToken);
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
//example: https://commons.wikimedia.org/w/index.php?curid=22001497
export function scrapeMWFilePage(response: any) {
    try {
        const $ = cheerio.load(response.data);

        const info: any = {};

        //resolve resolution of image
        const file_info = {
            preview_url: $('.mw-filepage-resolutioninfo a:first').attr('href'),
            preview_resolution: $('.mw-filepage-resolutioninfo a:first').text().trim(),
            original_url: $('.fullMedia a:first').attr('href'),
            original_info: $('.fullMedia .fileInfo').text().trim()
        };
        info['fileInfo'] = file_info;



        //仅查找直接tr元素，不包括嵌套table
        $('table.fileinfotpl-type-artwork > tbody > tr').each((index, row) => {
            const $row = $(row);
            const th = $row.find('th')
            if (index == 0 && th.length > 0) {
                th.find('#artwork a').each((i, a) => {
                    const aTag = $(a)
                    const href = aTag.attr('href');
                    const title = aTag.attr('title');
                })

                th.find('span[typeof^="mw:File"]').each((i, s) => {
                    const title = $(s).attr('title')
                    if (title?.startsWith('wikidata')) {//wikidata
                        const href = $(s).attr('href')
                    }
                })
            }

            let field = $row.find('td:eq(0)').text().trim();
            const $value = $row.find('td:eq(1)');
            field = toCamelCase(field)

            //可能包含多个vcard
            const $subTable = $value.find('.vcard:eq(0) table');
            if ($subTable.length > 0) {
                info[field] = resolveWikiVCard($, $subTable);
            } else {
                if (!$value.find('div[style="display: none;"]').length) {
                    info[field] = $value.text().trim()
                }
            }
        });

        //mediawiki分类信息
        const categories: any = []
        $('.mw-normal-catlinks li').each((index, element) => {
            const liText = $(element).text().trim();
            categories.push(liText);
        });
        info['categories'] = categories

        return info
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
        const $photo = $tr.find('.photo')
        //有的表格使用td作标题列，','= or
        const head = $tr.find('th, td:first-child')

        if ($creator.length > 0) {
            vcardInfo['wikipedia_url'] = $creator.find('bdi a').attr('href');
            vcardInfo['title'] = $creator.find('span').attr('title')?.trim();
            vcardInfo['name'] = $creator.find('span').text().trim();

        } else if ($photo.length > 0) {
            const photoUrl = $photo.find('img').attr('src')
            vcardInfo['photo_url'] = photoUrl;

        } else if (head) {
            const field = head.text()
            const tds = head.nextAll('td')
            const tdArray: any = []

            tds.each((index, td) => {
                //there may not be a div tag
                const tdText = $(td).find('div:not([style*="display: none;"])').text().trim() || $(td).text().trim();
                tdArray.push(tdText);
            });

            vcardInfo[field] = tdArray.length === 1 ? tdArray[0] : tdArray;

        }

    })
    return vcardInfo

}

// Place of creation => PlaceOfCreation
function toCamelCase(input: string) {
    return input.replace(/(?:^\w|[A-Z]|\b\w)/g, (word, index) => {
        return index === 0 ? word.toLowerCase() : word.toUpperCase();
    }).replace(/\s+/g, '');
}

//mediawiki mw
class MediaWikiFile {
    constructor(
        public fileInfo?: string,
        public artist?: string,
        public description?: string,
        public date?: string,
        public collection?: string,
        public accessionNumber?: string,
        public references?: string,
        public sourcePhotographer?: string,
        public objectType?: string,
        public medium?: string,
        public currentLocation?: string,
        public notes?: string,
        public otherVersions?: string,
        public partOf?: string,
        public genre?: string,
        public depictedPeople?: string,
        public language?: string,
        public dimensions?: string,
        public objectLocation?: string,
        public placeOfCreation?: string,
        public placeOfDiscovery?: string,
        public objectHistory?: string,
        public inscriptions?: string,
        public author?: string,
        public authorityFile?: string,
        public permissionReusingThisFile?: string,
        public title?: string,
        public exhibitionHistory?: string,
        public creditLine?: string
    ) { }
}
