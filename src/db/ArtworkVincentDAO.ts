import { catchDbError } from '../utils/decorators.js';
import { dbArtwork } from './db.js';
import { toCamelCase, toSnakeCase } from './dbUtils.js';

export interface ArtworkVincent {
    id?: number;
    titleEn?: string;
    titleZh?: string;
    fCode?: string;
    jhCode?: string;
    collection?: string;
    genre?: string;
    depicts?: string;
    period?: string;
    displayDate?: string;
    locationCity?: string;
    placeOfOrigin?: string;
    dimension?: string;
    isHighlight?: number; // 0 / 1
    shortDesc?: string;
    colorPaletteJson?: string;
    description?: string;
    technique?: string;
    primaryImageSmall?: string;
    primaryImageMedium?: string;
    primaryImageLarge?: string;
    primaryImageOriginal?: string;
    relatedLetters?: string;
    relatedArtwork?: string;
    extLinks?: string;
    exhibitions?: string;
    literature?: string;
    dateStart?: string;
    dateEnd?: string;
    material?: string;
    inventoryCode?: string;
    dataSource?: string;
    colors?:string;
    r?:number;
    g?:number;
    b?:number;
}

const tableName = 'artwork_vincent';

export class ArtworkVincentDao {
    @catchDbError
    insert(item: ArtworkVincent): number {
        const mapped = toSnakeCase(item);
        const keys = Object.keys(mapped).join(', ');
        const values = Object.keys(mapped).map(k => `@${k}`).join(', ');
        const stmt = dbArtwork.prepare(`INSERT INTO ${tableName} (${keys}) VALUES (${values})`);
        const result = stmt.run(mapped);
        return result.lastInsertRowid as number;
    }

    @catchDbError
    insertMany(items: ArtworkVincent[]): number {
        if (items.length === 0) return 0;
        const mappedItems = items.map(i => toSnakeCase(i));
        const keys = Object.keys(mappedItems[0]);
        const columns = keys.join(', ');
        const placeholders = keys.map(k => `@${k}`).join(', ');
        const stmt = dbArtwork.prepare(`INSERT INTO ${tableName} (${columns}) VALUES (${placeholders})`);
        const tx = dbArtwork.transaction((rows: Record<string, any>[]) => {
            for (const row of rows) stmt.run(row);
        });
        tx(mappedItems);
        return mappedItems.length;
    }

    @catchDbError
    getById(id: number): ArtworkVincent | undefined {
        const stmt = dbArtwork.prepare(`SELECT * FROM ${tableName} WHERE id = ?`);
        const row = stmt.get(id) as Record<string, any> | undefined;
        if (!row) return undefined;
        return toCamelCase(row);
    }
    @catchDbError
    getAll(limit = 100): ArtworkVincent[] {
        const stmt = dbArtwork.prepare(`SELECT * FROM ${tableName} LIMIT ?`);
        const rows = stmt.all(limit) as Record<string, any>[];
        return rows.map(toCamelCase);
    }
    @catchDbError
    getOneHighlight(): ArtworkVincent | undefined {
        const stmt = dbArtwork.prepare(`
        SELECT * FROM ${tableName}
        WHERE ishighlight = 1
        ORDER BY RANDOM()
        LIMIT 1
    `);
        const row = stmt.get() as Record<string, any> | undefined;
        if (!row) return undefined;
        return toCamelCase(row);
    }

    @catchDbError
    findByField(field: keyof ArtworkVincent, value: any): ArtworkVincent[] {
        const column = field.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
        const stmt = dbArtwork.prepare(`SELECT * FROM ${tableName} WHERE ${column} = ?`);
        const rows = stmt.all(value) as Record<string, any>[];
        return rows.map(toCamelCase);
    }
    @catchDbError
    findByVgCode(jhCode: string, fCode: string): ArtworkVincent[] {
        let record: ArtworkVincent[] = [];
        if (jhCode) {
            record = this.findByField("jhCode", jhCode)
        }
        if (record.length == 0 && fCode) {
            record = this.findByField("fCode", fCode)
        }
        return record
    }

    @catchDbError
    update(id: number, updateData: Partial<ArtworkVincent>): number {
        const mapped = toSnakeCase(updateData);
        const setClause = Object.keys(mapped).map(k => `${k} = @${k}`).join(', ');
        const stmt = dbArtwork.prepare(`UPDATE ${tableName} SET ${setClause} WHERE id = @id`);
        const result = stmt.run({ ...mapped, id });
        return result.changes;
    }

    @catchDbError
    deleteById(id: number): number {
        const stmt = dbArtwork.prepare(`DELETE FROM ${tableName} WHERE id = ?`);
        const result = stmt.run(id);
        return result.changes;
    }

    /**
 * Update artwork by jh_code or f_code.
 * Priority: first try jh_code, if no match, then try f_code.
 * @param codes Object containing optional jhCode or fCode
 * @param updateData Partial fields to update
 * @returns number of rows changed
 */
    @catchDbError
    updateByJhCodeOrFCode(codes: { jhCode?: string; fCode?: string }, updateData: Partial<ArtworkVincent>): number {
        if (!codes.jhCode && !codes.fCode) {
            throw new Error("Either jhCode or fCode must be provided");
        }

        const mapped = toSnakeCase(updateData);
        const setClause = Object.keys(mapped)
            .map(k => `${k} = @${k}`)
            .join(', ');

        let changes = 0;

        // Try updating by jh_code first
        if (codes.jhCode) {
            const stmtJh = dbArtwork.prepare(
                `UPDATE ${tableName} SET ${setClause} WHERE jh_code = @jh_code`
            );
            const resultJh = stmtJh.run({ ...mapped, jh_code: codes.jhCode });
            changes += resultJh.changes;
        }

        // If no rows changed and fCode exists, try updating by f_code
        if (changes === 0 && codes.fCode) {
            const stmtF = dbArtwork.prepare(
                `UPDATE ${tableName} SET ${setClause} WHERE f_code = @f_code`
            );
            const resultF = stmtF.run({ ...mapped, f_code: codes.fCode });
            changes += resultF.changes;
        }

        return changes;
    }

}