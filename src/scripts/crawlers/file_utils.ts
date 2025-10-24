import * as fs from 'fs';
import * as path from 'path';
import { dataBasePath } from './wikipage.js';
import * as crypto from 'crypto';
import { promisify } from 'util';
import sizeOf from 'image-size';
import { downloadFile } from '../../utils/https.js'
import { json } from 'stream/consumers';
import { exec } from 'child_process';
import fsExtra from 'fs-extra';
import { exec as execCallback } from 'child_process';
import winattr from 'winattr';

const vgallDir = 'D:\\Arts\\Van Gogh\\all-collections';

// modifyFileTag()

// //修改windows文件的tag
// async function modifyFileTag() {
//     const p = path.join(dataBasePath, './van gogh/van_gogh_catlog_watercolor.json')
//     const catlogs = readJsonFile(p)
//     const jhNumbers=new Set<string>()
//     for(const catlog of catlogs){
//         jhNumbers.add(catlog.jh_number)
//     }
//     const attrs: Partial<winattr.Attrs> = {
//         tags: ['']
//     };
//     winattr.set("",,(err)=>{})

//     fs.readdirSync(vgallDir).forEach((value,index)=>{
//         const file=String(value)
//         if(file.startsWith('JH')){
//             const catNo = file.substring(0,file.indexOf('_', file.indexOf('_') + 1));
//             const jhNumber= catNo.split('_')[0]
//             if(jhNumbers.has(jhNumber)){

//                 console.log(catNo)
//             }
//     }
//     })
// }


//文件查重
function mapJhnumberToFnumber() {

    const vgall = 'D:\\Arts\\Van Gogh\\A梵高油画全集';
    const catlogs = readVanGoghCatlogs();

    fs.readdirSync(vgall).forEach((file, index) => {
        if (!file.includes('F000')) {
            return;
        }
        const jhNumber = file.split('_')[0]
        const fNumber = catlogs.get(jhNumber)
        if (fNumber) {
            const newName = file.replace('F000', fNumber)
            const oldPath = path.join(vgall, file)
            const newPath = path.join(vgall, newName)
            fs.renameSync(oldPath, newPath)
            console.log(`重命名文件：${file} -> ${newName}`)
        }
    })
}

function renameImageFile() {
    const imageDir = 'D:\\Arts\\Van Gogh\\Google Art Project';

    const file = path.join(dataBasePath, './wiki/fulldata-Google_Art_Project_works_by_Vincent_van_Gogh.jsonl')
    const fulldata = fs.readFileSync(file, 'utf-8')
    const jsonworks = JSON.parse(fulldata)


    //重新命名图片文件
    fs.readdir(imageDir, (err, files) => {
        if (err) {
            console.error('Error reading directory:', err);
            return;
        }
        files.forEach(file => {
            if (!file.startsWith('undefined')) { return; }

            try {

                const secondUnderscoreIndex = file.indexOf('_', file.indexOf('_') + 1);
                const oldName = file.substring(secondUnderscoreIndex + 1);

                // 在 jsonworks 中找到匹配的 file_name
                const matchingWork = jsonworks.find((work: any) => {
                    return oldName == work.file_name
                });

                const pattern = /(F|JH)\d+/g;
                let matches;
                if (matchingWork.notes) {
                    matches = matchingWork.notes.match(pattern);
                }
                if (!matches && matchingWork.references) {
                    matches = matchingWork.references.match(pattern);
                }

                if (!matches) {
                    return;
                }
                // 只取 matches 的前两个元素
                const only2 = matches.slice(0, 2);

                for (const m of only2) {
                    if (m.startsWith("F")) {
                        matchingWork.f_number = m;
                    } else if (m.startsWith("JH")) {
                        matchingWork.jh_number = m;
                    }
                };

                const newFileName = matchingWork.jh_number + '_' + matchingWork.f_number + '_' + matchingWork.file_name;

                const oldPath = path.join(imageDir, file);
                const newPath = path.join(imageDir, newFileName);
                console.log(`oldName:${oldName}; newName:${newFileName}`)

                fs.rename(oldPath, newPath, err => {
                    if (err) {
                        console.error('Error renaming file:', err);
                    } else {
                        console.log('File renamed successfully:', newPath);
                    }
                });

            } catch (err) {
                console.log(file + '\n' + err)
            }
        });

    });

}

