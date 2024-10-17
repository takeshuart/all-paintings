import { sleep } from "openai/core";
import { axiosAgented, downloadFile } from "../utils/https";
import * as cheerio from 'cheerio';
import path from "path";
import { ensureDir, readJsonSync, writeFileSync, writeJsonSync } from "fs-extra";
import sharp from "sharp";
import { processInBatches } from "../utils/process-in-batches";
/**
 *  --------------------------
 *  /collection/b0701V1962      Letter from Vincent van Gogh to Willemien van Gogh
 *  /collection/b0701aV1962	    Sheet 1 of a letter from Vincent van Gogh to Willemien van Gogh
 *  /collection/b0701aV1962r	Sheet 1 of a letter from Vincent van Gogh to Willemien van Gogh (recto)
 *  /collection/b0701aV1962v	Sheet 1 of a letter from Vincent van Gogh to Willemien van Gogh (verso)
 *  /collection/b0701bV1962	    Sheet 2 of letter from Vincent van Gogh to Willemien van Gogh
 *  /collection/b0701bV1962r	Sheet 2 of letter from Vincent van Gogh to Willemien van Gogh (recto)
 *  /collection/b0701bV1962v	Sheet 2 of letter from Vincent van Gogh to Willemien van Gogh (verso)
 *  以上是一封信的所有webpage，/b0701V1962 该page是一个合集，包含这封信的所有照片。
 *  sheet {n} of n表示这封信的第n张纸，/b0701aV1962 中间多了一个字母a表示第一页纸所有照片（正反面）
 *  后缀有r的page是纸张正面(recto)照片，v是纸张反面(verso)照片
 *  如果想获取所有照片，只访问//b0701V1962 页面即可，img url的`s280`后缀表示尺寸，可以自行修改
 *  只有一张纸的信url中之后r\v后缀，没有a\b标识第几页纸
 *  如果带有速写插图的信，title中会有`with sketch of`的标识
 *  ----------------------------
 *  object Number:/b0701V1962, 猜测s前缀是painting,d前缀是drawing,b前缀是letter
 *  信件的页面样式有所不同，url也不同: /en/letters/collection/b0701aV1962r,去掉/letters会自动跳转回去。
 * 
 */
//Vincent Van Gogh 共 1631条记录，无图片或集合类型有一百多个
const dataBasePath = path.join(__dirname, '../../data/')
const catalogFile = path.join(dataBasePath, './van gogh/vangoghmuseum-catalog-VincentVanGogh.json');
const detailsFile = path.join(dataBasePath, './van gogh/vangoghmuseum-details-VincentVanGogh.json');
const lettersPhotoFile = path.join(dataBasePath, './van gogh/vangoghmuseum-letters-VincentVanGogh.json');

const vgmDomain = 'https://www.vangoghmuseum.nl'

//分页查询，获取所有item page url
async function fetchData() {
    const params: any = {
        q: '',
        Artist: 'Vincent van Gogh',
        Type: '',//painting
        Place: '',
        from: 0
    };
    const pageSize = 24//default and only

    let hasMoreResults = true;
    let objects: any[] = []
    while (hasMoreResults) {
        try {
            const url = vgmDomain + '/en/collection/search'
            const response = await axiosAgented.get(url, { params });
            const data = response.data;
            const fullURL = `${url}?${new URLSearchParams(params).toString()}`;
            const $ = cheerio.load(data.resultsHtml);

            $('a.collection-art-object-wrapper').each((index, element) => {
                const href = $(element).attr('href');
                const title = $(element).attr('title');
                if (!title) {
                    console.log(`missing tittle,href: ${href}`)
                    return
                }
                //过滤集合页面
                let setOrNoImg = false
                if ($(element).find('div.is-part-of-set').length > 0 || $(element).find('div.image-fallback').length > 0) {
                    console.log(`is-set or no-image. ${href}\t${title}`)
                    setOrNoImg = true
                }
                let obj: any = {
                    href: href,
                    title: title,
                }
                if (setOrNoImg) {
                    obj['setOrImg'] = setOrNoImg
                }
                objects.push(obj)
            });
            console.log(`size:${objects.length}, fullurl:${fullURL}`);

            hasMoreResults = data.hasMoreResults;
            params.from += pageSize;
            sleep(200)
        } catch (error) {
            console.error(`Error fetching data:`, error);
            hasMoreResults = false;
        }
    }
    writeJsonSync(catalogFile, JSON.stringify(objects), 'utf-8')
}

