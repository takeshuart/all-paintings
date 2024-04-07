
//爬取www.vggallery.com数据

import { axiosAgented } from "../utils/https";
import * as cheerio from 'cheerio';
import { saveJsonToFile } from "./wikipage";
import * as iconv from 'iconv-lite';


class VanGoghWork {
    imageUrl?: string
    period?: string;
    type?: string;
    title: string | undefined;
    originAndDate?: string;
    location?: string;
    fCode?: string;
    jhCode?: string

}
//不同时期的油画
const periodHtmls = ['early', 'nuenen', 'paris', 'arles', 'st_remy', 'auvers']
const periods = ['Earliest(1881-83)', 'Nuenen / Antwerp (1883-86)', 'Paris (1886-88)', 'Arles (1888-89)', 'Saint-Rémy (1889-90)', 'Auvers-sur-Oise (1890)'];
const domain = 'http://www.vggallery.com'
const watercolour = 'http://www.vggallery.com/watercolours/main.htm'
const drawings='http://www.vggallery.com/drawings/main_'

async function fetchPaintings() {

    const artworks: VanGoghWork[] = [];

    for (const period of periodHtmls) {
        let url = domain + `/painting/by_period/${period}.htm`

        let artWorks = fetchPage(url,'paintings')
    };

    console.log(artworks.length);
    const jsonstring = JSON.stringify(artworks, null, 2);
    saveJsonToFile(jsonstring, "./van-gogh-paintings.json")
}

fetchDrawings()

function fetchWatercolour(){

    const worksPromise: Promise<VanGoghWork[]> = fetchPage(watercolour, 'watercolour');
    worksPromise.then((works) => {
        console.log(works);
        const jsonString = JSON.stringify(works, null, 2);
        saveJsonToFile(jsonString, "./van-gogh-watercolour.json");
    });
}

async function fetchDrawings() {

    const pageList=['ac','df','gi','jl','mo','pr','su','vz']

    const artworks: VanGoghWork[] = [];
    const promises = [];

    for (const page of pageList) {
        let url = drawings + page+'.htm'

        const worksPromise: Promise<VanGoghWork[]> = fetchPage(url, 'watercolour');
        promises.push(worksPromise); 
    };

    Promise.all(promises)
    .then((results) => {
        console.log(results);

        const allWorks = results.flat(); 
        const jsonString = JSON.stringify(allWorks, null, 2);
        saveJsonToFile(jsonString, "./van-gogh-drawings.jsonl");
    })
    .catch((error) => {
        console.error("An error occurred:", error);
    });

}



async function fetchPage(url: string,type:string): Promise<VanGoghWork[]> {

    const response = await axiosAgented.get(url);
    const charset = 'iso-8859-1';
    const html = iconv.decode(Buffer.from(response.data), charset);
    const $ = cheerio.load(html);
    
    const artworks: VanGoghWork[] = [];
    
    $('table:eq(0)').find('tr').each(function (i, e) {
        let artwork = new VanGoghWork();
        artwork.type = type;
        $(e).find('td').each(function (index, e) {
            var tdText = $(e).text().trim();
            switch (index) {
                case 0:
                    artwork.title = tdText;
                    break;
                case 1:
                    artwork.originAndDate = tdText;
                    break;
                case 2:
                    artwork.location = tdText;
                    break;
                case 3:
                    artwork.fCode = tdText;
                    break;
                case 4:
                    artwork.jhCode = tdText;
                    break;
                default:
                    break;
            }
        });

        if (artwork.title == 'Painting Name') {
            return;//skip table header
        }
        artwork.imageUrl = domain + '/painting/' + padLeadingZeros(artwork.fCode)
        artworks.push(artwork);        
    })
    
    return artworks;
}



//vggallery的详情页和图片的url是fCode,不如4位数字，前面用0补齐
//个别fCode 后面会有字母  ,jh编码为jg_xxx.jpg
//如144a的图片地址是 ./f_0144a.jpg
function padLeadingZeros(fCode: any): string {

    let match = fCode.match(/^(\d+)(.*)$/);
    if (match) {
        let numPart = match[1].padStart(4, '0');
        return 'f_' + numPart + match[2] + '.jpg';
    } else {
        return fCode;
    }
}

