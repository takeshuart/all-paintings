import { scrapeMWFilePage } from "../crawlers/wiki-api"
import { axiosAgented } from "../utils/https"

async function testScrapeFilePage(){
    const url='https://commons.wikimedia.org/wiki/File:Paul_Gauguin_-_Self-portrait_with_a_hat_-_Google_Art_Project.jpg'
    const response = await axiosAgented.get(url)
    const fileinfo = scrapeMWFilePage(response)
    console.log(fileinfo)
}

testScrapeFilePage()