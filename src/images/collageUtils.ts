

import sharp from 'sharp';
import { loadVanGoghDataWithImages } from '../loc_file/vangogh_images';
import { col } from 'sequelize';
/**
 * 任意图片集拼接成一张图片
 * @param imagePaths  完整路径
 * @param canvasWidth  画布尺寸
 * @param canvasHeight 
 * @param outputImagePath 
 */
async function createCollage(imagePaths: string[], canvasWidth: number, canvasHeight: number, outputImagePath: string) {
    const imageCount = imagePaths.length;
    const { cols, rows } = calculateGridWithThreshold(imageCount, canvasWidth, canvasHeight, 0.009);

    const cellWidth = canvasWidth / cols;
    const cellHeight = canvasHeight / rows;

    console.log(`rows x cols: ${rows} x ${cols}, Dimension of Cell: ${cellWidth.toFixed(2)} x ${cellHeight.toFixed(2)}`);

    const compositeArray = [];

    for (let i = 0; i < imagePaths.length; i++) {
        const imagePath = imagePaths[i];

        try {
            const resizedImage = await sharp(imagePath)
                .resize(Math.ceil(cellWidth), Math.ceil(cellHeight), { fit: 'cover' })
                .toBuffer();

            const x = (i % cols) * cellWidth;
            const y = Math.floor(i / cols) * cellHeight;

            compositeArray.push({ input: resizedImage, left: Math.floor(x), top: Math.floor(y) });
        } catch (error) {
            console.error(`Error processing ${imagePath}:`, error);
        }
    }

    await sharp({
        create: {
            width: canvasWidth,
            height: canvasHeight,
            channels: 3,
            background: { r: 255, g: 255, b: 255 }
        }
    }).composite(compositeArray)
        .jpeg({ quality: 90 })
        .toFile(outputImagePath);

    console.log(`Collaged image has been saved to ${outputImagePath}`);
}

/**
 * 通过不断减小列数增加行数，计算单元格的最佳尺寸，此时剩余未填充的区域最小。
 * @param threshold 剩余空白的阈值，阈值过小会导致图片裁剪比例失真
 * @returns 
 */
function calculateGridWithThreshold(imageCount: number, canvasWidth: number, canvasHeight: number, threshold: number) {
    let cols = Math.ceil(Math.sqrt(imageCount));
    let rows = Math.ceil(imageCount / cols);
    let emptyAreaRatio = 1; // 初始化空白区域比例

    while (emptyAreaRatio > threshold) {
        const cellWidth = canvasWidth / cols;
        const cellHeight = canvasHeight / rows;

        // 计算最后一行填充情况
        const filledImages = imageCount % cols || cols; // 如果整行填充则返回cols
        const totalArea = canvasWidth * canvasHeight;
        const usedArea = (filledImages * cellWidth * cellHeight) + ((rows - 1) * cols * cellHeight * cellWidth);
        emptyAreaRatio = (totalArea - usedArea) / totalArea;

        // 动态调整列数
        if (emptyAreaRatio > threshold) {
            cols--; // 减少列数
            rows = Math.ceil(imageCount / cols);
        }
    }

    return { cols, rows };
}


(async () => {
    // canvas size
    const outputImagePath = 'c:\\Users\\Administrator\\Downloads\\collage.jpg';
    const vgData = await loadVanGoghDataWithImages()
    const sortedData = vgData
        .filter(item => {
            return item.imagePath 
                && item.jhCode
                && (item.technique == 'painting'|| item.material=='watercolor')
        }).sort((a, b) => {
            const jhA = parseInt(a.jhCode.slice(2), 10);
            const jhB = parseInt(b.jhCode.slice(2), 10);
            return jhA - jhB;
            // return new Date(a.dateStart).getTime() - new Date(b.dateStart).getTime();
        });

    const imagePaths = sortedData.map(item => item.imagePath);
    sortedData.forEach(x => {
        console.log(`${x.jhCode}\t ${x.dateStart}\t`)
    })
    console.log(sortedData.length)
    createCollage(imagePaths, 2400, 3200, outputImagePath)
})().catch((err) => console.error(err));
