// vgww-scraper.ts
import fs from "fs";
import path from "path";
import fetch from "node-fetch";
import { VincentArtwork } from "../../db/models/VincentArtwork.js";
import { initDatabase } from "../../db/db2.js";
import { DATA_FILES_ROOT } from "@utils/files.js";

/**
 * vangoghworldwide.org的详情页查询规则：
 * 1.优先使用fCode，如果不存在使用博物馆的id,例如收藏于VGM的作品：/artwork/d0302V1972r
 * 2.展出、信件等详情信息是单独的请求接口：
 * /artwork/p/id/F1482a/e/letters
 * /artwork/p/id/F1482a/e/technical
 * /artwork/p/id/F1482a/e/technical_rce
 * /artwork/p/id/F1482a/e/literature
 * /artwork/p/id/F1482a/e/used_for_exhibition
 * /artwork/p/id/F1482a/e/siblings
 * /artwork/p/id/F1482a/e/provenance
 * url规则：https://rest.spinque.com/4/vangoghworldwide/api/platform/q/{uri}/results?config=production&count=200
 * 
 * ！！！目前仅抓取了artwork_vincent表中用fcode能匹配到的数据。
 * 可能遗漏的内容：
 * 1. artwork_vincent表中的fcode不全，应该用vgww的全集fcode做匹配
 * 2. 没有fcode的数据，应该用博物馆的id尝试匹配。

 */
interface Artwork {
    id: number;
    fCode: string | null;
    museumId?: string | null;
}

// 工具函数：等待 n 毫秒，防止请求过快
const sleep = (ms: number) => new Promise((res) => setTimeout(res, ms));

/**
 * 通用爬虫函数
 * @param fcode fCode 编码
 * @param endpoint 端点，例如 "letters"、"provenance"
 */
async function fetchVGWWData(fcode: string, endpoint: string) {
    const url = `https://rest.spinque.com/4/vangoghworldwide/api/platform/q/artwork/p/id/${fcode}/e/${endpoint}/results?config=production&count=200`;
    try {

        const res:any =null
        //  await fetch(url);
        if (!res.ok) throw new Error(`Request failed: ${res.status}`);
        const data = await res.json();
        return data;
    } catch (err) {
        console.error(url, err)
    }
    return null
}

/**
 * 核心提取函数（以 letters 为例）
 * 可根据 endpoint 改写
 */
function extractLettersInfo(data: any) {
    if (!data?.items || data.items.length == 0) return [];
    const results: any[] = [];

    for (const item of data.items) {
        const tuple = item.tuple?.[0];
        if (!tuple || !tuple.attributes) continue;

        const attr = tuple.attributes;
        const target = attr["target"]?.[0];
        if (!target) continue;
        const title = target["http://schema.org/name"] ?? null
        let date
        if (title) {
            date = extractDateFromTitle(title)
        }
        const letter = {
            title: target["http://schema.org/name"] ?? null,
            url: target["http://schema.org/url"] ?? null,
            number: target["http://schema.org/identifier"] ?? null,
            date: date,
            sender: target["sender"]?.[0]?.["http://schema.org/name"] ?? null,
            recipient: target["recipient"]?.[0]?.["http://schema.org/name"] ?? null,
            location: target["locationCreated"]?.[0]?.["http://schema.org/name"] ?? null,
        }

        results.push(letter)
    }
    return results;
}

function extractDateFromTitle(title: string): string | null {
    const datePatterns = [
        /\bbetween(?: about)? [A-Za-z]+,?\s*(\d{1,2}) (?:and|to) [A-Za-z]+,?\s*(\d{1,2}) ([A-Za-z]+) (\d{4})/i,
        /\b(\d{1,2}).*?(\d{1,2}).*?(\d{1,2}) ([A-Za-z]+) (\d{4})/i,
        /(?:Monday|Tuesday|Wednesday|Thursday|Friday|Saturday|Sunday)?,?\s*(\d{1,2}) ([A-Za-z]+) (\d{4})/i,
        /([A-Za-z]+) (\d{4})/i,
    ];

    for (const pattern of datePatterns) {
        const match = title.match(pattern);
        if (match) {
            return match[0].trim();
        }
    }

    return null;
}


/**
 * 将结果逐行写入 JSONL 文件
 */
function appendToJsonl(filePath: string, record: any) {
    fs.appendFileSync(filePath, JSON.stringify(record) + "\n", "utf8");
}


async function runScraper() {
    const outputFilename = path.join(DATA_FILES_ROOT, "/van gogh/vgww-letters.jsonl");
    const endpoint = "letters";

    await initDatabase()
    const artworks: VincentArtwork[] = await VincentArtwork.findAll()

    console.log(`开始爬取 ${artworks.length} 个作品的 ${endpoint} 数据...`);
    for (const i in artworks) {
        const at = artworks[i]
        const fcode = at.fCode
        if (!fcode || fcode.trim() == '') {
            console.log('没有fCode！ id:' + at.id)
            continue
        }

        try {
            console.log(`[${i}/${artworks.length}] Fetching ${fcode},id:${at.id}`);
            const data = await fetchVGWWData(fcode, endpoint);
            const letters = extractLettersInfo(data);
            if (letters.length == 0) {
                console.log(`没有书信数据:${fcode}`)
                continue
            }
            appendToJsonl(outputFilename, { fcode, data: letters });
            await sleep(500);
        } catch (err) {
            console.error(`Error fetching ${fcode}:`, (err as Error).message);
        }
    }

    console.log("✅ 爬取完成");
}

// runScraper().catch(console.error);
