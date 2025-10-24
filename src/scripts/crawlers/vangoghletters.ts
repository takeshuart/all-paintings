import path from 'path';
import sharp from 'sharp';
import fs from 'fs';
import * as cheerio from 'cheerio';
import { axiosAgented, downloadFile } from '../../utils/https.js'
import { sleep } from 'openai/core';

/**
 *  下载vangoghletters.org上的图片 
 *  1.下载切片（可使用chrome插件imageDownloader）2. 拼接图片
 *  图片切片目录vgtile.vangoghletters.org/vangogh/VGM001000462_02_n_tiles
 *  文件越多的目录，分辨率越高
 *  /zoom1/ 64x64矩阵，
 *  /zoom0/ 32x32矩阵，4096px
 *  20250410 该切片文件目录已无法直接访问，403 Forbidden,加header依然没能解决
 *  让chatgpt分析网站的js代码，找出加载tiles的逻辑，在#assignTileImage方法.
 *  无法访问tile列表页面了，只能按照网站的逻辑复写计算逻辑。
 */

const tilesPath = 'C:\\Users\\Administrator\\Downloads'
const mergePath = 'C:\\Users\\Administrator\\Downloads\\vgletter-mergefile'
const tileImageDomain = 'https://vangoghletters.org/tiles'

const letterMap = new Map<string, string>([
    ["Letter No.192_-_letter To Theo_-_The Hague_-_29 September 1872", '/VGM001000001_01_n_tiles/zoom-1/'],

])
// 并发处理每个网页
async function downloadLetterTilesConcurrently() {

    try {
        await Promise.all([...letterMap].map(async ([letterImageName, subPath]) => {
            const tilesDirUrl = tileImageDomain + subPath;
            const resp = await axiosAgented.get(tilesDirUrl);

            const data = resp.data;
            const $ = cheerio.load(data);
            const arr = $('table tr');
            const rows = arr.slice(3, arr.length - 1).toArray(); // 转化为数组
            //通过最后文件名获取切片矩阵的大小
            const lastOne = $(rows[rows.length - 1]).find('td:nth-child(2) a').attr('href');

            let matrixRows: number, matrixCols: number;
            if (lastOne) {
                const matrix = lastOne?.split('_');
                matrixRows = parseInt(matrix[matrix.length - 2], 10) + 1;
                matrixCols = parseInt(matrix[matrix.length - 1], 10) + 1;
            }
            const batchSize = 30;
            await processRowsInBatches($, rows, batchSize, letterImageName, tilesDirUrl);
        }));
        console.log('All letters processed successfully.');
    } catch (error) {
        console.error('Error processing letters:', error);
    }
}
async function processRowsInBatches($: cheerio.Root, rows: cheerio.Element[], batchSize: number, letterImageName: string, tilesDirUrl: string) {
    for (let i = 0; i < rows.length; i += batchSize) {
        const batch = rows.slice(i, i + batchSize);
        await Promise.all(batch.map(async (row) => {
            const href = $(row).find('td:nth-child(2) a').attr('href');
            if (href) {
                const fullUrl = tilesDirUrl + href;
                const tileName = href?.split('_').slice(-2).join('_').toString();
                const downloadDir = path.join(tilesPath, letterImageName);
                if (!fs.existsSync(downloadDir)) {
                    fs.mkdirSync(downloadDir, { recursive: true });
                    console.log(`Directory ${downloadDir} created!`);
                }
                // 定义下载操作
                const downloadOperation = async () => {
                    await downloadFile(fullUrl, path.join(downloadDir, tileName));
                    console.log(`Downloaded file: ${tileName}`);
                };

                // 使用 retryAsyncOperation 函数重试3次
                await retryAsyncOperation(downloadOperation, 3);
            }
        }));
        console.log(`Processed batch ${i / batchSize + 1} / ${Math.ceil(rows.length / batchSize)}`);
    }
}
async function retryAsyncOperation(operation: () => Promise<void>, retries: number): Promise<void> {
    try {
        await operation();  // 尝试执行操作
    } catch (error) {
        if (retries > 0) {
            console.log(`Retrying... ${retries} attempts left`);
            await retryAsyncOperation(operation, retries - 1);  // 重试
        } else {
            console.error('Operation failed after retries:', error);
            throw error;  // 达到最大重试次数，抛出错误
        }
    }
}




