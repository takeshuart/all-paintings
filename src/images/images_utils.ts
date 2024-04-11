import * as cv from 'opencv4nodejs';
import * as fs from 'fs';
import { promisify } from 'util';

//识别图片的主要颜色

// 将读取图片封装为异步函数
const readFileAsync = promisify(fs.readFile);

async function findDominantColor(imagePath: string, k = 4): Promise<number[]> {
    const img = await cv.imreadAsync(imagePath);
    
    // 将图像转换为一维数组
    const pixels = img.getDataAsArray().flat().map(pixel => [pixel.r, pixel.g, pixel.b]);
    
    // 使用 k-means 算法聚类像素
    const criteria = new cv.TermCriteria(cv.TermCriteria.EPS + cv.TermCriteria.MAX_ITER, 200, 0.1);
    const { labels, centers } = cv.kmeans(pixels, k, criteria, 10, cv.KMEANS_RANDOM_CENTERS);
    
    // 找出最频繁出现的中心颜色
    const counts = new Map<number, number>();
    labels.forEach(label => {
        counts.set(label, (counts.get(label) || 0) + 1);
    });
    const dominantLabel = Array.from(counts.entries()).reduce((a, e ) => e[1] > a[1] ? e : a, [])[0];
    const dominantColor = centers.getRow(dominantLabel);
    
    return dominantColor;
}

// 测试
const imagePath = 'D:\\Arts\\Van Gogh\\A梵高油画全集\\JH1259_F276_Lane in Voyer d´Argenson Park at Asnieres_tif.jpg'; // 替换为你的图片路径
findDominantColor(imagePath)
    .then(dominantColor => {
        console.log('Dominant Color (BGR):', dominantColor);
    })
    .catch(err => {
        console.error('Error:', err);
    });
