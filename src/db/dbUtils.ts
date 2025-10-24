import { ArtworkVincent } from "./ArtworkVincentDAO.js";


export function toSnakeCase(obj: Record<string, any>): Record<string, any> {
  const mappedObj: Record<string, any> = {};

  for (const key in obj) {
    const value = obj[key];
    if (value === undefined) continue;

    //add '_' before Upper letter
    const snakeKey = key.replace(/([A-Z])/g, "_$1").toLowerCase();
    mappedObj[snakeKey] = typeof value === "boolean" ? (value ? 1 : 0) : value;
  }

  return mappedObj;
}

export function toCamelCase(row: Record<string, any>): ArtworkVincent {
    const result: any = {};
    for (const key in row) {
        const camelKey = key.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
        result[camelKey] = row[key];
    }
    return result as ArtworkVincent;
}