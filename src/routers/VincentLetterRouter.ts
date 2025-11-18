import express from "express";
import { prisma } from "../lib/prismaDB.js";
import { error, success } from "../utils/responseHandler.js";
import { AppError } from "error/AppError.js";
import { ERROR_CODES } from "error/errorCodes.js";
import { validate } from "middleware/validate.js";
import { z } from "zod";

const router = express.Router();
export default router;

router.get('/', async (req: any, res) => {
  const schema = z.object({
    ids: z.string().min(1)
  });

  const parseResult = schema.safeParse(req.query);
  if (!parseResult.success) {
    req.log.warn({ query: req.query, issues: parseResult.error.issues });
    return error(res, 400, 'INVALID_PARAMS', 'ids is required');
  }

  const rawIds = parseResult.data.ids as string;
  const letterIds = rawIds.split(',').map(s => s.trim()).filter(Boolean);

  try {
    const ids = letterIds.map((e: string) => e.startsWith('rm') ? e.toUpperCase() : e);
    const results = await prisma.vincentLetter.findMany({
      where: { letterId: { in: ids } }
    });
    req.log.info({ letterIds, msg: 'Fetched Vincent letters by IDs successfully' });
    success(res, results);
  } catch (err) {
    req.log.error({ err, letterIds, msg: 'Failed to fetch Vincent letters by IDs' });
    error(res, 500, ERROR_CODES.INTERNAL_ERROR, '');
  }
});