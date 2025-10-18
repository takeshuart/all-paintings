import { dbArtwork } from './db';


const tableName = "artwork_image"

export interface ArtworkImage {
    id?: number;
    artworkId: number;
    artworkCode?: string;
    imgSpec?: "small" | "medium" | "large" | "original"
    ext: string;
    qualityRating?: "high" | "medium" | "low" | "blur";
    source?: string;
    cosUrl: string;
    widthPx?: number;
    heightPx?: number;
    fileSizeBytes?: number;
    createdAt?: string;
    updatedAt?: string;
}

export class ArtworkImageDao {
    insertMany(images: ArtworkImage[]): number {
        if (images.length === 0) return 0;

        const now = new Date().toISOString();

        const mappedImages = images.map(img => {
            const image = {
                ...img,
                createdAt: img.createdAt ?? now,
                updatedAt: img.updatedAt ?? now,
            };
            return mapObjectKeysToSnakeCase(image);
        });

        const keys = Object.keys(mappedImages[0]);
        const columns = keys.join(', ');
        const placeholders = keys.map(k => `@${k}`).join(', ');
        const stmt = dbArtwork.prepare(`INSERT INTO ${tableName} (${columns}) VALUES (${placeholders})`);

        // 使用事务提升性能
        const insertManyTransaction = dbArtwork.transaction((items: Record<string, any>[]) => {
            for (const item of items) {
                stmt.run(item);
            }
        });

        insertManyTransaction(mappedImages);

        return mappedImages.length;
    }

    insert(image: ArtworkImage): number {
        image.createdAt = new Date().toISOString();
        image.updatedAt = new Date().toISOString();
        const mapped = mapObjectKeysToSnakeCase(image);
        const keys = Object.keys(mapped).join(', ');
        const values = Object.keys(mapped).map(k => `@${k}`).join(', ');

        const stmt = dbArtwork.prepare(`INSERT INTO ${tableName} (${keys}) VALUES (${values})`);
        const result = stmt.run(mapped);
        return result.lastInsertRowid as number;
    }

    getById(id: number): ArtworkImage | undefined {
        const stmt = dbArtwork.prepare(`SELECT * FROM ${tableName} WHERE id = ?`);
        return stmt.get(id) as ArtworkImage;
    }

    getByArtworkId(artworkId: number): ArtworkImage[] {
        const stmt = dbArtwork.prepare(`SELECT * FROM ${tableName} WHERE artwork_id = ?`);
        return stmt.all(artworkId) as ArtworkImage[]
    }

    update(id: number, data: Partial<ArtworkImage>): number {
        const mapped = mapObjectKeysToSnakeCase(data);
        const fields = Object.keys(mapped).map(k => `${k} = @${k}`).join(', ');
        const stmt = dbArtwork.prepare(`
      UPDATE ${tableName}
      SET ${fields}, updated_at = @updated_at
      WHERE id = @id
    `);
        const result = stmt.run({ ...mapped, updated_at: new Date().toISOString(), id });
        return result.changes;
    }

    delete(id: number): number {
        const stmt = dbArtwork.prepare(`DELETE FROM artwork_image WHERE id = ?`);
        const result = stmt.run(id);
        return result.changes;
    }
}



function toSnakeCase(str: string): string {
    return str.replace(/([A-Z])/g, "_$1").toLowerCase();
}

function mapObjectKeysToSnakeCase(obj: Record<string, any>): Record<string, any> {
    const mappedObj: Record<string, any> = {};
    Object.keys(obj).forEach((key) => {
        if (obj[key] !== undefined) { // 排除未赋值的字段
            // sqlite3不支持boolean类型
            if (typeof obj[key] === 'boolean') {
                mappedObj[toSnakeCase(key)] = obj[key] ? 1 : 0;
            } else {
                mappedObj[toSnakeCase(key)] = obj[key];
            }
        }
    });
    return mappedObj;
}
