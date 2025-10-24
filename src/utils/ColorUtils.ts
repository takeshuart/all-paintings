import convert from 'color-convert';
import DeltaE from 'delta-e';

interface Lab {
    L: number;
    A: number;
    B: number;
}

export interface LabColor {
    l: number; a: number; b: number;
}
//artwork colors json结构
export interface ImageFeature {
    color: [number, number, number];
    ratio: number; // 0-100%
}

export function rgbToLab(rgb: [number, number, number]): LabColor {
    const labArray = convert.rgb.lab(rgb);
    return { l: labArray[0], a: labArray[1], b: labArray[2] };
}

export function calculateDeltaE00(lab1: LabColor, lab2: LabColor): number {
    // 映射到 delta-e 库要求的 { L: L, A: A, B: B } 格式
    const labToDeltaEFormat = (lab: LabColor): Lab => ({ L: lab.l, A: lab.a, B: lab.b });
    
    return DeltaE.getDeltaE00(labToDeltaEFormat(lab1), labToDeltaEFormat(lab2));
}