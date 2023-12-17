import axios from 'axios';
import fs from 'fs';
import * as path from 'path';
import { axiosAgented } from '../utils/https';
import { ArtWork } from './wikipedia';

// Met open access https://metmuseum.github.io/
const metApiDomain = 'https://collectionapi.metmuseum.org'
const uropeanPaintingObjectsUrl = '/public/collection/v1/objects?departmentIds=11'
const filePath = path.join(__dirname, '../../data/met.json');
const artWorkFile = path.join(__dirname, '../../data/data.json');

async function getObjectIDs() {
    const response = await axiosAgented.get(metApiDomain + uropeanPaintingObjectsUrl);
    return response.data.objectIDs;
}

async function getObjectDetails(objectID: number) {
    const url = metApiDomain + `/public/collection/v1/objects/${objectID}`;
    const response = await axios.get(url);
    return response.data;
}

async function fentchArtWorksFromMet() {
    try {
        const objectIDs = await getObjectIDs();
        const objectDetails = [];

        const total = objectIDs.length;  // Assuming 200 objects
        let count = 0;

        for (const id of objectIDs) {

            const details = await getObjectDetails(id);
            console.log(`Progress: ${count}/${total}:\t${id}:\t${JSON.stringify(details)}`);
            objectDetails.push(details);
            count++;
            await new Promise(resolve => setTimeout(resolve, 5)); // 5ms delay
        }

        fs.writeFileSync(filePath, JSON.stringify(objectDetails, null, 2));
    } catch (error) {
        console.error('Error:', error);
    }
}

// parse met object
async function processFile() {
    try {
        const datajson = fs.readFileSync(filePath, 'utf8')
        const data: MetArtwork[] = JSON.parse(datajson);

        const artworks: ArtWork[] = [];
        data.map(item => {
            const regex = /\(([^)]+)\)/;  //"77 × 53 1/4 in. (195.6 × 135.3 cm)"
            const match = item.dimensions.match(regex);
            console.log(match ? match[1] : match)
            const artWork = {
                artist: item.artistDisplayName.replace(/\([^)]*\)/g, '').trim(),
                title: item.title,
                isHighlight: item.isHighlight,
                imageDetailUrl: '',
                imageUrl: item.primaryImageSmall,
                imageOriginal: item.primaryImage,
                time: '',
                year: item.objectEndDate,
                location: item.repository,
                museum: '',
                dimension: match ? match[1] : '',
                catNo: String(item.objectID),
            };
            if (!artWork.artist) {
                console.log(`invalid art work: ${artWork}`);
                return;
            }
            artworks.push(new ArtWork(artWork))
        })

        fs.writeFileSync(artWorkFile, JSON.stringify(artworks, null, 2));
        console.log('文件处理完成');
    } catch (error) {
        console.error('处理文件时出错:', error);
    }
}

processFile();



class MetArtwork {
    objectID: number = 0;
    isHighlight: boolean = false; //重点藏品
    accessionNumber: string = '';
    accessionYear: string = '';
    isPublicDomain: boolean = false;
    primaryImage: string = '';
    primaryImageSmall: string = '';
    constituents: Constituent[] = [];
    department: string = '';
    objectName: string = '';
    title: string = '';
    culture: string = '';
    period: string = '';
    dynasty: string = '';
    reign: string = '';
    portfolio: string = '';
    artistRole: string = '';
    artistPrefix: string = '';
    artistDisplayName: string = '';
    artistDisplayBio: string = '';
    artistSuffix: string = '';
    artistAlphaSort: string = '';
    artistNationality: string = '';
    artistBeginDate: string = '';
    artistEndDate: string = '';
    artistGender: string = '';
    artistWikidata_URL: string = '';
    artistULAN_URL: string = '';
    objectDate: string = '';
    objectBeginDate: number = 0;
    objectEndDate: string = '';
    medium: string = '';
    dimensions: string = '';
    measurements: Measurement[] = [];
    creditLine: string = '';
    geographyType: string = '';
    city: string = '';
    state: string = '';
    county: string = '';
    country: string = '';
    region: string = '';
    subregion: string = '';
    locale: string = '';
    locus: string = '';
    excavation: string = '';
    river: string = '';
    classification: string = '';
    rightsAndReproduction: string = '';
    linkResource: string = '';
    metadataDate: string = '';
    repository: string = '';
    objectURL: string = '';
    tags: Tag[] = [];
    objectWikidata_URL: string = '';
    isTimelineWork: boolean = false;
    GalleryNumber: string = '';
}

class Constituent {
    constituentID: number = 0;
    role: string = ''; //artist
    name: string = ''; //artist name
    constituentULAN_URL: string = '';
    constituentWikidata_URL: string = '';
    gender: string = '';
}

class Measurement {
    elementName: string = '';
    elementDescription: string | null = null;
    elementMeasurements: {
        Height: number;
        Width: number;
    } = { Height: 0, Width: 0 };
}

class Tag {
    term: string = '';
    AAT_URL: string = '';
    Wikidata_URL: string = '';
}
