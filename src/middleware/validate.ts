// middlewares/validate.ts
import { ZodTypeAny } from "zod";
import { Request, Response, NextFunction } from "express";
import { ERROR_CODES } from "../error/errorCodes.js";
import { AppError } from "../error/AppError.js";


export const validate = (schema: ZodTypeAny) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      schema.parse(req.body);
      next();
    } catch (err: any) {
      next(new AppError(ERROR_CODES.INVALID_INPUT, err.errors?.[0]?.message || "Invalid input", 400));
    }
  };
};
