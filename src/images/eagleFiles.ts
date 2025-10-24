import { json } from "sequelize";
import { ArtworkVincentDao } from "../db/ArtworkVincentDAO.js";
import { extractVgCodeFromFileName } from "../scripts/vangogh/VangoghUtils.js";
import { EagleItem, getAllItemsOfPath } from "./eagleApi.js";


//处理色彩信息
async function extractColors() {
    const dao = new ArtworkVincentDao()
    const items: EagleItem[] = await getAllItemsOfPath("/Vincent/Collections");
    for (const item of items) {
        const maincolor: number[] = computeMainColor(item.palettes)
        const [r, g, b] = maincolor
        const { jhCode, fCode } = extractVgCodeFromFileName(item.name)
        // VincentArtwork
        console.log(`${r},${g},${b} ${jhCode} / ${fCode}`)
        dao.updateByJhCodeOrFCode({ jhCode, fCode },
            {
                colors: JSON.stringify(item.palettes),
                r: r,
                g: g,
                b: b
            })
        
    }
}


function computeMainColor(colorData: any[]): number[] {
    const dominant = colorData.reduce((max, c) => (c.ratio > max.ratio ? c : max));
    return dominant.color;
}

extractColors()