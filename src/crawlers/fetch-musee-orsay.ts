import { sleep } from "openai/core";
import { axiosAgented, downloadFile } from "../utils/https"
import * as cheerio from 'cheerio';
import path from "path";
import fs from 'fs';
import { readJsonSync, writeJSONSync, writeJsonSync } from "fs-extra";

const dataBasePath = path.join(__dirname, '../../data/')
const catalogFile = path.join(dataBasePath, './van gogh/musee-orsay-catalog-VincentVanGogh.json');
const detailsFile = path.join(dataBasePath, './van gogh/musee-orsay-details-VincentVanGogh.json');
const domain = 'https://www.musee-orsay.fr'

async function fetchCatalogByPage() {
    const url = domain + '/en/collections/search?search_type=advanced_search&union_artist_names=35879&page='
    const headers = {
        'Referer': 'https://vincentcn.com',
        'Referrer-Policy': 'strict-origin-when-cross-origin'
    }
    const artworks: any[] = []

    for (let index = 0; index < 3; index++) {
        try {

            const resp = await axiosAgented(url + index, { 'headers': headers })
            const data = resp.data
            const $ = cheerio.load(data)
            let artwork: any = {}
            const items = $('article').toArray();
            for (let i = 0; i < items.length; i++) {
                const href = $(items[i]).find('a').attr('href')
                const imgSrc = $(items[i]).find('img').attr('src')
                const title = $(items[i]).find('h2').text().trim()
                artworks.push(artwork = {
                    'href': href,
                    'imgSrc': imgSrc,
                    'title': title
                })
                console.log(`${i}/${items.length}\t${artwork.title}\t${artwork.href}`)
                sleep(200)
            }
        } catch (error) {
            console.log(error)
        }
    }
    writeJSONSync(catalogFile, artworks, 'utf-8')

}

async function crawlerArtWorks() {
    const catalogs = readJsonSync(catalogFile)
    const artworks: any[] = []
    for (let i = 0; i < catalogs.length; i++) {
        const title = catalogs[i].title
        let href = domain + catalogs[i].href

        try {
            await scrapeDetails(href)
            const artwork = null
            if (artwork) {
                artworks.push(artwork)
                console.log(`${i}/${catalogs.length} \t ${title}\t${href}`)
            }
        } catch (error) {
            console.error(`${href}`, error)
        }
        sleep(200)
    }
    // writeJsonSync(detailsFile, artworks)
}

async function scrapeDetails(url: string) {
    const resp = await axiosAgented(url)
    const $ = cheerio.load(resp.data)
    const imgLargeSrc = $('#dialog-artwork .image-container img').attr('src')
    console.log(imgLargeSrc)

}

crawlerArtWorks()