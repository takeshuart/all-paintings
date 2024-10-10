import { sleep } from "openai/core";
import { axiosAgented } from "../utils/https";
import * as cheerio from 'cheerio';
import path from "path";
import fs from 'fs';
import { readJsonSync, writeJsonSync } from "fs-extra";
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
 *  sheet 2表示这封信有两页纸，/b0701aV1962 中间多了一个字母a表示第一页纸所有照片（正反面）
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
const detailsFile = path.join(dataBasePath, './van gogh/vangoghmuseum-demo.json');

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
    fs.writeFileSync(catalogFile, JSON.stringify(objects), 'utf-8')
}

async function fetchArtWorks() {
    const catalogs = readJsonSync(catalogFile)
    const artworks: any[] = []
    for (let i = 0; i < catalogs.length; i++) {
        const title = catalogs[i].title
        const href = catalogs[i].href

        try {
            const pattern = /^Sheet [0-9] of a letter from/;
            const letterPrefix = pattern.test(title);
            if (title.startsWith('Letter from') || letterPrefix) {
                console.log(`skip letter: \t ${title}\t${href}`)
                continue
            }
            const artwork = await fetchDetailPage(vgmDomain + href)
            if (artwork) {
                artworks.push(artwork)
                console.log(`${i}/${catalogs.length} \t ${title}\t${href}`)
            }
        } catch (error) {
            console.error(`${href}`,error)
        }
        sleep(200)
    }
    writeJsonSync(detailsFile, artworks)
}
async function fetchDetailPage(url: string) {
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
fetchArtWorks();
