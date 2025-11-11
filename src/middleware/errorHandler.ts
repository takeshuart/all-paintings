import { AppError } from "../error/AppError.js";
import { ERROR_CODES } from "../error/errorCodes.js";
import { NextFunction, Request, Response } from "express";
import { ErrorRequestHandler } from "express";

export const errorHandler: ErrorRequestHandler = (err, req, res, next) => {

    console.error('ErrorHandler:', err);

    if (err instanceof AppError) {
        return res.status(err.status).json({
            success: false,
            error: {
                code: err.code,
                message: err.message
            }
        });
    }


    res.status(500).json({
        success: false,
        error: {
            code: ERROR_CODES.INTERNAL_ERROR,
            message: 'Unexpected server error'
        }
    });
}
