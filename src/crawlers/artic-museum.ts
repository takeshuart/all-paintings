import fs from 'fs';
import * as path from 'path';
import { axiosAgented } from '../utils/https';
import { ArticArtWork, ArticArtWorkInfo } from './artic-model';
import { ArtWork } from './artwork';
import { saveArtWorksToJSON } from './wikipage';
import { json } from 'stream/consumers';
import { fineArtsIds } from './artic-config';
import { insert } from '../db/sqllite-utils';
import axios, { AxiosError } from 'axios';

//使用wikidata list信息补充：https://www.wikidata.org/wiki/Wikidata:WikiProject_sum_of_all_paintings/Collection/Art_Institute_of_Chicago

const articApi = `https://api.artic.edu/api/v1/artworks`
//all artwork ids of paintings 
const fileHomePath = path.join(__dirname, '../../data/');
const topFile = path.join(fileHomePath, 'artic-top300-ids.txt');
const top300File = path.join(fileHomePath, 'artic-top300-details.txt');
const articAllIdOfPaintingsFile = path.join(fileHomePath, 'artic-all-ids-of-paintings.txt');
const iiif_url = 'https://www.artic.edu/iiif/2'
const sizeSmall = '843'
const sizeLarge = '1686' //double

// 定义接口以匹配返回的 JSON 数据结构
interface ArtworkResponse {
  data: any; // 根据需要修改以匹配详细的数据结构
  info: any;
  config: any;
}



const apiUrl = 'https://api.artic.edu/api/v1/artworks';


async function fetchData(url: string): Promise<string | undefined> {

  try {
    const response = await axiosAgented.get(url)
    if (response.status === 200) {
      const data = response.data.data;

      if (data && data.length > 0) {
        const result = data.map((item: any) => {
          return `${item.id}\t${item._score}\t${item.title}`;
        });

        return result.join('\n') + '\n';
      }
    }
  } catch (error) {
  if (axios.isAxiosError(error)) {
      const axiosError = error as AxiosError;
      if (axiosError.response) {
        console.error(`Status Code:${axiosError.response.status},'Response Data:'${JSON.stringify(axiosError.response.data)}`)
      } else {
        console.error('Error:', axiosError.message);
      }
    } else {
      console.error('Error:', error);
    }
  }
}

//这个接口超过1000个artwork就报错
//Status Code:403,'Response Data:'{"status":403,"error":"Invalid number of results","detail":"You have requested too many results. Please refine your parameters."}
//官网文档对于较大的结果集，推荐下载完整的json文件
async function fetchAllPages(totalPages: number, limit: number): Promise<void> {
  const paintingsUrl = articApi + '/search?query[term][artwork_type_id]=1'

  try {
    for (let page = 51; page <= totalPages; page++) {

      const url = `${paintingsUrl}&page=${page}&limit=${limit}`
      console.log(`url:${url}`)
      const data = await fetchData(url);
      if (data) {
        fs.appendFileSync(articAllIdOfPaintingsFile, data);
        console.log(`${page}/${totalPages} have writen to file.`);
      }
      await new Promise(resolve => setTimeout(resolve, 50)); //wait 50ms
    }
    console.log('Data fetching and writing completed.');
  } catch (error) {
    console.error('Error:', error);
  }
}

async function fetchAllIdsOfPaintings() {
  const limit = 20;//no more than 50
  const totalArtworks = 3514;//接口中有提供总数量
  const totalPages = Math.ceil(totalArtworks / limit);

  await fetchAllPages(totalPages, limit);
}

fetchAllIdsOfPaintings()


async function fetchArtwork(id: string): Promise<ArtWork> {

  try {
    const url = articApi + `${id}`
    const response = await axiosAgented.get<ArtworkResponse>(articApi + `/${id}`);
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
    artworkType: aw.artwork_type_title,
    description: aw.description,
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
      await new Promise(resolve => setTimeout(resolve, 1000)); // 等待 50 毫秒
      index++;
      console.log(`${index}/${ids.length},ID: ${id}`)
      break
    }
    saveArtWorksToJSON(artworks)
  } catch (error) {
    console.error('Error processing artwork IDs:', error);
  }
}

processArtworkIds(topFile);

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

//读取json文件

const directoryPath = 'D:\\Arts\\数据库\\artic-api-data\\artic-api-data\\json\\artworks';

let count = 0;

function readFilesInDirectory(dirPath: string) {
    const files = fs.readdirSync(dirPath);

    files.forEach(file => {
        const fullPath = path.join(dirPath, file);
        const stats = fs.statSync(fullPath);

        if (stats.isDirectory()) {
            readFilesInDirectory(fullPath);
        } else if (file.endsWith('.json')) {
            const content = fs.readFileSync(fullPath, 'utf8');
            const json = JSON.parse(content);
            if (json.artwork_type_id === 1) {
                count++;
                console.log(JSON.stringify(content))
            }
        }
    });
}
// readFilesInDirectory(directoryPath);
// console.log(`Number of files containing 'artwork_type_id: 1': ${count}`);