async function fetchArtWorks() {
    const catalogs = readJsonSync(catalogFile)
    const artworks: any[] = []
    for (let i = 0; i < catalogs.length; i++) {
        const title = catalogs[i].title
        let href = catalogs[i].href

        try {
            const pattern = /^Sheet [0-9] of/;
            const letterPrefix = pattern.test(title);
            //有两个Letter to
            if (!title.startsWith('Letter from') && !letterPrefix) {
                // console.log(`skip letter: \t ${title}\t${href}`)
                continue
            }
            //redirect url
            href = href.replace('/en/', '/en/letters/')
            const artwork = await fetchLetterPage(vgmDomain + href)
            if (artwork) {
                artworks.push(artwork)
                console.log(`${i}/${catalogs.length} \t ${title}\t${href}`)
            }
        } catch (error) {
            console.error(`${href}`, error)
        }
        sleep(200)
    }
    writeJsonSync(lettersPhotoFile, artworks)
}

//信件页面的布局与作品页面不同
//信件的url /en/collection/ba0008,会自动跳转到/en/letters/collection/ba0008 所以请求速度比较慢，
//可以在编码中提前转换url
async function fetchLetterPage(url: string) {
    try {
        const resp = await axiosAgented.get(url)
        const data = resp.data
        const $ = cheerio.load(data)
        const imgSrc = $('div.download-buttons-container a').attr('href')
        if (!imgSrc) { return }

        const letterInfo = $('article .text-bold').text().trim()
        const title = $('article h1').text().trim()

        let obj: any = {};
        obj['letterInfo'] = letterInfo
        obj['imgSrc'] = imgSrc
        obj['title'] = title
        let currentField = '';

        $('.list-table dt').each((i, dt) => {
            currentField = $(dt).text().trim();
            const dd = $(dt).next('dd');
            if (dd.length) {
                const value = dd.text().trim().replace(/\s+/g, ' ');
                obj[currentField] = value ? value : '';
            }
        });
        return obj
    } catch (error) {
        console.error(`Error fetching detail:`, error);
    }
}

async function fetchArtworkDetailPage(url: string) {
    try {
        const resp = await axiosAgented.get(url)
        const data = resp.data
        const $ = cheerio.load(data)
        const img = $('div.art-object-header-image-wrapper img');
        const imgset = img.attr('data-srcset');
        let artwork: any = {}
        let imgSrc = ''
        if (imgset) {
            const sizes = imgset.split(',');
            //last image url
            const maxSizeUrl = sizes[sizes.length - 2].trim().split(' ')[0]
            const fullUrl = maxSizeUrl + ',/0/default.jpg'
            imgSrc = fullUrl
        }
        const title = $('.art-object-page-content-title').text().trim()
        const creatorInfos = $('.art-object-page-content-creator-info').text().trim()
        const details = $('.art-object-page-content-details').text().trim()
        const intro = $('.art-object-page-content-section .markdown p').html()
        artwork = {
            title: title,
            createorInfo: creatorInfos,
            imgSrc: imgSrc,
            details: details,
            intro: intro
        }
        $('.definition-list-item').each((index, element) => {
            const label = $(element).find('.definition-list-item-label').text().trim();
            const value = $(element).find('.definition-list-item-value').text().trim();
            artwork[label] = value
        });
        return artwork
    } catch (error) {
        console.error(`Error fetching detail:`, error);
    }

}
async function downloadImage() {
    const output = 'D:\\Arts\\Van Gogh\\all-Van Gogh Museum\\letters'
    const artworks = readJsonSync(detailsFile)
    for (let i = 0; i < artworks.length; i++) {
        const item = artworks[i];
        if (!item.title || !item.imgSrc) { continue }
        const url = item.imgSrc
        const title = item.title.replace(':', ',')
        const creatorinfo = item.createorInfo.replace('Vincent van Gogh (1853 - 1890), ', '').split(',').join('_-_');
        const fileName = [item['JH-number'], item['F-number'], title, creatorinfo, 'from&Collection Van Gogh Museum' + '-' + item['Object number']].join('_-_')
        const fullPath = path.join(output, fileName + '.jpg')
        console.log(fullPath)
        await downloadFile(url, fullPath)
    }
}

async function downloadLetterImage() {
    const output = 'D:\\Arts\\Van Gogh\\all-Van Gogh Museum\\letters'
    const artworks = readJsonSync(lettersPhotoFile)
    for (let i = 0; i < artworks.length; i++) {
        const item = artworks[i];
        if (!item.imgSrc) { continue }
        const url = vgmDomain + item.imgSrc
        const title = item.title?.replace(':', ',')
        const letterNo = item['Edition 2009']?.replace('Letter number: ', '')
        const creatorinfo = item.letterInfo.replace('Vincent van Gogh (1853 - 1890), ', '').split(',').join('_-_');
        const fileName = ['Letter No.' + letterNo, item['JH-number'], title, creatorinfo, 'from&Collection Van Gogh Museum' + '-' + item['Object number']].join('_-_')
        const fullPath = path.join(output, fileName + '.jpg')
        console.log(fullPath)
        await downloadFile(url, fullPath)
    }
}

