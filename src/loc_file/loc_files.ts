import * as fs from 'fs';
import * as path from 'path';
import { ArtWork } from '../crawlers/artwork';
import sharp from 'sharp';
import { readJsonSync } from 'fs-extra';

type FileCondition = (filePath: string, stat: fs.Stats) => boolean | Promise<boolean>;
const dataBasePath = path.join(__dirname, '../../data/')
const vgwwFile = path.join(dataBasePath, './van gogh/merge-vgww-pubhist-vggallery.json');


/**
 * @param directory 
 * @param condition 接受一个过滤文件的条件函数
 * @returns 
 */
export async function findFiles(directory: string, condition?: FileCondition): Promise<string[]> {
    const results: string[] = [];

    const files = await fs.promises.readdir(directory);

    for (const file of files) {
        const filePath = path.join(directory, file);

        try {
            const stat = await fs.promises.stat(filePath);

            if (stat.isDirectory()) {
                const nestedResults = await findFiles(filePath, condition);
                results.push(...nestedResults);
            } else {
                if (condition) {
                    const isMatch = await condition(filePath, stat);
                    if (isMatch) {
                        results.push(filePath);
                    }
                } else {
                    results.push(filePath)
                }
            }
        } catch (error) {
            console.error(`Error processing file: ${filePath}`, error);
        }
    }

    return results;
}

/**
 * @param resizePercentage  0.5 
 */
async function resizeAndConvertToJPG(inputPath: string, outputPath: string, resizePercentage: number): Promise<void> {
    try {
        const metadata = await sharp(inputPath).metadata();

        if (metadata.width && metadata.height) {
            const newWidth = Math.floor(metadata.width * resizePercentage);
            const newHeight = Math.floor(metadata.height * resizePercentage);

            // Resize and convert to JPEG
            await sharp(inputPath)
                .resize(newWidth, newHeight)
                .jpeg({ quality: 100 })
                .toFile(outputPath);

            console.log(`Converted and resized image saved to: ${outputPath}`);
        } else {
            console.error('Failed to get image dimensions.');
        }
    } catch (error) {
        console.error(`Error processing image: ${error}`);
    }
}

/**
 * @param resizePercentage  0.5 
 */
async function resizeImage(inputPath: string, outputPath: string, resizePercentage: number): Promise<void> {
    try {
        const metadata = await sharp(inputPath).metadata();

        if (metadata.width && metadata.height) {
            const newWidth = Math.floor(metadata.width * resizePercentage);
            const newHeight = Math.floor(metadata.height * resizePercentage);

            // Resize the image and save it temporarily
            await sharp(inputPath)
                .resize(newWidth, newHeight)
                .toFile(outputPath);

            console.log(`Resized image saved to: ${outputPath}`);
        } else {
            console.error('Failed to get image dimensions.');
        }
    } catch (error) {
        console.error(`Error resizing image: ${error}`);
    }
}

// Function to convert an image (e.g., PNG) to JPG format
async function convertToJpg(inputPath: string, outputPath: string, quality: number = 80): Promise<void> {
    try {
        // Convert image to JPEG format
        await sharp(inputPath)
            .jpeg({ quality })
            .toFile(outputPath);

        console.log(`Converted image saved as JPG to: ${outputPath}`);
    } catch (error) {
        console.error(`Error converting image to JPG: ${error}`);
    }
}



async function renameFile(sourcePath: string, destinationPath: string): Promise<void> {
    try {
        await fs.promises.rename(sourcePath, destinationPath);
        console.log(`File moved from ${sourcePath} to ${destinationPath}`);
    } catch (error) {
        console.error(`Error moving file from ${sourcePath} to ${destinationPath}:`, error);
    }
}
async function fileSize(filePath: string): Promise<Number> {
    return (await fs.promises.stat(filePath)).size;
}

const isLargeFile: FileCondition = (filePath, stat) => {
    const SIZE_THRESHOLD = 10 * 1024 * 1024;
    return stat.size > SIZE_THRESHOLD;
};
export function loadVincentData(): Map<string, any> {
    const all = readJsonSync(vgwwFile)
    const jhCodeMap = new Map<string, string>()
    all.forEach((item: any) => {
        const jhCode = item.jhCode
        if (jhCode && !jhCodeMap.has(jhCode)) {
            jhCodeMap.set(jhCode, item)
        }
    })
    return jhCodeMap
}

(async () => {
    const allCollections = 'D:\\Node.js\\paintings-website\\public\\all-collections';
    const files = await findFiles(allCollections)
    const jhCodeMap = new Map<string, string>()
    files.forEach((f: any) => {
        const jhCode= path.basename(f).split("_")[0]
        if (jhCode && !jhCodeMap.has(jhCode)) {
            jhCodeMap.set(jhCode, f)
        }
    })
    console.log(files.length)
})();

async function renameByCondition() {
    const allCollections = 'D:\\Node.js\\paintings-website\\public\\all-collections';
    const str = '_tif'
    try {
        const largeFiles = await findFiles(allCollections, (file, stat) => {
            return file.includes(str)
        });
        let search = ''
        for (let f of largeFiles) {
            //path.extname(f)
            let fileName = path.basename(f);
            const newName = fileName.replace(str, '')
            // await renameFile(f, path.join(allCollections, newName))
            console.log(`${fileName}\t${newName}`)

        };
    } catch (error) {
        console.error('Error:', error);
    }
}