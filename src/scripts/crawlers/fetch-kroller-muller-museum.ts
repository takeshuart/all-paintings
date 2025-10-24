

import * as cheerio from 'cheerio';
import { axiosAgented, downloadFile } from "../../utils/https.js"
import path from 'path';
import { readJsonSync, writeJSONSync, writeJsonSync } from "fs-extra";
import { sleep } from 'openai/core';
import { processInBatches } from '@utils/process-in-batches.js'
import { DATA_FILES_ROOT } from "@utils/files.js"


const catalogFile = path.join(DATA_FILES_ROOT, './van gogh/kroller-muller-museum-catalog.json');
const vgwwFile = path.join(DATA_FILES_ROOT, './van gogh/vgww-artworks.json');

async function fetchCatalog() {
    const kmDomain = 'https://krollermuller.nl'
    const url = kmDomain + '/en/search-the-collection/keywords=%22Vincent+van+Gogh%22/page='
    let artworks: any[] = []
    for (let index = 0; index < 10; index++) {
        try {
            const resp = await axiosAgented(url + index)
            const data = resp.data
            const $ = cheerio.load(data)
            const itemUrls = $('div.searchresult__item').toArray().map((item) => kmDomain + $(item).find('a').attr('href'))
            const resultsPromise = await processInBatches(10, itemUrls, fetchDetail);
            artworks.push(resultsPromise);
        } catch (error) {
            console.log(error)
        }
    }

    writeJSONSync(catalogFile, artworks, 'utf-8')
}


async function fetchDetail(url: string) {
    try {

        const resp = await axiosAgented(url)
        const data = resp.data
        const $ = cheerio.load(data)
        let obj: any = {}
        const smallImg = $('div.collection-item__viewer img').attr('src')
        const largeImg = $('div.collection-item__viewer source').attr('srcset')
        if (!smallImg) { return }

        const title = $('h1.collection-meta__original-title').text().trim()
        const subtitle = $('h2.collection-meta__sub-title').text().trim()
        const intro = $('div.main-content').html()
        obj['title'] = title
        obj['subtitle'] = subtitle
        obj['smallImg'] = smallImg
        obj['largeImg'] = largeImg
        obj['intro'] = intro ? intro : ''

        $('div.collection-meta__list p').each((i, item) => {
            const text = $(item).text().trim()
            if (i == 0) {
                obj['material'] = text
            } else if (i == 1) {
                obj['dimensions'] = text
            } else if (i == 2) {
                obj['inventory_id'] = text
            }
        })
        console.log(`${obj.title}\t${obj.inventory_id}`)
        return obj
    } catch (error) {
        console.error(error)
    }
}


/**
 *  kröller-Müller Museum的详情页没有提供JH\F编码，
 *  但是vangoghworldwide同时提供了该博物馆的KM编码和JH编码，可以以此做映射。
 */
const output = 'D:\\Arts\\Van Gogh\\all-Kröller-Müller Museum'
const kmCodeMap = loadVgwwData()

async function downloadImageInBatches() {
    const artworks = readJsonSync(catalogFile)
    processInBatches(20, artworks, downloadImage)
}

async function downloadImage(item: any) {
    try {
        let imgSrc = item.largeImg ? item.largeImg : item.smallImg
        if (!imgSrc) {
            console.log(`missing imgage:${JSON.stringify(item)}`)
            return
        }
        const subtitle = item.subtitle.replace(':', ',')
        const inventoryId = item.inventory_id.replace(' ', '').replace('.', '')

        if (kmCodeMap.has(inventoryId)) {
            const vgww = kmCodeMap.get(inventoryId);
            let jhCode = vgww.jhCode
            let fCode = vgww.fCode
            const fileName = [jhCode, fCode, subtitle, vgww.dateDisplay, vgww.placeOfOrigin, 'from&Collection Kröller-Müller Museum' + '-' + inventoryId].join('_-_')
            const fullPath = path.join(output, fileName + '.jpg')
            console.log(fullPath)
            await downloadFile(imgSrc, fullPath)
        } else {
            console.log(`missing vgww:\t ${subtitle}`)
        }
    } catch (error) {
        console.log(`${item.title}`, error)
    }

}



export function loadVgwwData() {
    const objarr = readJsonSync(vgwwFile)
    const inventoryIdMap = new Map<string, any>()
    for (const item of objarr) {
        if (item.owner == 'Kröller-Müller Museum') {
            const kmCode = item.accessionNo.replace(' ', '').replace('.', '')
            if (!inventoryIdMap.has(kmCode)) {
                inventoryIdMap.set(kmCode, item)
            }
        }
    }
    return inventoryIdMap
}

// fetchCatalog()
// downloadImageInBatches()