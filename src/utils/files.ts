import { createReadStream, existsSync, readFileSync } from "fs";
import path, { dirname } from "path";
import * as readline from 'readline';
import { fileURLToPath } from 'url';


//Get the absolute path of current file dynamically.
const CURRENT_FILE = fileURLToPath(import.meta.url);

export const CURRENT_DIR = dirname(CURRENT_FILE);
export const DATA_FILES_ROOT = path.join(CURRENT_DIR, '../../data/')
export const PROJECT_ROOT= path.join(CURRENT_DIR, '../../')

/**
 * 不适合大文件！该方法一次性读取文件，再通过\n分割行。
 * @param path 
 */
function readLines(path: string): string[] {
    return readFileSync(path, 'utf-8').split("\n")
}

/**
 * for await (const line of rl)
 * @param filePath 
 * @returns read file by line interface
 */
export function readFileByLine(filePath: string) {
    if (!existsSync(filePath)) {
        throw new Error(`Error: File not found at path: ${filePath}`);
    }
    const fileStream = createReadStream(filePath, { encoding: 'utf8' });

    //readline interface
    const rl = readline.createInterface({
        input: fileStream,
        crlfDelay: Infinity //  (\n, \r\n)
    });
    return rl
}