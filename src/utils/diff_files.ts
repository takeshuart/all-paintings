import * as fs from 'fs';
import * as path from 'path';
import * as crypto from 'crypto';
import { promisify } from 'util';

const readdir = promisify(fs.readdir);
const stat = promisify(fs.stat);
const rename = promisify(fs.rename);

//比较两个目录的文件，把重复文件移动到新目录中

const dir1 = 'D:\\Arts\\Van Gogh\\wiki-The New Complete Van Gogh';
const dir2 = 'D:\\Arts\\Van Gogh\\A梵高油画全集';

const dir3 = 'D:\\Arts\\Van Gogh\\重复文件';
if (!fs.existsSync(dir3)) {
    fs.mkdirSync(dir3);
}

// 处理两个目录
traverseAndProcessDirectory(dir2)
    .then(() => {
        // 处理 dir1 目录
        return traverseAndProcessDirectory(dir1);
    })
    .catch(err => console.error(err));


// 用于存储 dir2 中文件的 MD5 哈希值
const dir2FileHashes: Set<string> = new Set();

// 计算文件的 MD5 哈希值
function calculateMD5(filePath: string): string {
    const hash = crypto.createHash('md5');
    const fileData = fs.readFileSync(filePath);
    hash.update(fileData);
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
            if (dir2FileHashes.has(md5)) {
                // 如果文件的 MD5 哈希值在 dir2 中存在，则表示它是重复的，移动到新目录
                const destinationPath = path.join(dir3, file);
                await rename(filePath, destinationPath);
                console.log(`Moved duplicate file ${filePath} to ${destinationPath}`);
            } else {
                // 将文件的 MD5 哈希值添加到 dir2FileHashes 中
                dir2FileHashes.add(md5);
            }
        }
    }
}

