import { sleep } from "openai/core";
import { axiosAgented } from "../utils/https";
import * as cheerio from 'cheerio';

const baseURL = 'https://www.vangoghmuseum.nl/en/collection/search';
const params = {
    q: '',
    Artist: 'Vincent van Gogh',
    Type: 'drawing',
    from: 0,
    size: 24,
};

async function fetchData() {
    let hasMoreResults = true;

    while (hasMoreResults) {
        try {
            let objects: any[]=[]
            const response = await axiosAgented.get(baseURL, { params });
            const data = response.data;

            console.log(`Page with 'from'=${params.from}:`, data);
            const $ = cheerio.load(data.resultsHtml);
            $('a.collection-art-object-wrapper').each((index, element) => {
                if ($('div.is-part-of-set').length === 0) {
                    console.log('skip set')
                    return
                }
                const href = $(element).attr('href');
                const title = $(element).attr('title');
                let obj={
                    href:href,
                    title:title
                }
                objects.push(obj)
            });
            console.log(`size:${objects.length}\t${JSON.stringify(objects)}`);

            hasMoreResults = data.hasMoreResults;

            params.from += params.size;

            sleep(200)

            break
        } catch (error) {
            console.error(`Error fetching data:`, error);
            hasMoreResults = false;
        }
    }
}

fetchData();
