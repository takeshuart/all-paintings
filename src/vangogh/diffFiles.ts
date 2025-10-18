import { ArtworkVincent, ArtworkVincentDao } from "../db/ArtworkVincentDAO";
import { EagleItem, getAllItemsOfPath } from "../images/eagleApi";
import { extractVgCodeFromFileName } from "./VangoghUtils";


async function diff() {
    const items: EagleItem[] = await getAllItemsOfPath("/Vincent/Collections");
    const dao = new ArtworkVincentDao()
    const matched: ArtworkVincent[] = [];
    const unmatched: ArtworkVincent[] = [];
    for (const item of items) {
        const { jhCode, fCode } = extractVgCodeFromFileName(item.fileName)
        // console.log(`${jhCode}\t${fCode}`)
        let record: ArtworkVincent[] = dao.findByVgCode(jhCode,fCode)
    
        if (record.length > 0) {
            console.log(record[0].jhCode+"\t"+record[0].fCode)
            matched.push(...record);
        } else {
            console.log(`unmatched:\t${item.fileName}`)
            // unmatched.push(record);
        }

    }


    console.log(matched.length)

}

diff()