// 加载图片数据
async function loadImages(paths: string[]): Promise<Buffer[]> {
    return Promise.all(paths.map(imagePath => sharp(imagePath).toBuffer()));
}

// 动态拼接图片矩阵
async function stitchImagesToGrid(imagePaths: string[], columns: number, rows: number, outputPath: string) {
    // 假设所有图片大小相同，获取第一张图片的宽度和高度
    const { width, height } = await sharp(imagePaths[0]).metadata();

    if (!width || !height) {
        throw new Error("无法获取图片的宽度或高度！");
    }

    // 加载所有图片的buffer
    const images = await loadImages(imagePaths);

    // 创建一个空白画布，其大小为整个拼接后的图片的尺寸
    const canvas = sharp({
        create: {
            width: width * columns,   // 总宽度 = 单个图片宽度 * 列数
            height: height * rows,    // 总高度 = 单个图片高度 * 行数
            channels: 4,              // RGBA 通道
            background: { r: 255, g: 255, b: 255, alpha: 1 }  // 白色背景
        }
    });

    // 定义每个图片的位置 (动态计算)
    const composites = images.map((image, index) => {
        const col = index % columns;       // 计算列数
        const row = Math.floor(index / columns); // 计算行数

        return {
            input: image,
            top: row * height,    // 图片在行中的位置
            left: col * width     // 图片在列中的位置
        };
    });

    // 将所有图片按指定的位置拼接在一起
    canvas
        .composite(composites)
        .toFile(outputPath, (err, info) => {
            if (err) {
                console.error('Error creating the composite image:', err);
            } else {
                console.log('Successfully created the composite image:', info);
            }
        });
}


async function mergeImage() {
    for (let imageName of letterMap.keys()) {
        const tilesDir = path.join(tilesPath, imageName)
        const matrix = getMatrixSize(tilesDir)
        const imagePaths = generateImagePaths(tilesDir, matrix.maxRow, matrix.maxCol);

        if (!fs.existsSync(mergePath)) {
            fs.mkdirSync(mergePath, { recursive: true });
            console.log(`Directory ${mergePath} created!`);
        }
        if (imagePaths.length === matrix.maxRow * matrix.maxCol) {
            await stitchImagesToGrid(imagePaths, matrix.maxCol, matrix.maxRow, path.join(mergePath, imageName + '_-_from vangoghletters.jpg'));
        } else {
            console.error('Some images are missing.');
        }
    }
}
// 动态生成图片路径数组，命名格式为 行号-列号.jpg
function generateImagePaths(imageDir: string, rows: number, columns: number): string[] {
    const imagePaths: string[] = [];
    const prefix = 'VGM001000217_01_n_tile_0_'
    for (let row = 0; row < rows; row++) {
        for (let col = 0; col < columns; col++) {
            const tileName = `${row}_${col}.png`
            const imagePath = path.join(imageDir, tileName);
            if (fs.existsSync(imagePath)) {
                imagePaths.push(imagePath);
            } else {
                console.error(`File not found: ${imagePath}`);
            }
        }
    }
    return imagePaths;
}

//获取切片矩阵大小
function getMatrixSize(dir: string): { maxRow: number, maxCol: number } {
    const files = fs.readdirSync(dir);

    const maxFile = files
        .filter(file => /\d+_\d+\.\w+/.test(file)) // 只保留符合两个数字连接规范的文件
        .reduce((maxFile, currentFile) => {
            const maxMatch = maxFile.match(/\d+/g);
            const currentMatch = currentFile.match(/\d+/g);

            if (!maxMatch || !currentMatch) {
                throw new Error('文件名中缺少数字');
            }

            const [rowA, colA] = maxMatch.map(Number);
            const [rowB, colB] = currentMatch.map(Number);

            // 按行号（第一个数字）和列号（第二个数字）进行比较
            if (rowB > rowA || (rowB === rowA && colB > colA)) {
                return currentFile;
            }
            return maxFile;
        });
    const [maxRowStr, maxColStr] = maxFile.replace('.jpg', '').split('_');

    // 将字符串转换为数字
    const maxRow = parseInt(maxRowStr, 10);
    const maxCol = parseInt(maxColStr, 10);
    if (isNaN(maxRow) || isNaN(maxCol)) {
        throw new Error(`Failed to parse row/col numbers from file: ${maxFile}`);
    }
    return { maxRow: maxRow + 1, maxCol: maxCol + 1 };
}

