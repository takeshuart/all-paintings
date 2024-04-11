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


export async function downloadFile(url: string, outputPath: string): Promise<void> {
  const response = await axiosAgented.get(url, { responseType: 'stream' });
  const writer = fs.createWriteStream(outputPath);

  return new Promise((resolve, reject) => {
      response.data.pipe(writer);
      let error: Error | null = null;
      writer.on('error', err => {
          error = err;
          writer.close();
          reject(err);
      });
      writer.on('close', () => {
          if (!error) {
              resolve();
          }
      });
  });
}

