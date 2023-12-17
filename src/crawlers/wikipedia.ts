//wikipedia resful api : https://en.wikipedia.org/api/rest_v1/#/
//https://www.mediawiki.org/wiki/API:Main_page
//使用wikipedia的官方api获取数据，不用写负责的html解析，也不容易被封ip

import { axiosAgented } from "../utils/https.js";
import Datastore from 'nedb';
import * as cheerio from 'cheerio';
import * as fs from 'fs';
import * as path from 'path';

const db = new Datastore({ filename: './nedb.db', autoload: true });
const filePath = path.join(__dirname, '../../data/data.json');


export function saveToFile(artworks: ArtWork[]) {
    let jsonData = JSON.stringify(artworks, null, 0);
    fs.writeFile(filePath, jsonData, 'utf8', function (err) {
        if (err) {
            console.log("An error occured while writing JSON Object to File.");
            return console.log(err);
        }
        console.log("JSON file has been saved.");
    });
}

export function insertDB(artWork: ArtWork) {
    db.insert(artWork, (err, newDoc) => {
        if (err) {
            console.error('Error inserting document:', err);
            return;
        }
        console.log('Inserted', newDoc);
    });
}

function getColumn(row: any, index: number) {
    return row.find('td').eq(index);
}


export class ArtWork {
    artist: string
    title: string;
    isHighlight: boolean = false;
    imageDetailUrl: string | null;
    imageUrl: string | null;
    imageThumbnail: string = ''; //preview image
    // imageSmall: string = '';
    imageLarge: string = '';
    // imageBigLarge: string = '';
    imageOriginal: string = '';
    time: string
    year: string;
    location: string;
    museum: string;
    dimension: string;
    catNo: string;

    constructor(data: {
        time: string
        artist: string
        title: string;
        isHighlight: boolean ;
        imageDetailUrl: string | null;
        imageUrl: string | null;
        imageOriginal: string;
        year: string;
        location: string;
        museum: string;
        dimension: string;
        catNo: string;
    }) {
        this.time = data.time;
        this.artist = data.artist;
        this.title = data.title;
        this.isHighlight=data.isHighlight
        this.imageDetailUrl = data.imageDetailUrl;
        this.imageUrl = data.imageUrl;
        this.imageOriginal = data.imageOriginal;
        this.year = data.year;
        this.location = data.location;
        this.museum = data.museum || '';
        this.dimension = data.dimension;
        this.catNo = data.catNo;
    }
}
