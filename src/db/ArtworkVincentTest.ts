import path from 'path';
import { DATA_FILES_ROOT, readFileByLine } from '@utils/files.js';
import { readFileSync, readJsonSync } from 'fs-extra';
import { sleep } from 'openai/core';
import { initDatabase } from './db2.js';


/**
 * 把从vgww抓取的fcode-letters关系更新到数据库
 */
async function importVgwwLetters() {
  initDatabase
  const f = path.join(DATA_FILES_ROOT, '/vincent/vgww-letters.jsonl')
  const rl = readFileByLine(f)
  for await (const l of rl) {
    const json = JSON.parse(l)
    const letters = json.data
    const letterIDs = letters.map((l: any) => l.number).join(',')
    console.log(`${json.fcode}\t ${letterIDs}`)
  //  await VincentArtwork.update({letters: letterIDs}, {where: {fCode: json.fcode}})
    // console.log(`${rows[0]}`)
    sleep(10)
  }
}
// importVgwwLetters();
