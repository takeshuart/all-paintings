import * as cheerio from 'cheerio';
import { axiosAgented } from "../utils/https.js";
import { ArtWork } from './wikipedia.js';
import * as fs from 'fs';
import * as path from 'path';
import { saveToFile } from './wikipedia.js';
import { WikiPage } from './wikipage.js';
const filePath = path.join(__dirname, '../../data/data.json');

const wikipediaDomain = 'https://en.wikipedia.org'
const artists = [
    // { 'englishName': 'Mary Cassatt', 'parseFunc': wikitableMaryCassatt, 'worklistWikiUrl': '/wiki/List_of_works_by_Mary_Cassatt' },
    // { 'englishName': 'Vermeer', 'parseFunc': wikitableVermeer, 'worklistWikiUrl': '/wiki/List_of_paintings_by_Johannes_Vermeer' },
    // { 'englishName': 'Van Gogh', 'parseFunc': wikitableVanGogh, 'worklistWikiUrl': '/wiki/List_of_works_by_Vincent_van_Gogh' },
    // { 'englishName': 'Pierre Renoir', 'parseFunc': wikitableRenoir, 'worklistWikiUrl': '/wiki/List_of_paintings_by_Pierre-Auguste_Renoir' },
    { 'englishName': 'Pieter Bruegel', 'parseFunc': wikitableBruegel, 'worklistWikiUrl': '/wiki/List_of_paintings_by_Pieter_Bruegel_the_Elder' },

]

async function fetchWikiPage() {
    try {
        let artworks: ArtWork[] = []
        for (const artist of artists) {
            const response = await axiosAgented.get(wikipediaDomain + artist.worklistWikiUrl);
            const html = response.data;
            const $ = cheerio.load(html);
            const tables = wikitables($)
            tables.forEach((table: any) => {
                table.forEach((row: any) => {
                    try {
                        let artWorkData = artist.parseFunc(row);
                        artWorkData.artist = artist.englishName;
                        const artWork = new ArtWork(artWorkData);
                        if (!artWork.title) {
                            console.log('Invalid Art Work' + JSON.stringify(artWork))
                            return;
                        }
                        artworks.push(artWork)
                        //console.log(JSON.stringify(artWork,null,2))
                    } catch (error) {
                        console.error('Error parsing the art work:', JSON.stringify(row), error);
                        throw error;
                    }

                });
            });
        };
        saveToFile(artworks)


    } catch (error) {
        console.error('Error fetching the Wiki page:', error);
        throw error;
    }
}

//可以让ChatGPT修改SQL
async function rijksmuseum() {
    const wikiUrl='https://www.wikidata.org/wiki/Wikidata:WikiProject_sum_of_all_paintings/Collection/J._Paul_Getty_Museum';
    const wikiPage = await WikiPage.load(wikiUrl)
    try {
        const tables = wikiPage.tables();
        let artworks: ArtWork[] = []

        tables[0].forEach((element:any) => {
            const artWorkData = {
                artist: element[3],
                title: element[0],
                isHighlight: false,
                imageDetailUrl: element[2].href,
                imageUrl: element[2].src || null,
                imageOriginal: '',
                time: '',
                year: '',
                location: '',
                museum: element[5],
                dimension: '',
                catNo: element[4],
            };
            const artWork = new ArtWork(artWorkData);
            artworks.push(artWork);
        });
        
        saveToFile(artworks)
        console.log('Tables found:',JSON.stringify(artworks,null,2));
    } catch (error) {
        console.error('Error:', error);
    }
}
rijksmuseum()


function wikitableMaryCassatt(element: any) {

    const artWorkData = {
        artist: 'Mary Cassatt',
        title: element[1],
        isHighlight: false,
        imageDetailUrl: element[0].href,
        imageUrl: element[0].src || null,
        imageOriginal: '',
        time: element[2],
        year: element[2],
        location: element[6],
        museum: element[5],
        dimension: element[3] ? convertDimensionsToCm(element[3]) : '',
        catNo: ''
    };
    return artWorkData;
}

function wikitableBruegel(element: any) {

    const locInfo = splitMuseumAndCity(element[5])

    const artWorkData = {
        artist: '',
        title: element[1],
        isHighlight: false,
        imageDetailUrl: element[0].href,
        imageUrl: element[0].src || null,
        imageOriginal: '',
        time: element[2],
        year: element[2],
        location: locInfo.length > 1 ? locInfo[1] : '',
        museum: locInfo[0],
        dimension: element[4] + ' cm',
        catNo: ''
    };
    return artWorkData;
}

function splitMuseumAndCity(info: string) {
    const location = info.replace(/\[\d+\]/g, '').split(',');
    return location;
}

