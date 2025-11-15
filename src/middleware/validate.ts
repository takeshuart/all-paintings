// middlewares/validate.ts
import { ZodTypeAny } from "zod";
import { Request, Response, NextFunction } from "express";
import { ERROR_CODES } from "../error/errorCodes.js";
import { StatusCodes } from "http-status-codes";
import { error } from "../utils/responseHandler.js";


export const validate = (schema: ZodTypeAny) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      schema.parse(req.body);
      next();
    } catch (err: any) {
      const statusCode = StatusCodes.BAD_REQUEST; // 400 Bad Request

      const message = err.errors?.[0]?.message || "请求体数据格式不正确";

      const validationErrors = err.errors?.map((e: any) => ({
        field: e.path.join('.'),
        reason: e.message
      }));

      return error(
        res,
        statusCode,
        ERROR_CODES.INVALID_PASSWORD_FORMAT,
        message,
        validationErrors
      );
    }
  };
};
