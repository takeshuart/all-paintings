
import { sleep } from '../../utils/times.js';
import { initDatabase } from '../../db/db2.js';
import { VincentArtwork } from '../../db/models/VincentArtwork.js';
import { v2 } from '@google-cloud/translate';



/**
 * https://console.cloud.google.com/
 */
const translate = new v2.Translate();

const TARGET_LANG = 'zh-CN';

/**
 * 为Google Translate提供翻译上下文，以告知模型，这是一个艺术类的专有名词。
 * 例如<Wheat Fields with Stacks>，直接翻译为：麦田与堆栈，
 * 嵌在有上下文的句子中，翻译为：麦田与麦捆。
 */
const Translate_CONTEXT_EN = 'The Date of create artwork:\t'
/**
 * 批量翻译文本数组
 * @param texts 包含多段待翻译文本的数组
 * @param targetLanguage Chinese: 'zh-CN'
 */
async function googleTranslate(texts: string[], targetLanguage: string): Promise<string[]> {

    try {
        //results: Array [translate, original]
        //The maximum number of strings is 128.
        const [translations, target] = await translate.translate(texts, targetLanguage);
        const translatedTexts: string[] = Array.isArray(translations) ? translations : [translations];

        return translatedTexts;

    } catch (error) {
        console.error('批量翻译失败:', error);
        throw error;
    }
}


async function main() {
    initDatabase()
    const all: VincentArtwork[] = await VincentArtwork.findAll(({ raw: true }))

    const titles = all
        .filter(e => { return e.collection })
        .map(e => {
            return { id: e.id, collection: e.collection }
        })
    const batchSize = 100
    for (let i = 0; i < titles.length; i += batchSize) {

        const batch = titles.slice(i, i + batchSize);
        const batchIndex = Math.floor(i / batchSize) + 1;

        const titlesWithContext: string[] = batch.map(obj => { return Translate_CONTEXT_EN + obj.collection })
        const translatedTitles: string[] = await googleTranslate(titlesWithContext, TARGET_LANG)

        for (let i = 0; i < translatedTitles.length; i++) {
            // const title = translatedTitles[i] as string
            //remove context， '：' is a chinese character
            let tt = translatedTitles[i].split('：')[1].trim()

            await VincentArtwork.update(
                {
                    collectionZh: tt,
                    
                },
                {
                    where: { id: batch[i].id }
                })
            await sleep(20)
            console.log(`${i}: ${JSON.stringify(batch[i])}\t ${tt}`)
        }
        console.log(`\n[批次 ${batchIndex}] \t (索引 ${i} - ${i + batch.length - 1})`);
        // sleep(500)
        // break;
    }
}



main().catch(err => {
    console.error("\n--- 主程序运行失败 ---", err);
    process.exit(1);
})