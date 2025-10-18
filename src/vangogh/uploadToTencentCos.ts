import COS from "cos-nodejs-sdk-v5";
import { batchUploadFiles, CosFileTask, uploadFile } from "../tencentCloud/upload";
import * as fs from 'fs';
import * as path from 'path';
import { buildVgKey, extractVgCodeFromFileName } from "./VangoghUtils";
import { ArtworkVincentDao } from "../db/ArtworkVincentDAO";
import { dbArtwork } from "../db/db";
async function main() {

    const eagleBasePath = "E:\\Arts.library"
    const inputDir = "D:\\image test\\vgCollections-medium";
    const files = fs.readdirSync(inputDir);

    const dao = new ArtworkVincentDao()
    try {
        const tasks: CosFileTask[] = []
        for (const file of files) {
            const fullPath = path.join(inputDir, file);
            const { jhCode, fCode } = extractVgCodeFromFileName(file)
            if (jhCode || fCode) {
                const vgKey = buildVgKey(jhCode, fCode)
                const filename = `${vgKey}${path.extname(file)}`
                const cosKey = `/vincent/medium/${filename}`
                console.log(`${cosKey}:\t ${fullPath}`)
                tasks.push({localPath:fullPath,cosKey:cosKey})
                // dao.updateByJhCodeOrFCode(
                //     { jhCode, fCode },
                //     {
                //         primaryImageSmall: "/vincent/small/" + filename,
                //         primaryImageMedium: "/vincent/medium/" + filename,
                //         primaryImageLarge: "/vincent/large/" + filename,
                //     }
                // );
            } else {
                console.log("Cannot find jhCode or fCode:" + file)
            }
            //avoid SQLITE BUSY Error, TODO use task queue
            // new Promise(resolve => setTimeout(resolve, 10));

        }
        await batchUploadFiles(tasks, 10)

    } catch (error) {
        console.error('Fatal Error during initialization or setup:', (error as Error).message);
    }
}

function updateImageUrlToDB(cosUrl: string) {
    const dao = new ArtworkVincentDao()
}

main();
