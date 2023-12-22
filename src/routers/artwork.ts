import express from "express";
import Database from "better-sqlite3";


const router = express.Router();
const db = new Database('artwork.db');

router.get('/data', (req:any, res) => {
    // 获取分页参数
    const page = parseInt(req.query.page) || 0;
    const rowsPerPage = parseInt(req.query.rowsPerPage) || 5;
    console.log(`request:${req.query}`)

    try {
        // 计算 offset
        const offset = page * rowsPerPage;

        // 查询当前页的数据
        const dataStmt = db.prepare('SELECT * FROM artwork LIMIT ? OFFSET ?');
        const data = dataStmt.all(rowsPerPage, offset);

        // 查询总行数
        const countStmt = db.prepare('SELECT COUNT(*) AS total FROM artwork');
        const total = countStmt.get() as { total_count: number }; // 使用类型断言
        // 返回数据和总行数
        res.json({ data, total });
    } catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
});


export default router;
