/**
 * Extract JH and F codes from complex Vincent file names.
 * Examples it can handle:
 *  - "JHAdd. 3_F_-_Oliviers.jpg" => { jhCode: "JHAdd. 3", fCode: "" }
 *  - "JHjuv. 14_-_F834_-_L'Angélus.jpg" => { jhCode: "JHjuv. 14", fCode: "F834" }
 *  - "JHJuv. 9_-_FXXXI_-_House.jpg" => { jhCode: "JHJuv. 9", fCode: "FXXXI" }
 *  - "JHAdd. 21_-_F_-_Landscape.jpg" => { jhCode: "JHAdd. 21", fCode: "F" }
 */
export function extractVgCodeFromFileName(fileName: string): { jhCode: string; fCode: string } {

    const regex = /^JH([A-Za-z0-9. ]*)[\-_ ]*F([A-Za-z0-9. ]*)/i;
    const match = fileName.match(regex);

    let jhCode = '';
    let fCode = '';

    if (match) {
        const rawJh = match[1].trim();
        const rawF = match[2].trim();

        if (rawJh) jhCode = `JH${rawJh}`;
        if (rawF) fCode = `F${rawF}`;
    }

    return { jhCode, fCode };
}

/**
 * JHcode-Fcode -> JHcode -> Fcode
 * @param jh_code 
 * @param f_code 
 * @returns 
 */
export function buildVgKey(jh_code?: string | null, f_code?: string | null): string {
    let vgcode = '';

    if (jh_code && f_code) {
        vgcode = `${jh_code}-${f_code}`;
    } else if (jh_code) {
        vgcode = jh_code;
    } else if (f_code) {
        vgcode = f_code;
    }

    return vgcode;
}
