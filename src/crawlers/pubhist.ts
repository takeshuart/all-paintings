import { sleep } from "openai/core";
import { axiosAgented } from "../utils/https"
import * as cheerio from 'cheerio';
import * as fs from 'fs';
import { dataBasePath } from "./wikipage";
import path from "path";

//pubhist是一个庞大的艺术数据库
const domain = 'https://www.pubhist.com'

crawler()

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
                const  title = $(card).find('.card-body').text().trim();
                if(!title){return}

                const match = title.match(/\d{4}$/);
                const year = match ? match[0] : "";
                artwork['title']= title.slice(0, -4); 
                artwork['year']= year

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