function wikitableRenoir(element: any) {

    const size = element[3] ? element[3].split("(")[0].trim() : ""; // 45 cm × 36 cm (18 in × 14 in)
    const location = element[4].replace(/\[\d+\]/g, '').split(',')
    const artWorkData = {
        artist: '',
        title: element[1],
        isHighlight: false,
        imageDetailUrl: element[0].href,
        imageUrl: element[0].src || null,
        imageOriginal: '',
        time: element[2],
        year: element[2],
        museum: location[0],
        location: location.length > 1 ? location[1] : '',
        dimension: size,
        catNo: ''
    };
    return artWorkData;
}

function wikitableVermeer(element: any) {
    const matches = element[2] ? element[2].match(/\b\d{4}\b/) : null; //"1673–75 or c. 1670–72"
    const sizePattern = /(\d+\.?\d*)\s*x\s*(\d+\.?\d*)\s*cm/; //"Oil on canvas on panel 31.5 x 44 cm"
    var sizeMatch = element[3].match(sizePattern);

    const artWorkData = {
        artist: 'Vermeer',
        title: element[1].replace(/\[\d+\]/g, ''), //remove [13] "View of Delft[13]"
        imageDetailUrl: element[0].href,
        imageUrl: element[0].src || null,
        imageOriginal: '',
        time: matches ? matches[0] : null,
        year: matches ? matches[0] : null,
        location: element[4],
        museum: '',
        dimension: sizeMatch ? sizeMatch[1] + ' x ' + sizeMatch[2] + ' cm' : '',
        catNo: ''
        // the <a> tag is generated by js, cannont fetch it in this way . try using Puppeteer library.
        // const paintingDetailUrl = firstTd.find('i>a'); 
    };
    return artWorkData;
}
function wikitableVanGogh(element: any): ArtWork {

    var yearMatch = element[1] ? element[1].match(/\b\d{4}\b/) : null;
    const sizePattern = /(\d+\.?\d*)\s*x\s*(\d+\.?\d*)\s*cm/; //"Oil on canvas on panel 31.5 x 44 cm"
    var sizeMatch = element[4] ? element[4].match(sizePattern) : null;
    const locationInfo = element[2] ? element[2].split(',') : [];
    const imgBox = element[0];

    const artWorkData = {
        artist: 'Vincent van Gogh',
        title: imgBox.title,
        isHighlight: false,
        imageDetailUrl: imgBox.href || '',
        imageUrl: imgBox.src || '',
        imageOriginal: '',
        time: element[1],
        year: yearMatch ? yearMatch[0] : '',
        museum: locationInfo[0],
        location: locationInfo.length > 1 ? locationInfo[1] : '',
        dimension: sizeMatch ? sizeMatch[1] + ' x ' + sizeMatch[2] + ' cm' : '',
        catNo: element[5],
        // the <a> tag is generated by js, cannont fetch it in this way . try using Puppeteer library.
        // const paintingDetailUrl = firstTd.find('i>a'); 
    };
    return new ArtWork(artWorkData);
}

function wikitables($: cheerio.Root) {
    try {
        const tables = $('.wikitable'); // Locate all tables with class "wikitable"
        const result: any = [];

        tables.each((tableIndex: number, table: any) => {
            const tableData: any = [];
            const rows = $(table).find('tr');

            rows.each((rowIndex: number, row: any) => {
                const rowData: any = [];
                const tdList = $(row).find('td');
                if (tdList.length <= 1) { return; } //invalid wikitable

                tdList.each((colIndex: any, td: any) => {

                    const imgTag = $(td).find('img');//only one
                    if (imgTag.length > 0) { //image box
                        let imageBox: any = {}
                        let imgSrc = imgTag.attr('src');
                        if (imgSrc && imgSrc.startsWith('//')) {
                            imgSrc = 'https:' + imgSrc;
                        }
                        imageBox["src"] = imgSrc

                        if (imgTag.parent().is('a')) {
                            const imageDetailUrl = imgTag.parent().attr('href');
                            imageBox['href'] = imageDetailUrl
                        }

                        const figcaption = $(td).find('figcaption');
                        if (figcaption.length > 0) {
                            imageBox['title'] = figcaption.text();
                        }
                        rowData.push(imageBox);

                    } else { //pure text
                        rowData.push($(td).text().trim());
                    }
                });



                if (rowData.length > 0) {
                    tableData.push(rowData);
                }
            });

            if (tableData.length > 0) {
                result.push(tableData);
            }
        });

        return result;
    } catch (error) {
        console.error('Error:', error);
        return [];
    }
}



function parseInchDimension(dimension: string) {
    const [whole, fraction] = dimension.split(" ");
    const inches = parseInt(whole, 10) + (fraction ? eval(fraction) : 0);
    return inches * 2.54;
}

//35 in x 51 in	 => 26.67 cm x 34.29 cm
function convertDimensionsToCm(dimensionString: string) {
    if (dimensionString) { return '' }

    const [widthIn, heightIn] = dimensionString.toLowerCase().replace('in', '').split('x');
    const widthCm = parseInchDimension(widthIn.trim());
    const heightCm = parseInchDimension(heightIn.trim());
    return `${widthCm.toFixed(2)} cm x ${heightCm.toFixed(2)} cm`;
}