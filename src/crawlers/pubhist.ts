import { sleep } from "openai/core";
import { axiosAgented, downloadFile } from "../utils/https"
import * as cheerio from 'cheerio';
import * as fs from 'fs';
import { dataBasePath } from "./wikipage";
import path from "path";
import { readJsonSync } from "fs-extra";
import { json } from "stream/consumers";
import { stringify } from "querystring";

//pubhist是一个庞大的艺术数据库
const domain = 'https://www.pubhist.com'
const imageDir = 'D:\\Arts\\Van Gogh\\pubhist-com'
//vangogh作品列表页简介信息
const pubhistVgList = './van gogh/puhhist-van-gogh-allworks-brief.json'
const pubhistVangoghWorksDetails = './van gogh/puhhist-van-gogh-allworks-details.json'
const vgWorksBriefPath = path.join(dataBasePath, pubhistVgList)
const vgWorksDetailsPath = path.join(dataBasePath, pubhistVangoghWorksDetails)

// scrapeDetailPage('https://www.pubhist.com/w14640')
mergeVggalleryData()
//elt数据
function resolveMistakeInfo() {

    const ats = readJsonSync(vgWorksDetailsPath)
    let counter = 0
    for (const at of ats) {
        try {
            //修改文件的类型
            if (at.material.toLowerCase().includes('watercolour') && at.type === 'drawing') {

                const oldPath = path.join(imageDir, imageFileName(at.title, at.jhCode, at.fCode, 'drawing'));
                const newPath = path.join(imageDir, imageFileName(at.title, at.jhCode, at.fCode, 'watercolour'));
                fs.renameSync(oldPath, newPath);
                counter++;
                console.log(`Success rename! old:${oldPath},new:${newPath}`)

            }
        } catch (err) {
            console.log(`failed to rename file: ${at.jhCode}.`, err)
        }
    }
    console.log(`total:${counter}`)

}

//处理失败的页面
function resolveFails() {
    const ats = readJsonSync(vgWorksDetailsPath)
    const briefs = readJsonSync(vgWorksBriefPath)
    const successSet = new Set()
    const failedSet: any[] = []

    for (let i = 0; i < ats.length; i++) {
        successSet.add(ats[i].pubhistUrl)
    }

    for (let i = 0; i < briefs.length; i++) {
        if (!successSet.has(briefs[i].url)) {
            failedSet.push(briefs[i])
            console.log(JSON.stringify(briefs[i]))
        }
    }
    console.log(`failed size:${failedSet.length}`)
    fetchDetails(failedSet)
}


async function fetchDetails(workBriefs: any[]) {

    const allworks: any[] = []
    for (let i = 0; i < workBriefs.length; i++) {
        // if (i == 3) { break; }
        try {
            const brief = workBriefs[i]
            const url = domain + brief.url
            const artwork: any = await scrapeDetailPage(url);
            if (brief.imageSrc) (
                artwork['puhhistImageUrl'] = '/' + brief.imageSrc.replace('thumb', 'large')
            )
            artwork['title'] = brief.title;
            artwork['pubhistUrl'] = brief.url
            artwork['year'] = brief.year;
            artwork['period'] = brief.period;
            artwork['type'] = brief.type;
            await downloadImg(artwork)
            sleep(50)
            allworks.push(artwork)
            console.log(`processing: ${i}/${workBriefs.length}:\t` + JSON.stringify(artwork))
        } catch (err) {
            console.log(err)
        }
    }
    // fs.writeFileSync(vgWorksDetailsPath, JSON.stringify(allworks), 'utf-8')

}

async function downloadImg(artwork: any) {
    if (!artwork.puhhistImageUrl) { return; }
    const fileName = imageFileName(artwork.title, artwork.jhCode, artwork.fCode, artwork.type)
    const imgPath = path.join(imageDir, fileName)
    await downloadFile(domain + artwork.puhhistImageUrl, imgPath)

}


function imageFileName(title: string, jhCode: string, fCode: string, type: string) {
    jhCode = jhCode ? 'JH' + jhCode : 'JH0000';
    fCode = fCode ? 'F' + fCode : 'F000';
    return `${jhCode}_${fCode}-${title}-${type}.jpg`

}

