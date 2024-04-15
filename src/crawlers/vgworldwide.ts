import { axiosAgented } from "../utils/https";
import path from "path";
import { dataBasePath } from "./wikipage";

import fs from 'fs';
import { sleep } from "openai/core";
import { readJSONSync, readJson, readJsonSync } from "fs-extra";
import { attr } from "cheerio/lib/api/attributes";
import { ArtWork } from "./artwork";

//1. 通过api爬取vangoghworldwide.org数据
//2. 该网站有丰富的检索条件，如subject\location country\collection\period
//3. 通过accession numbers访问图片
//   示例：https://data.spinque.com/iiif/2/vangoghworldwide/kmm/KM 103.198.jpg/full/!682,440/0/default.jpg
//   访问图片需要设置header, Referer: https://vangoghworldwide.org/

interface Artwork {
    rank: number;
    probability: number;
    tuple: {
        id: string;
        class: string[];
        attributes: {
            "@id": string;
            type: string;
            identified_by: any[]; // You can replace 'any' with a more specific type if you know the structure
            classified_as: any[]; // You can replace 'any' with a more specific type if you know the structure
            produced_by: {
                type: string;
                carried_out_by: {
                    "@id": string;
                    type: string;
                    _label: {
                        [language: string]: string;
                    };
                }[];
                took_place_at: {
                    "@id": string;
                    type: string;
                    _label: string;
                }[];
                timespan: {
                    type: string;
                    end_of_the_end: string;
                    begin_of_the_begin: string;
                    identified_by: {
                        name: string
                        content: string
                    }[]
                }[];
            };
            current_owner: {
                type: string;
                "@id": string;
                _label: string;
            }[];
            representation: {
                "@id": string;
                type: string;
                classified_as: {
                    type: string;
                    "@id": string;
                    _label: string;
                }[];
                conforms_to: {
                    "@id": string;
                }[];
            }[];
            dataset: {
                "@id": string;
                _label: string;
                citation: any[]; // You can replace 'any' with a more specific type if you know the structure
            };
        };
    }[];
}


const rawDataFile = path.join(dataBasePath, './van gogh/vgworlwide-artworks-raw.json');
const dataFileSimplify = path.join(dataBasePath, './van gogh/vgworlwide-artworks-simplify.json');

fetchDataByFilter()

function cleaningData() {
    const ats = readJSONSync(dataFileSimplify);
    for (const at of ats) {
        if (!at.workType) {
            console.log(JSON.stringify(at))
        }
    }
}

//通过条件查询，补充作品的属性
//api在chrome->inspect中获得
async function fetchDataByFilter() {
    const filter = 'subject'
    const filterValuesUrl = `https://rest.spinque.com/4/vangoghworldwide/api/platform/e/artworks/q/${filter}/results?count=200&config=production`
    const response = await axiosAgented.get(filterValuesUrl)
    const data = response.data
    for (const values of data.items) {
        let filterValue = values.tuple[0].id
        const filterName = values.tuple[1]
        console.log(`name:${filterName} \t url:${filterValue}`)
        filterValue = encodeURIComponent(`${filterValue}`)
        const filterSearchUrl = `https://rest.spinque.com/4/vangoghworldwide/api/platform/e/artworks/q/${filter}%3AFILTER/p/value/1.0(${filterValue})/results?config=production`
        const artworks = await fetchDataByPage(filterSearchUrl)
        console.log(`${filter}: ${filterName},size:${artworks.length}`)

        //用检索条件补充artwork属性
        for (const at of artworks) {
            const artwork = analysisRawData(at)
            //read all artwork
            //todo
            const fCodeMap = new Map<string, any>();
            if (fCodeMap.has(artwork.fCode){
                const old = fCodeMap.get(artwork.fCode)
                old.subject = filterName
            }
        }
        //todo save new data to file

    }
}



function resolveRawdata() {
    const rawdata: Artwork[] = readJsonSync(rawDataFile)
    const artworks: any[] = []
    for (const raw of rawdata) {
        const artwork = analysisRawData(raw)
        artworks.push(artwork)
        console.log(JSON.stringify(artwork))
    }

    saveJsonToFile(artworks, dataFileSimplify)
    console.log(`total: ${artworks.length}`)
}

function analysisRawData(raw: any) {
    try {
        const attrs = raw.tuple[0].attributes
        const titles: any = []
        const artwork: any = {
            'titles': titles,
            'urlDetail': attrs["@id"]
        }
        const ids = attrs.identified_by;
        for (const id of ids) {
            if (id.type === 'Identifier' && id.classified_as) {
                const as = id.classified_as[0];
                if (as._label === 'JH number') {
                    artwork.jhCode = id.content;
                    if (id.content == 'JH1523') {
                        console.log()
                    }
                } else if (as._label === 'De La Faille number') {
                    artwork.fCode = id.content;
                } else if (as._label === 'accession numbers') {
                    //museum number
                    artwork.accessionNo = id.content;
                }
            } else if (id.type === 'Name' && id.content) {
                const title = id.content;
                let language;
                if (id.language) {
                    language = id.language[0]._label
                }
                titles.push({
                    "title": title,
                    "language": language
                })

            }
        }

        if (attrs.classified_as) {
            //drawing/painting..
            artwork.workType = attrs.classified_as[0]._label
        }
        if (attrs.produced_by) {
            const proInfo = attrs.produced_by
            if (proInfo.took_place_at) {
                artwork.placeOfOrigin = proInfo.took_place_at[0]._label
            }
            if (proInfo.timespan) {
                const time = proInfo.timespan[0]
                artwork.dateStart = time.begin_of_the_begin;
                artwork.dateEnd = time.end_of_the_end;
                if (time.identified_by) {
                    artwork.dateDisplay = time.identified_by[0].content
                }
            }
        }
        if (attrs.current_owner) {

            artwork.owner = attrs.current_owner[0]._label
            artwork.owner = artwork.owner.nl ? artwork.owner.nl : artwork.owner
        }
        if (attrs.representation) {
            const rep = attrs.representation[0]
            if (rep.type === 'VisualItem') {
                artwork.iiifImage = rep["@id"]
            }
        }
        return artwork
    } catch (err) {
        console.log(`failed to resolve raw data: ${raw.tuple[0].id}\n` + err)
        throw err
    }
}


async function fetchArtworksWithoutFilter(offset: number, count: number) {
    const apiUrl = `https://rest.spinque.com/4/vangoghworldwide/api/platform/e/artworks/q/sort_fnumber_desc/results?config=production`;
    fetchDataByPage(apiUrl)
}


async function saveJsonToFile(json: any[], file: string): Promise<void> {
    try {
        await fs.promises.writeFile(file, JSON.stringify(json, null, 2), { flag: 'w' });
        console.log(`Artworks saved to ${rawDataFile}`);
    } catch (error) {
        console.error(`Error saving artworks to ${rawDataFile}:`, error);
    }
}



async function fetchDataByPage(url: string) {
    const pageSize = 20;
    let allArtworks: Artwork[] = [];
    let page = 0;

    do {
        const offset = page * pageSize;
        const queryString = `&count=${pageSize}&offset=${offset}`
        const fullUrl = url + queryString
        const response = await axiosAgented.get(fullUrl);
        const data = response.data;
        const artWorks = data.items;
        if (artWorks.length === 0) {
            console.log("No more artworks found. Stopping pagination.");
            break;
        }
        allArtworks = allArtworks.concat(artWorks);
        page += 1;
        console.log(`Processing: ${page};\t${fullUrl}`);
        sleep(100);
    } while (true);

    return allArtworks
}
