import * as fs from 'fs';
import sharp from 'sharp';
import * as path from 'path';
import Vibrant from 'node-vibrant';

import { findFiles } from 'loc_file/loc_files';
import { loadVgwwData } from '../crawlers/fetch-kroller-muller-museum'
import { Palette } from '@vibrant/color';
import { searchVgConditions } from '../vangogh/vangogh_images';

/**
 * 拼接九宫格图片
 * @param files 
 * @param outputPath 
 */
async function createCollage(files: string[], outputPath: string) {
    try {

        //random select 9 images 
        const selectedImages: string[] = [];
        while (selectedImages.length < 9) {
            const randomIndex = Math.floor(Math.random() * files.length);
            const selectedImage = files[randomIndex];

            if (!selectedImages.includes(selectedImage)) {
                selectedImages.push(selectedImage);
            }
        }
        //压缩为400x400，非1:1图片会居中裁剪，如果不希望裁剪可以用resize的fit属性：
        // {fit: 'contain',background: { r: 255, g: 255, b: 255 } }
        const images = await Promise.all(selectedImages.map(file =>
            sharp(file).resize(400, 533).toBuffer()
        ));

        //画布
        const collage = sharp({
            create: {
                width: 1200,
                height: 1600,
                channels: 3,
                background: { r: 255, g: 255, b: 255 }
            }
        });

        const positions = [
            { left: 0, top: 0 }, { left: 400, top: 0 }, { left: 800, top: 0 },
            { left: 0, top: 533 }, { left: 400, top: 533 }, { left: 800, top: 533 },
            { left: 0, top: 1066 }, { left: 400, top: 1066 }, { left: 800, top: 1066 },
        ];

        const compositeOperations = images.map((image, index) => {
            const { left, top } = positions[index];
            return { input: image, left, top };
        });

        // Perform composite operation in a single call
        await collage.composite(compositeOperations).toFile(outputPath);

        console.log('Collage created successfully:', outputPath);
    } catch (error) {
        console.log(error)
    }
}
//图片主色
/**
 * Vibrant：最明显和最常见的颜色十六进制
 * Muted：相对柔和的颜色。
 * DarkVibrant：较深的鲜艳颜色。
 * DarkMuted：较深的柔和颜色。
 * LightVibrant：较浅的鲜艳颜色。
 * @param imagePath 
 * @returns 
 */
async function getDominantColor(imagePath: string): Promise<Palette> {
    try {
        const palette = await Vibrant.from(imagePath).getPalette();

        return palette
        // console.log('Palette:', {
        //     Vibrant: palette.Vibrant.hex,
        //     Muted: palette.Muted.hex,
        //     DarkVibrant: palette.DarkVibrant.hex,
        //     DarkMuted: palette.DarkMuted.hex,
        //     LightVibrant: palette.LightVibrant.hex,
        // });
    } catch (error) {
        console.error('Error extracting colors:', error);
        throw error
    }
}

function isYellow(colorHex: string): boolean {
    //Hex to RGB
    const r = parseInt(colorHex.slice(1, 3), 16);
    const g = parseInt(colorHex.slice(3, 5), 16);
    const b = parseInt(colorHex.slice(5, 7), 16);

    return (r > 150 && g > 150 && b < 100);
}
/**
 * 
 * @returns  >150 较亮
 */
async function calculateBrightness(imagePath: string) {
    const { data, info } = await sharp(imagePath).raw().ensureAlpha().toBuffer({ resolveWithObject: true });
    let totalBrightness = 0;
    const pixelCount = info.width * info.height;

    for (let i = 0; i < data.length; i += 4) {
        // 计算每个像素的亮度
        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];
        totalBrightness += (0.2126 * r + 0.7152 * g + 0.0722 * b); // 使用加权亮度公式
    }

    return totalBrightness / pixelCount;
}

//random
function shuffleArray(array: any[]) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

const outputPath = 'D:\\Arts\\collage'
const allCollections = 'D:\\Node.js\\paintings-website\\public\\all-collections';

(async () => {
    const dir = path.join(allCollections, '/')
    let files = (await findFiles(dir))
        .filter(file => /\.(jpg|jpeg|png)$/.test(file))
        .filter(file => searchVgConditions(file))
    // .filter(f =>vgSearchConditions(path.basename(f)))
    // .filter(async file => {
    //     const hex = (await getDominantColor(file)).Vibrant?.hex
    //     if (hex) {
    //         return  isYellow(hex)
    //     }
    // })

    files = shuffleArray(files)

    if (files.length < 9) {
        console.log('图片数量不足:' + files.length)
        return
    }
    for (let index = 0; index < 5; index++) {
        createCollage(files, path.join(outputPath, `collage_${Math.random()}.jpg`))

    }
})()
