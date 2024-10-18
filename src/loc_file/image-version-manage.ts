import fs from 'fs';
import path from 'path';
import util from 'util';
import { findFiles } from './loc_files';


//处理梵高不同版本图片

const readdir = util.promisify(fs.readdir);
const rename = util.promisify(fs.rename);

const sourceDir = 'd:\\Node.js\\paintings-website\\public\\all-collections';
const targetDir = path.join(sourceDir, '/otherVersions'); // 转移文件的目标文件夹

if (!fs.existsSync(targetDir)) {
    fs.mkdirSync(targetDir);
}

async function processImages() {
    const files = (await findFiles(sourceDir)).filter(f => { return (path.basename(f)).startsWith('JH') });
    const fileGroups: { [key: string]: string[] } = {};
    //group by JHCode
    files.forEach(file => {
        const [jhCode] = file.split('_');
        if (!fileGroups[jhCode]) {
            fileGroups[jhCode] = [];
        }
        fileGroups[jhCode].push(file);
    });

    for (const jhCode in fileGroups) {
        const versions = fileGroups[jhCode];

        if (versions.length > 1) {
            //优先保留的文件
            let fileToKeep = versions.find(file => /(KMM|VGM|Orsay|Museum)/.test(file)) 
            || versions.find(file => /(Google|Christies)/.test(file))
            || versions[0];

            //add version tag in filename
            //v1\v2\v3 version
            const newName = fileToKeep.replace(/(\.[\w\d]+)$/, '_-_v1$1')
            await rename(fileToKeep, newName);
            console.log(`Renamed to ${path.basename(newName)}`);

            let versionCount = 2;
            for (let index = 0; index < versions.length; index++) {
                const oldPath = versions[index];
                if (oldPath !== fileToKeep) {
                    const ext = path.extname(oldPath)
                    const newName = `${path.basename(oldPath, ext)}_-_v${versionCount}${ext}`;
                    const newPath = path.join(targetDir, newName);
                    await rename(oldPath, newPath);
                    console.log(`moved to ${newName}`);
                    versionCount++;
                }
            }
        }
    }
}

console.log('Processing completed.');


// processImages().catch(err => console.error(err));
