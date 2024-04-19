import axios from 'axios';
//Config vsCode setting 'http:proxy' does not work; but using 'socks-proxy-agent' is ok.
import { SocksProxyAgent } from 'socks-proxy-agent';
import fs from 'fs';

const proxyUrl = 'socks5://127.0.0.1:1080';
const socksAgent = new SocksProxyAgent(proxyUrl);

export const axiosAgented = axios.create({  //create an instance using v2ray proxy
  httpAgent: socksAgent,
  httpsAgent: socksAgent,
  headers: {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/70.0.3538.77 Safari/537.36'
  }
});

testDownload()
async function testDownload() {
  const image = 'https://data.spinque.com/iiif/2/vangoghworldwide%2Fkmm%2Fsharepoint%2FKM104_607-lijst.tif/4096,4096,4096,4096/!800,440/0/default.jpg'
  const dir = "D:\\Arts\\Van Gogh\\demo.jpg"
  downloadFile(image, dir,{'Referer':'https://vangoghworldwide.org/'})
}


export async function downloadFile(url: string, outputPath: string, headers?: any): Promise<void> {
  let response = null;
  let writer = null;
  try {
    response = await axiosAgented.get(url,
      {
        responseType: 'stream',
        headers: headers ? headers : {}
      });

    writer = fs.createWriteStream(outputPath);
  } catch (err) {
    throw err
  }

  return new Promise((resolve, reject) => {
    
    response?.data.pipe(writer);
    let error: Error | null = null;
    writer?.on('error', err => {
      error = err;
      writer.close();
      reject(err);
    });
    writer?.on('close', () => {
      if (!error) {
        resolve();
      }
    });
  });

}

