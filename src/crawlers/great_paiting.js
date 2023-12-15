const axios = require('axios');
const cheerio = require('cheerio');
//Config vsCode setting 'http:proxy' does not work; but using 'socks-proxy-agent' is ok.
const { SocksProxyAgent } = require('socks-proxy-agent');
const proxyUrl = 'socks5://127.0.0.1:1080';
const socksAgent = new SocksProxyAgent(proxyUrl);

const url = 'https://en.wikipedia.org/wiki/100_Great_Paintings';

const axiosInstance = axios.create({
  httpAgent: socksAgent,
  httpsAgent: socksAgent,
  headers: {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/70.0.3538.77 Safari/537.36'
  }
});


axiosInstance.get(url)
  .then(response => {
    const html = response.data;
    const $ = cheerio.load(html);
    const paintingsList = [];

    $('#mw-content-text li').each(function () {
      const a = $(this).find('i a')
      //"===" check empty array or empty collection
      if (a.length === 0) {
        return;
      }
      const paintingName = $(a).text().trim();
      const href = $(a).attr("href");
      let paintingUrl = ""
      if (href) {
        paintingUrl = "https://en.wikipedia.org" + href;
      }

      paintingsList.push({ name: paintingName, url: paintingUrl })
    });
    return paintingsList
  })
  // This then will execute after the previous then has completed
  .then(result => {
    let index = 0;

    function processItem() {
      if (index < result.length) { // Check if there are more items to process
        const painting = result[index];
        console.log(index + ". " + painting.name + "\t" + painting.url);

        axiosInstance.get(painting.url)
          .then(response => {
            const html = response.data;
            const $ = cheerio.load(html);
            const h = $('.infobox tr:first').text();
            console.log(h)

            index++; // move to next item
            setTimeout(processItem, 1000); // Call processItem() recursively after 1 second
          })
          .catch(error => {
            console.error(error);
            index++;
            setTimeout(processItem, 1000); // Continue to next item even on error
          });
      }
    }

    processItem(); // 开始处理
  })
  .catch(console.error);

//parse the detail of wikipedia image
//https://en.wikipedia.org/wiki/File:Pieter_Bruegel_de_Oude_-_De_val_van_Icarus.jpg

function parseWikiImageDetail() {
}

//parse the detail of wikipedia painting
//https://en.wikipedia.org/wiki/Landscape_with_the_Fall_of_Icarus
function parseWikiPaintingDetail(params) {

}



