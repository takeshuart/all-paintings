import fs from 'fs';
import * as path from 'path';
import { axiosAgented } from '../utils/https';
import { ArticArtWork, ArticArtWorkInfo } from './artic-model';
import { ArtWork } from './artwork';
import { saveArtWorksToJSON } from './wikipage';
import { json } from 'stream/consumers';
import { fineArtsIds } from './artic-config';
import { insert } from '../db/sqllite-utils';

//使用wikidata list信息补充：https://www.wikidata.org/wiki/Wikidata:WikiProject_sum_of_all_paintings/Collection/Art_Institute_of_Chicago

const artworkInfoUrl = `https://api.artic.edu/api/v1/artworks/`
const fileHomePath = path.join(__dirname, '../../data/');
const iiif_url = 'https://www.artic.edu/iiif/2'
const sizeSmall = '843'
const sizeLarge = '1686' //double

// 定义接口以匹配返回的 JSON 数据结构
interface ArtworkResponse {
    data: any; // 根据需要修改以匹配详细的数据结构
    info: any;
    config: any;
}

const topFile = path.join(fileHomePath, 'artic-top300-ids.txt');
const top300File = path.join(fileHomePath, 'artic-top300-details.txt');

async function fetchArtwork(id: string): Promise<ArtWork> {

    try {
        const url = artworkInfoUrl + `${id}`
        const response = await axiosAgented.get<ArtworkResponse>(artworkInfoUrl + `${id}`);
        const awinfo: ArticArtWorkInfo = response.data;
        const aw = awinfo.data
        const artwork = createArtWork(aw)
        const jsonStr = JSON.stringify(aw) + '\n';
        console.log(awinfo)
        const topFile = top300File;
        // fs.appendFileSync(topFile, jsonStr);
        return artwork
    } catch (error) {
        console.error(`Error fetching artwork with ID ${id}:`, error);
    }
    return new ArtWork()
}


function createArtWork(aw: ArticArtWork) {
    return new ArtWork({
        title: aw.title,
        artist: aw.artist_title,
        isHighlight: aw.is_boosted,
        artworkType:aw.artwork_type_title,
        description:aw.description,
        shortDesc: aw.short_description,
        depicts: aw.subject_titles.join(),
        artMovement: aw.style_titles.join(),
        date: aw.date_display,
        placeOfOrigin: aw.place_of_origin,
        museum: 'The Art Institute of Chicago',
        inventoryNumber: aw.main_reference_number,
        imageSmall: `${iiif_url}/${aw.image_id}/full/${sizeSmall},/0/default.jpg`,
        imageOriginal: `${iiif_url}/${aw.image_id}/full/${sizeLarge},/0/default.jpg`,
        dimension: aw.dimensions?.split("(")[0]
    });
}

async function processArtworkIds(file: string): Promise<void> {
    try {
        let index = 0;
        const ids = fs.readFileSync(file, 'utf-8').split('\n');
        const artworks: ArtWork[] = []
        for (const id of ids) {
            const artwork = await fetchArtwork(id);
            artworks.push(artwork)
            await new Promise(resolve => setTimeout(resolve, 50)); // 等待 50 毫秒
            index++;
            console.log(`${index}/${ids.length},ID: ${id}`)
            break
        }
        saveArtWorksToJSON(artworks)
    } catch (error) {
        console.error('Error processing artwork IDs:', error);
    }
}

// processArtworkIds(topFile);

function processArticData() {
    const articworks = fs.readFileSync(top300File, 'utf-8').split('\n')
    let arts: ArtWork[] = []

    articworks.forEach(item => {
        const artic: ArticArtWork = JSON.parse(item)
        if (!fineArtsIds.has(artic.artwork_type_id)) {
             return; 
        }
        const aw = createArtWork(artic)
        console.log(JSON.stringify(aw))
        arts.push(aw)
        insert(aw)
    })

    saveArtWorksToJSON(arts)
    console.log(arts.length)
}


processArticData()
