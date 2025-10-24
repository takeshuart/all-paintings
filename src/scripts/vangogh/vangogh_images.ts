import { readJsonSync } from "fs-extra"
import path from "path"
import { ArtWork } from "../crawlers/artwork.js"
import { DATA_FILES_ROOT } from "@utils/files.js";


const vgwwFile = path.join(DATA_FILES_ROOT, './van gogh/merge-vgww-pubhist-vggallery.json');
const vgImagesDir = 'd:\\Node.js\\paintings-website\\public\\all-collections';


export function searchVgConditions(file: string): Boolean {
    const fileName = path.basename(file)
    if (!fileName.startsWith('JH')) {
        return false
    }
    const jhCode = fileName.split('_') ? fileName.split('_')[0] : ''
    const info = loadVGDataByJHKey().get(jhCode)
    if (info
        && info.technique == 'painting'
        // && info.genre=='肖像画'
        // && info.series=='盛开的果园'
        // && info.placeOfOrigin == 'Paris'
    ) {
        return true
    }
    return false
}
export function loadVGDataByJHKey(): Map<string, any> {
    const all = readJsonSync(vgwwFile)
    const jhCodeMap = new Map<string, string>()
    all.forEach((item: any) => {
        const jhCode = item.jhCode
        if (jhCode && !jhCodeMap.has(jhCode)) {
            jhCodeMap.set(jhCode, item)
        }
    })
    return jhCodeMap
}

export function loadVGData(): any[] {
    return readJsonSync(vgwwFile)

}

export function getJHCodeFromFile(fileName: string) {
    const [jhCode] = fileName.split('_')
    if (!jhCode.startsWith('JH')) {
        return jhCode
    }
    return ''
}


interface Artwork {
    title: string;
    jhcode?: string;
    [key: string]: any;
    fileName: string //TODO 定义一个图片文件命名规范JHCode_-_FCode_-_Title_-_Date_-_Place_-_Collection.ext 
}


