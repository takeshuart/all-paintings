import path from "path";
import { catchDbError } from "../utils/decorators.js";
import { VincentLetter } from "./models/VincentLetter.js";
import { DATA_FILES_ROOT } from "@utils/files.js";
import { readJsonSync } from "fs-extra";
import { initDatabase } from "./db2.js";
import { any } from "bluebird";



async function main() {
    await initDatabase()

    const letter = await VincentLetter.findOne({
        where: {letterId: '001'}
    })
    const count= await VincentLetter.findAndCountAll()
    // const l= letter as VincentLetter
    // console.log('count:'+(count)
    console.log(JSON.stringify(letter))

}

/**
 * 把vincentLetters-pretty.json数据导入数据库
 *  {
        "letter_id": "001",
        "sender": { "zh": "文森特·梵高", "en": "Vincent van Gogh" },
        "recipient": { "zh": "提奥·梵高", "en": "Theo van Gogh" },
        "place": { "zh": "海牙", "en": "The Hague" },
        "weekday": { "zh": "星期日", "en": "Sunday" },
        "date": { "zh": "1872年9月29日", "en": "29 September 1872" }
    }
 */
async function importLetters() {
    try {
        await initDatabase()
        const lettersFile = path.join(DATA_FILES_ROOT, '/vincent/vincentLetters-pretty.json')
        const letters = await readJsonSync(lettersFile);

        console.log(`开始处理 ${letters.length} 封信件...`);

        // letters.forEach((l:any)=>{
        //     console.log(l.letter_id)
        // })
        const transformedData = letters.map((letter: any) => {
            //ensure attr not null
            const sender = letter.sender || {};
            const recipient = letter.recipient || {};
            const place = letter.place || {};
            const weekday = letter.weekday || {};
            const date = letter.date || {};
            const letterID = letter.letter_id as string
            const endpoint = letterID.startsWith("RM") ? letterID : 'let' + letterID
            return {
                letterId: letterID,
                senderZh: sender.zh,
                senderEn: sender.en,

                recipientZh: recipient.zh,
                recipientEn: recipient.en,

                placeZh: place.zh,
                placeEn: place.en,

                weekdayZh: weekday.zh,
                weekdayEn: weekday.en,

                dateZh: date.zh,
                dateEn: date.en,

                original: letter.original,
                vglUrl: `https://vangoghletters.org/vg/letters/${endpoint}/letter.html`,
                notes: letter.notes ? JSON.stringify(letter.notes) : undefined
            };
        });
        // console.log(JSON.stringify(transformedData))
        const result = await VincentLetter.bulkCreate(transformedData);

        console.log(`成功插入/创建 ${result.length} 条记录到 vincent_letters 表。`);

    } catch (err) {
        console.error('导入数据时发生错误:', err);
    }
}

main();