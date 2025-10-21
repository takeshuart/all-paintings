import express from "express";
import Database from "better-sqlite3";


const router = express.Router();
const db = new Database('artwork.db');

router.get('/data', (req: any, res) => {
    // 获取分页参数
    try {
        const page = parseInt(req.query.page) || 0;
        const pageSize = parseInt(req.query.pageSize) || 5;
        const artMovements: string[] = req.query.artMovements || []

        console.log(`request:${req.query}`)

        // page number from 1
        const offset = page-1 * pageSize;

        // 查询当前页的数据
        const querySql = buildSqlQuery(artMovements)
        const dataStmt = db.prepare(querySql);
        const data = dataStmt.all(pageSize, offset);

        const countSql = buildSqlQuery(artMovements,true)
        const countStmt = db.prepare(countSql); 
        const total = countStmt.get() as { total_count: number };
        res.json({ data, total });
    } catch (error) {
        res.status(500).json({ error: `Internal server error.\t ${error}` });
    }
});

function buildSqlQuery(artMovementsSelected:string[], isCountQuery = false) {
    let baseSql = isCountQuery ? 'SELECT COUNT(*) AS total FROM art_work' : 'SELECT * FROM art_work';
    let whereClauses = [];

    if (artMovementsSelected && artMovementsSelected.length > 0) {
        const likeClauses = artMovementsSelected.map(term => `(',' || art_movement || ',' LIKE '%,${term},%')`);
        whereClauses.push(likeClauses.join(' AND '));
    }

    if (whereClauses.length > 0) {
        baseSql += ' WHERE ' + whereClauses.join(' AND ');
    }

    if (!isCountQuery) {
        baseSql += ' LIMIT ? OFFSET ?';
    }

    return baseSql;
}

export default router;


