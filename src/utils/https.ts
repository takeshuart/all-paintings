import axios, { AxiosInstance, AxiosResponse } from 'axios';
//Config vsCode setting 'http:proxy' does not work; but using 'socks-proxy-agent' is ok.
import { SocksProxyAgent } from 'socks-proxy-agent';
import fs from 'fs';
import { Agent } from 'openai/_shims/node-types.mjs';

const proxyUrl = 'socks5://127.0.0.1:1080';
export let socksAgent: Agent;
export let axiosAgented: AxiosInstance;

export function initAxiosAgented() {
  try {
    const socksAgent = new SocksProxyAgent(proxyUrl);

    // Create axios instance using the v2-ray proxy
    axiosAgented = axios.create({
      httpAgent: socksAgent,
      httpsAgent: socksAgent,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/70.0.3538.77 Safari/537.36'
      }
    });

    console.log('Axios instance created successfully');

  } catch (error) {
    console.error('Error during axios initialization:', error);
  }
}

testDownload()
async function testDownload() {
  const image = 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/ab/Egon_Schiele_-_Lovers_-_Google_Art_Project.jpg/654px-Egon_Schiele_-_Lovers_-_Google_Art_Project.jpg'
  const dir = "D:\\Arts\\Van Gogh\\download_test.jpg"
  downloadFile(image, dir)
}


export async function downloadFileWithProxy(url: string, outputPath: string, headers?: any): Promise<void> {
  return downloadFileStream(url, outputPath, axiosAgented, headers);
}

//without proxy
export async function downloadFile(url: string, outputPath: string, headers?: any): Promise<void> {
  return downloadFileStream(url, outputPath, axios, headers);
}

async function downloadFileStream(url: string, outputPath: string, axiosInstance: any, headers?: any): Promise<void> {
  const response = await axiosInstance.get(url, {
    responseType: 'stream',
    headers: headers ? headers : {},
  });

  const writer: fs.WriteStream = fs.createWriteStream(outputPath);

  return new Promise((resolve, reject) => {
    response.data.pipe(writer);
    let error: Error | null = null;
    writer.on('error', (err) => {
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

