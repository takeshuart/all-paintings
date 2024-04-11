import { scrapeMeidaWikiFileInfo } from "../crawlers/wiki-api"

async function testScrapeFilePage(){
    const url='https://commons.wikimedia.org/wiki/File:Paul_Gauguin_-_Self-portrait_with_a_hat_-_Google_Art_Project.jpg'
    const fileinfo = scrapeMeidaWikiFileInfo(url)
    console.log(fileinfo)
}

testScrapeFilePage()