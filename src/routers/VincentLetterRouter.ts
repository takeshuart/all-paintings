import express from "express";
import { prisma } from "../lib/prismaDB.js";

const router = express.Router();
export default router;

router.get('/', async (req: any, res) => {
    const rawIds = req.query.ids as string | undefined;

    let letterIds = rawIds?.split(',')

    if (!letterIds) {
        return res.json([]);
    }

    try {
        const ids = letterIds.map((e: string) => {
            return e.startsWith("rm") ? e.toUpperCase() : e //
        })
        const results = await prisma.vincentLetter.findMany({
            where: {
                letterId: { in: ids }
            }
        })

        return res.json(results);

    } catch (error) {
        const errorMessage = `Error finding letters with IDs: ${letterIds.join(',')} due to database error.`;
        console.error(errorMessage, error);
        return res.status(500).json({ error: 'Internal Server Error', details: 'Database query failed.' });
    }
});