import { AxiosResponse } from 'axios';
import { axiosAgented, downloadFile } from '../utils/https'
import cheerio from 'cheerio';
import { fileHomePath } from './artic-museum';
import path from 'path';
import fs from 'fs';
import { JSONSchemaObject } from 'openai/lib/jsonschema';
import { each } from 'jquery';
import { dataBasePath } from './wikipage';

//=====爬取wikimeida的数据=====
//1. 根据wikimedia的api获取某Category下的所有Item 
//2. 根据wikimedia PageId(从1中获取）抓取图片文件的详情信息

function runner() {
    //fetchWikimediaCategory('Category:Google Art Project works by Vincent van Gogh')
    downloadVanGoghImageFile()
}

async function fetchGoogleArtProjectFile() {
    const file = 'wiki/Category-Google_Art_Project_works_by_Vincent_van_Gogh.jsonl';
    const outputFile = path.join(fileHomePath, 'wiki/fulldata-Google_Art_Project_works_by_Vincent_van_Gogh.jsonl')
    const artworks = await crawlerWikimediaFileInfoFromPageIDs(file)

    for (let i = 0; i < artworks.length; i++) {
        const at = artworks[i]
        //提取Van Gogh作品的F和JH编码
        if (at['artist']['name'] == 'Vincent van Gogh' && at["notes"]) {
            const pattern = /(F|JH)\d+/g;
            let matches = at.notes.match(pattern);
            if (!matches) {
                matches = at.references.match(pattern);
            }
            if (!matches) { break }

            // 只取 matches 的前两个元素
            const only2 = matches.slice(0, 2);

            for (const m of only2) {
                if (m.startsWith("F")) {
                    at['f_number'] = m;
                } else if (m.startsWith("JH")) {
                    at['jh_number'] = m;
                }
            };
        }

    }
    const json = JSON.stringify(artworks, null, 2)
    fs.appendFileSync(outputFile, json)
}

//下载Van Gogh Google Art Project File
async function downloadVanGoghImageFile() {

    const file = path.join(dataBasePath, './wiki/fulldata-Google_Art_Project_works_by_Vincent_van_Gogh.jsonl')
    const fulldata = fs.readFileSync(file, 'utf-8')
    const jsonworks = JSON.parse(fulldata)

    for (let index = 0; index < jsonworks.length; index++) {
        const artwork = jsonworks[index]
        const imageDir = 'D:\\Arts\\Van Gogh\\Google Art Project';
        const fileUrl = artwork['fileInfo']['original_url']
        const fileName = artwork['jh_number'] + '_' + artwork['f_number'] + '_' + artwork['file_name'];

        try {
            const fileSizeMatch = artwork['fileInfo']['original_info'].match(/file size: ([\d.]+) MB/);
            const filePath = path.join(imageDir, fileName)

            if (fileSizeMatch) {
                const fileSize = parseFloat(fileSizeMatch[1]);
                if (fileSize < 100) {
                    await downloadFile(fileUrl, filePath)
                    console.log('Image downloaded successfully:\t' + fileName);
                } else {
                    console.log(`Oversize file:\t${fileName};size:${fileSizeMatch}`);
                }
            }
            console.log(`下载进度: ${index}/${jsonworks.length}; ${fileName}`)
        } catch (err) {
            console.log("download image failed:" + err)
        }
    }
}

async function crawlerWikimediaFileInfoFromPageIDs(pageIdsFile: string): Promise<any> {
    const wikiPageUrl = 'https://commons.wikimedia.org/w/index.php?curid='
    const file = path.join(fileHomePath, pageIdsFile)
    const wikiPages = fs.readFileSync(file, 'utf-8').split('\n')

    const artworks: any = []
    for (let index = 0; index < wikiPages.length; index++) {

        const page = JSON.parse(wikiPages[index]);
        const info = await scrapeMeidaWikiFileInfo(wikiPageUrl + page.pageid);
        info['file_name'] = page.title.split(':')[1]
        artworks.push(info)
        new Promise(resolve => setTimeout(resolve, 10))

        console.log(`网页抓取进度：${index}/${wikiPages.length}; ${JSON.stringify(page)}`)
    }
    return artworks
}


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

//通过API获取wikimedia中Category的所有items
//Category示例：https://commons.wikimedia.org/wiki/Category:Files_from_Google_Arts_%26_Culture
//Api doc: https://www.mediawiki.org/wiki/API:Categorymembers
//通过continueToken自动获取下一页，default pagesize is 200
//保存category列表中的pageid到文件
//@param category，比如包含'Category:'前缀
async function fetchWikimediaCategory(category: string, continueFrom?: string): Promise<void> {
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
            await fetchWikimediaCategory(category, continueToken);
        }
    } catch (error) {
        console.error('Error fetching category images:', error);
    }
}

//wikimedia 文件详情页
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


//抓取并解析wikimeda的文件页面
//示例：https://commons.wikimedia.org/wiki/File:Vincent_van_Gogh_-_De_brug_van_Langlois_-_Google_Art_Project.jpg
export async function scrapeMeidaWikiFileInfo(wikimediaFilePageUrl: string): Promise<any> {
    try {
        const response = await axiosAgented.get(wikimediaFilePageUrl);
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
        info['wikimedia_file_url'] = wikimediaFilePageUrl

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
