

import * as cheerio from 'cheerio';
import { axiosAgented, downloadFile } from "../utils/https"
import path from 'path';
import { readJsonSync, writeJSONSync, writeJsonSync } from "fs-extra";
import { sleep } from 'openai/core';


const dataBasePath = path.join(__dirname, '../../data/')
const catalogFile = path.join(dataBasePath, './van gogh/kroller-muller-museum-catalog.json');
const vgwwFile = path.join(dataBasePath, './van gogh/vgww-artworks.json');

async function fetchCatalog() {
    const kmDomain = 'https://krollermuller.nl'
    const url = kmDomain + '/en/search-the-collection/keywords=%22Vincent+van+Gogh%22/page='
    const artworks: any[] = []

    for (let index = 0; index < 10; index++) {
        try {
            const resp = await axiosAgented(url + index)
            const data = resp.data
            const $ = cheerio.load(data)
            const items = $('div.searchresult__item').toArray();
            for (let i = 0; i < items.length; i++) {
                const href = $(items[i]).find('a').attr('href')
                if (!href) { return }
                const artwork = await fetchDetail(kmDomain + href)
                artworks.push(artwork)
                console.log(`${i}/${items.length}\t${artwork.title}\t${artwork.inventory_id}`)
                sleep(200)
            }
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
        const imgSrc = $('div.collection-item__viewer img').attr('src')
        if (!imgSrc) { return }

        const title = $('h1.collection-meta__original-title').text().trim()
        const subtitle = $('h2.collection-meta__sub-title').text().trim()
        const intro = $('div.main-content').html()
        obj['title'] = title
        obj['subtitle'] = subtitle
        obj['imgSrc'] = imgSrc
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
        return obj
    } catch (error) {
        console.error(error)
    }
}


/**
 *  kröller-Müller Museum的详情页没有提供JH\F编码，
 *  但是vangoghworldwide同时提供了该博物馆的KM编码和JH编码，可以以此做映射。
 */
async function downloadImage() {
    const output = 'D:\\Arts\\Van Gogh\\all-Kröller-Müller Museum'
    const artworks = readJsonSync(catalogFile)
    const kmCodeMap = loadVgwwData()
    for (let i = 0; i < artworks.length; i++) {
        const item = artworks[i];
        let imgSrc = item.imgSrc
        if (!imgSrc) { continue }
        //convert large image url
        if (!imgSrc.includes('/cache/resolve')) {
            imgSrc = imgSrc.replace('/cache', '/cache/resolve').replace('collection_item_detail_small', 'collection_item_detail_large')
        }
        const subtitle = item.subtitle.replace(':', ',')
        try {
            const inventoryId = item.inventory_id.replace(' ', '').replace('.', '')
            if (kmCodeMap.has(inventoryId)) {
                const vgww = kmCodeMap.get(inventoryId);
                let jhCode = vgww.jhCode
                let fCode = vgww.fCode
                if (jhCode) {
                    jhCode = 'JH' + jhCode.substring(2).toString().padStart(4, '0');
                }
                if (fCode) {
                    fCode = 'F' + fCode.substring(2).toString().padStart(4, '0');
                }
                const fileName = [jhCode, fCode, subtitle, vgww.dateDisplay, vgww.placeOfOrigin, 'from&Collection Kröller-Müller Museum' + '-' + inventoryId].join('_-_')
                const fullPath = path.join(output, fileName + '.jpg')
                console.log(fullPath)
                await downloadFile(imgSrc, fullPath)
                sleep(100)
            } else {
                console.log(`missing vgww:\t ${subtitle}`)
            }
        } catch (error) {
            console.log(`${subtitle}`, error)
        }

    }
}


function loadVgwwData() {
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

// downloadImage()