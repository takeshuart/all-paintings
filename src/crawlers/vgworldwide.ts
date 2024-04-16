import { axiosAgented } from "../utils/https";
import path from "path";
import { dataBasePath } from "./wikipage";

import fs, { fchmod } from 'fs';
import { sleep } from "openai/core";
import { readJSONSync, readJson, readJsonSync } from "fs-extra";
import { attr } from "cheerio/lib/api/attributes";
import { ArtWork } from "./artwork";
import { count } from "console";

//TODO cleaning merge-vgww-pubhist-vggallery.json

//1. 通过api爬取vangoghworldwide.org数据
//2. 该网站有丰富的检索条件，如subject\location country\collection\period
//3. 通过accession numbers访问图片
//   示例：https://data.spinque.com/iiif/2/vangoghworldwide/kmm/KM 103.198.jpg/full/!682,440/0/default.jpg
//   访问图片需要设置header, Referer: https://vangoghworldwide.org/
//4. vgww官网共有2168个作品，根据f-number去重后，有1882个作品。
//   原因是部分作品有重复图片，例如F1664

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


const rawDataFile = path.join(dataBasePath, './van gogh/vgworlwide-raw-data.json');
const vgwwdataFile = path.join(dataBasePath, './van gogh/vgww-artworks.json');
const pubhistDataFile = path.join(dataBasePath, './van gogh/pubhist-vggallery-merge-artworks.json')


function cleaningData() {
    const ats = readJSONSync(vgwwdataFile);
    for (const at of ats) {
        if (!at.workType) {
            console.log(JSON.stringify(at))
        }
    }
}
//test
async function main() {
    const filterSearchUrl = 'https://rest.spinque.com/4/vangoghworldwide/api/platform/e/artworks/q/subject%3AFILTER/p/value/1.0(http%3A%2F%2Fvocab.getty.edu%2Faat%2F300015637)/results?config=production'
    const artworks = await fetchDataByPage(filterSearchUrl)
    const fCodeMap = loadVgwwData()
    const filterName = 'animal art'
    //用检索条件补充artwork属性
    for (const at of artworks) {
        const artwork = analysisRawData(at)
        try {
            //read all artwork
            if (artwork.fCode) {
                const old = fCodeMap.get(artwork.fCode)
                old.subject = filterName
            }
        } catch (err) {
            console.log(`failed to update attr:${artwork.fCode}`)
        }
    }
}


//通过条件查询，补充作品的属性
//api在chrome->inspect中获得
async function fetchDataByFilter() {
    const apiDomain = 'https://rest.spinque.com/4/vangoghworldwide/api/platform/e'
    const filter = 'period'//owner_country, material, research_type,period
    const filterValuesUrl = apiDomain + `/artworks/q/${filter}/results?count=200&config=production`
    const response = await axiosAgented.get(filterValuesUrl)
    const data = response.data
    const fCodeMap = loadVgwwData()
    for (const values of data.items) {
        let filterValue = values.tuple[0].id
        const filterName = values.tuple[1]
        console.log(`name:${filterName} \t url:${filterValue}`)
        filterValue = encodeURIComponent(`${filterValue}`)
        const filterSearchUrl = apiDomain + `/artworks/q/${filter}%3AFILTER/p/value/1.0(${filterValue})/results?config=production`
        const artworks = await fetchDataByPage(filterSearchUrl)

        //用检索条件补充artwork属性
        for (const at of artworks) {
            const artwork = analysisRawData(at)
            try {
                //read all artwork
                if (artwork.fCode) {
                    const old = fCodeMap.get(artwork.fCode)
                    // old.subject = filterName
                    // old.ownerCountry = filterName
                    // old.material = filterName
                    if (old) {
                        old.period = filterName
                        // if(!old.researchType){
                        //     old.researchType=[]
                        // }
                        // old.researchType?.push(filterName)
                    }
                    console.log()
                }
            } catch (err) {
                console.log(`failed to update attr:${artwork.fCode}`)
            }
        }
        console.log(`update:${filter}: ${filterName},size:${artworks.length}`)
    }

    const fileWithFilter = path.join(dataBasePath, './van gogh/vgworlwide-artworks-simplify-with-filter.json');
    const atsWithFilter = [...fCodeMap.values()];
    await fs.promises.writeFile(fileWithFilter, JSON.stringify(atsWithFilter, null, 2), { flag: 'w' });

    console.log(`Artworks saved to ${rawDataFile}`);
}