async function scrapeDetailPage(url: string) {
    const $: any = await loadHtmlFromUrl(url);
    const artwork: any = {};
    const mainInfo = $('.panel-body');
    const dimensionsRegex = /(\d+(\.\d+)?) x (\d+(\.\d+)?) (?:cm|mm)/;
    const matches = mainInfo.html().match(dimensionsRegex);
    if (matches) {
        artwork['dimension'] = matches[0];
    }

    const dateCreated = mainInfo.find('span[itemprop="dateCreated"]').text().trim();
    const materialTag = mainInfo.find('span[itemprop="material"]')
    const material = materialTag.text().trim();
    let museumName = mainInfo.find('a[href^="/museum"]').text().trim();
    const museumUrl = mainInfo.find('a[href^="/museum"]').attr('href');
    if (!museumName) {
        //所有所有文本的最后一行内容
        const allInfos = mainInfo.text().trim().split('\n')
        museumName = allInfos[allInfos.length - 1]
    }

    artwork['year'] = dateCreated;
    artwork['material'] = material;
    artwork['museumName'] = museumName;
    artwork['museumURL'] = museumUrl;

    $('.card-body').each((_: number, card: any) => {
        const cardTitle = $(card).find('.card-title').text().trim();
        if (!cardTitle) { return; }

        if (cardTitle === 'Literature') {

            // 提取 F 编码和 JH 编码
            $(card).find('a[href^="/book"]').each((_: any, atag: any) => {
                const text = $(atag).text().trim();
                const nextSibling = atag.nextSibling;

                if (nextSibling && nextSibling.nodeType === 3) { // 文本节点
                    const code = nextSibling.nodeValue.trim();
                    if (text === 'F') {
                        artwork['fCode'] = code;
                    } else if (text === 'JH') {
                        artwork['jhCode'] = code;
                    }
                }
            });

            //相关文学列表
            const allinfo = $(card).text().trim();
            const arr = allinfo.split('Literature');
            if (arr.length > 2) {
                const list = arr[2].split('\n')
                if (list.length > 1) {
                    artwork['literatures'] = list.slice(1)
                }
            }

        } else if (cardTitle === 'External links') {
            const links: any[] = [];
            $(card).find('br').each((_: any, brTag: any) => {
                const firstATag = $(brTag).nextAll('a').first(); //只取第一个url
                if (firstATag.length > 0) {
                    const extLink: any = {};
                    extLink['url'] = $(firstATag).attr('href');
                    extLink['linkName'] = $(firstATag).text();
                    links.push(extLink);
                }
            });
            artwork['extLinks'] = links;

        } else if (cardTitle === 'Exhibitions') {
            const allinfo = $(card).text().trim();
            const arr = allinfo.split('\n').slice(1)
            artwork['exhibitions'] = arr

        } else if (cardTitle === 'Related works') {
            const relatedWorks: any[] = []
            $(card).find('center').each((_: any, e: any) => {
                const uri = $(e).find('a').attr('href');
                relatedWorks.push(uri)
            })
            artwork['relatedWorks'] = relatedWorks
        }
    })
    return artwork;
}

//抓取所有的艺术品列表，不包括详情
async function crawlerAllUrls() {
    const paintingUrl = '/person/62/vincent-van-gogh/works/paintings'
    const drawingUrl = '/person/62/vincent-van-gogh/works/drawings/period/paris'
    const pubhistVangoghWorks = './van gogh/puhhist-van-gogh-allworks-paris.json'
    const $: any = await loadHtmlFromUrl(domain + drawingUrl)

    //nav tab
    let allworks: any[] = []
    //不包括当前页 需要单独处理
    const navTabs = $('.col-md-12>a');
    for (const nav of navTabs) {
        const period = $(nav).text()
        const periodUrl = $(nav).attr('href')
        console.log(periodUrl)

        const artworks = await resolveCard(periodUrl, period);
        allworks = allworks.concat(artworks)
        console.log(JSON.stringify(artworks))
        await sleep(50)
    }

    console.log(`Finished! total:${allworks.length}`)
    const file = path.join(dataBasePath, pubhistVangoghWorks);
    fs.writeFileSync(file, JSON.stringify(allworks), 'utf-8')
}

async function resolveCard(periodUrl: string, period: string) {

    const artworks: any[] = []
    try {
        const $: any = await loadHtmlFromUrl(domain + periodUrl);
        $('.card-deck').each((_: any, cardDeck: any) => {
            $(cardDeck).find('.card').each((_: any, card: any) => {
                const artwork: any = {}
                const title = $(card).find('.card-body').text().trim();
                if (!title) { return }

                const match = title.match(/\d{4}$/);
                const year = match ? match[0] : "";
                artwork['title'] = title.slice(0, -4);
                artwork['year'] = year

                artwork['url'] = $(card).find('center a').attr('href');
                artwork['imageSrc'] = $(card).find('center a img').attr('src');
                artwork['period'] = period
                artwork['type'] = 'painting'

                artworks.push(artwork)
            })

        });

    } catch (err) {
        console.log(err)
        throw err
    }
    return artworks
}

async function loadHtmlFromUrl(url: string): Promise<cheerio.Root> {
    try {
        const response = axiosAgented(url)
        const html = (await response).data;
        const $ = cheerio.load(html);
        return $
    } catch (error) {
        console.log(error)
        throw error;
    }
}


//van gogh/pubhist-vggallery-merge.json为最近最全的文件
function mergeVggalleryData() {
    const vggalleryData = readJsonSync(path.join(dataBasePath, './van gogh/all-vangogh-zh.json'))
    const allVgWorks = readJsonSync(path.join(dataBasePath, './van gogh/pubhist-vggallery-merge.json'))
    const jhCodeMap = new Map()
    for (const item of allVgWorks) {
        jhCodeMap.set(item.jhCode, item)
    }
    for(let i=1;i<vggalleryData.length;i++){
        const at=vggalleryData[i]
        const zhTitle=at[2]
        allVgWorks[i-1]['title_zh']=zhTitle

        if(allVgWorks[i-1].jhCode!=String(at[8])){
            console.log(`mistake artwork:${at[1]}, ${at[8]}`)
        }
    }
    const p = path.join(dataBasePath, './van gogh/pubhist-vggallery-merge.json')
    fs.writeFileSync(p, JSON.stringify(allVgWorks))
}