function diffImageByMd5() {
    // 替换为你的目录路径
    const dir1 = 'dir1';
    const dir2 = 'D:\\Arts\\Van Gogh\\wiki-The New Complete Van Gogh';

    // 创建目录 dir3（如果不存在）
    const dir3 = 'dir3';
    if (!fs.existsSync(dir3)) {
        fs.mkdirSync(dir3);
    }

    // 处理两个目录
    traverseAndProcessDirectory(dir1)
        .then(() => traverseAndProcessDirectory(dir2))
        .catch(err => console.error(err));
}



const readdir = promisify(fs.readdir);
const stat = promisify(fs.stat);
const rename = promisify(fs.rename);

// 用于存储文件的 MD5 哈希值和路径的映射
const fileHashes: { [key: string]: string } = {};

// 计算文件的 MD5 哈希值
function calculateMD5(filePath: string): string {
    const hash = crypto.createHash('md5');
    const fileData = fs.readFileSync(filePath);
    // hash.update(fileData);
    return hash.digest('hex');
}

// 遍历目录并处理文件
async function traverseAndProcessDirectory(directory: string): Promise<void> {
    const files = await readdir(directory);
    for (const file of files) {
        const filePath = path.join(directory, file);
        const fileStat = await stat(filePath);
        if (fileStat.isDirectory()) {
            await traverseAndProcessDirectory(filePath);
        } else {
            const md5 = calculateMD5(filePath);
            if (fileHashes[md5]) {
                // 如果文件已经存在于 fileHashes 中，则表示它是重复的，移动到新目录
                const destinationPath = path.join('dir3', file);
                await rename(filePath, destinationPath);
                console.log(`Moved duplicate file ${filePath} to ${destinationPath}`);
            } else {
                // 将文件的哈希值和路径存储到 fileHashes 中
                fileHashes[md5] = filePath;
            }
        }
    }
}




async function downlodFile() {
    const outputDir = 'D:\\Arts\\Van Gogh\\wiki-The New Complete Van Gogh';
    const p = path.join(dataBasePath, './wiki/Catalog-The New Complete Van Gogh.jsonl')
    const jsons = readJsonFile(p);

    for (let i = 0; i < jsons.length; i++) {
        const at = jsons[i]
        try {
            if (!at.primaryImageSmall) {
                continue;
            }
            const originImageUrl = modifyWikiImageUrl(at.primaryImageSmall)
            var title = decodeURIComponent(originImageUrl.substring(originImageUrl.lastIndexOf('/') + 1));
            const fileName = `${at.catlog}_F000_${title}`
            const outputPath = path.join(outputDir, fileName)
            await downloadFile(originImageUrl, outputPath)
            console.log(`下载进度：${i}/${jsons.length}; ${fileName}`)

        } catch (err) {
            console.log(err + '\t' + at)
        }

    }
}

//从wikimedia预览图url中提取原图url
function modifyWikiImageUrl(url: string) {
    var modifiedUrl = url.substring(0, url.lastIndexOf('/'));
    modifiedUrl = modifiedUrl.replace("/thumb", "");
    return modifiedUrl;
}


function readJsonFile(path: string) {
    const jsons = fs.readFileSync(path, 'utf-8')
    return JSON.parse(jsons)
}


function readVanGoghCatlogs() {
    const uniquevgCatlogFile = path.join(dataBasePath, 'van_gogh_catlog.json');
    const catnoMap = readJsonFile(uniquevgCatlogFile)
    const newMap = new Map<string, string>();

    for (const key of Object.keys(catnoMap)) {
        const stringKey = String(key);
        newMap.set(stringKey, catnoMap[stringKey])
    }
    return newMap
}
function noDupCatlog() {

    const newvgCatlogFile = path.join(dataBasePath, 'van_gogh_catlog.json');
    const uniquevgCatlogFile = path.join(dataBasePath, 'van_gogh_catlog.json');
    const catnoMap = readJsonFile(newvgCatlogFile)

    const uniqueKeys = new Set<string>();
    const newMap = new Map<string, string>();

    for (const key of Object.keys(catnoMap)) {
        const stringKey = String(key);
        if (uniqueKeys.has(stringKey)) {
            console.log(`重复${stringKey}`)
        } else {
            uniqueKeys.add(stringKey)
            newMap.set(stringKey, catnoMap[stringKey])
        }
    }
    const obj: any = {};
    newMap.forEach((value, key) => {
        obj[key] = value;
    });
    fs.writeFile(uniquevgCatlogFile, JSON.stringify(obj), 'utf8', function (err) { })
    console.log(JSON.stringify(obj))
}