function loadVgwwData() {
    const objarr = readJsonSync(vgwwdataFile)
    const fCodeMap = new Map<string, any>()
    const atNoFCode: any[] = []
    for (const at of objarr) {
        const fCode = at.fCode
        if (fCodeMap.has(fCode)) {
            console.log('duplicate!\t' + fCode)
        }
        if (fCode) {
            fCodeMap.set(fCode, at)
        } else {
            atNoFCode.push(at)
        }
    }
    console.log(`size:${fCodeMap.size}\n `)
    return fCodeMap
}

function resolveRawdata() {
    const rawdata: Artwork[] = readJsonSync(rawDataFile)
    const artworks: any[] = []
    for (const raw of rawdata) {
        const artwork = analysisRawData(raw)
        artworks.push(artwork)
        console.log(JSON.stringify(artwork))
    }

    saveJsonToFile(artworks, vgwwdataFile)
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
    const pageSize = 40;
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

mergePubhistAndVgww()

async function mergePubhistAndVgww() {
    const vgwwData = readJsonSync(vgwwdataFile)
    const pubhistData = readJsonSync(pubhistDataFile)
    const mergeFile = path.join(dataBasePath, './van gogh/merge-vgww-pubhist-vggallery.json')
    const merge: any[] = []
    const vgwwFCodeMap = new Map<string, any>()
    let overFlappingCounter = 0
    let vgwwOnlyCounter = 0
    let pubhistCounter = 0
    vgwwData.forEach((vgwwAt: any) => {
        if (vgwwAt.fCode && vgwwAt.jhCode) {
            vgwwFCodeMap.set(vgwwAt.fCode, vgwwAt)
        } else {
            merge.push(vgwwAt)
            vgwwOnlyCounter++
            // console.log(`vgww only: ${JSON.stringify(vgwwAt)}`)
        }

    })

    pubhistData.forEach((obj1: any) => {

        const obj2 = vgwwFCodeMap.get(obj1.fCode)
        if (obj2 && obj1.jhCode == obj2.jhCode) {
            const mergedObject = { ...obj1, ...obj2 };
            merge.push(mergedObject)
            overFlappingCounter++
            obj2.titles.push({
                "title": obj1.title_zh,
                "language": "Chinese"
            })
            // console.log(JSON.stringify(mergedObject))
        } else {
            merge.push(obj1)
            pubhistCounter++
            // console.log(`pushhist only: ${JSON.stringify(obj1)}`)
        }
    })

    console.log(`total: ${merge.length}, overflapping size: ${overFlappingCounter},pubhistCounter:${pubhistCounter},vgwwOnlyCounter:${vgwwOnlyCounter}`)

    await fs.promises.writeFile(mergeFile, JSON.stringify(merge, null, 2), { flag: 'w' });

}


//pubhist/vgww 互相补充jhCode 和FCode
async function diffFile() {
    const vgwwData = readJsonSync(vgwwdataFile)
    const pubhistData = readJsonSync(pubhistDataFile)
    const pubhistDataAddCatNoFile = path.join(dataBasePath, './van gogh/pubhist-artworks-add-catNo.json')
    console.log(`vgwwDataSize:${vgwwData.length},pubhistData:${pubhistData.length}`)

    const uniquekey = new Set<string>()
    let bothJHFCounter = 0
    pubhistData.forEach((pubhistAt: any) => {
        if (pubhistAt.fCode && pubhistAt.jhCode) {
            bothJHFCounter++
        }
    })

    pubhistData.forEach((pubhistAt: any) => {

        vgwwData.forEach((vgwwAt: any) => {
            if (pubhistAt.fCode && !pubhistAt.jhCode && vgwwAt.jhCode
                && pubhistAt.fCode == vgwwAt.fCode) {
                pubhistAt.jhCode = vgwwAt.jhCode
                console.log(`pubhist Fcode: ${pubhistAt.fCode}, vgww JHCode: ${vgwwAt.jhCode}`)
            }
            if (pubhistAt.jhCode && !pubhistAt.fCode && vgwwAt.fCode
                && pubhistAt.jhCode == vgwwAt.jhCode) {
                pubhistAt.fCode = vgwwAt.fCode
                console.log(`pubhist jhCode: ${pubhistAt.jhCode}, vgww fCode: ${vgwwAt.fCode}`)
            }
        });
    });

    // await fs.promises.writeFile(pubhistDataAddCatNoFile, JSON.stringify(pubhistData, null, 2), { flag: 'w' });

    let counter = 0
    pubhistData.forEach((pubhistAt: any) => {
        if (pubhistAt.fCode && pubhistAt.jhCode) {
            counter++
        }
    })
    console.log(`before:${bothJHFCounter}, after: ${counter}`)

}