//-----download VGM tile image
interface TileConfig {
    width: number;
    height: number;
    tileSize: number;
    version: string;
}
async function downloadTileConfig(url: string): Promise<TileConfig> {
    const response = await axiosAgented.get(url);
    return response.data;
}


function generateTileUrls(baseUrl: string, config: TileConfig): string[] {
    const { width, height, tileSize } = config;
    const urls: string[] = [];

    const xSteps = Math.ceil(width / tileSize);
    const ySteps = Math.ceil(height / tileSize);

    for (let x = 0; x < xSteps; x++) {
        for (let y = 0; y < ySteps; y++) {
            const xPos = x * tileSize;
            const yPos = y * tileSize;
            const tileWidth = Math.min(tileSize, width - xPos);
            const tileHeight = Math.min(tileSize, height - yPos);

            const tileUrl = `${baseUrl}/${xPos},${yPos},${tileWidth},${tileHeight}/${tileWidth}/0/default.png`;
            urls.push(tileUrl);
        }
    }

    return urls;
}

/**
 * 
 * @param url /x,y,width,height/ 
 * https://iiif.micr.io/pMtwg/4096,4096,1024,1024/1024/0/default.png 
 * @param outputDir 
 * @returns 
 */
async function downloadTile(url: string, outputDir: string): Promise<string> {
    const match = url.match(/\/(\d+),(\d+),/);
    if (!match) throw new Error(`Invalid URL format: ${url}`);

    const xPos = match[1];
    const yPos = match[2];

    // 文件名格式为 tile_x{xPos}_y{yPos}.png
    const filePath = path.join(outputDir, `tile_x${xPos}_y${yPos}.png`);

    const response = await axiosAgented({ url, responseType: 'arraybuffer' });
    writeFileSync(filePath, response.data);
    console.log(`Downloaded: ${filePath}`);

    return filePath;
}

async function downloadTiles(urls: string[], outputDir: string, concurrentLimit: number): Promise<string[]> {
    return processInBatches(concurrentLimit, urls, (url) => downloadTile(url, outputDir));
}
// 从文件名中提取 xPos 和 yPos
function extractTilePositionFromFilename(filename: string): { xPos: number; yPos: number } {
    const match = filename.match(/tile_x(\d+)_y(\d+)\.png/);
    if (!match) throw new Error(`Invalid filename format: ${filename}`);

    const xPos = parseInt(match[1], 10);
    const yPos = parseInt(match[2], 10);

    return { xPos, yPos };
}

// 拼接 tiles 成为完整图片
async function stitchTiles(filePaths: string[], config: TileConfig, outputFile: string) {
    const { width, height } = config;
    const sharpComposite: sharp.OverlayOptions[] = [];

    // 根据文件名中的偏移量拼接 tiles
    for (const filePath of filePaths) {
        const { xPos, yPos } = extractTilePositionFromFilename(filePath);
        sharpComposite.push({
            input: filePath,
            top: yPos,
            left: xPos,
        });
    }

    // 创建并拼接最终的图像
    await sharp({
        create: {
            width: width,
            height: height,
            channels: 3,
            background: { r: 255, g: 255, b: 255 },
        },
    })
        .composite(sharpComposite)
        .toFile(outputFile);

    console.log(`Stitched image saved to: ${outputFile}`);
}


async function downloadTilesImage(iiifInfoUrl:string,tilesDir:string,outputFile:string) {
    const config = await downloadTileConfig(iiifInfoUrl);
    console.log('Tile config downloaded:', config);

    const tileUrl='https://iiif.micr.io/TQzrj/'
    const artworkID=iiifInfoUrl.split('/')[3]
    const tileUrls = generateTileUrls(tileUrl+artworkID, config);
    console.log('Generated tile URLs:', tileUrls);

    const downloadedTiles = await downloadTiles(tileUrls, tilesDir, 5);
    console.log('All tiles downloaded.');

    await stitchTiles(downloadedTiles, config, outputFile);
}
// 主程序
async function main() {
    const iiifInfoUrl = 'https://i.micr.io/TQzrj/info.json';
    const outputDir = 'c:\\Users\\Administrator\\Downloads\\tiles_temp'
    const outputFile = path.join(outputDir, 'stitched_image.png');

    await downloadTilesImage(iiifInfoUrl,outputDir,outputFile);


}

main().catch(err => console.error(err));

