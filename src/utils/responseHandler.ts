import { Response } from 'express';
import { StatusCodes, getReasonPhrase } from 'http-status-codes';

interface SuccessResponse<T> {
    data: T;
    message?: string;
    meta?: object; //pagination etc..
}

interface ErrorResponse {
    errorCode: string;
    message: string;
    errors?: Array<{ field: string; reason: string }>;
}

/**
 * @param res Express response
 * @param data response data 
 * @param statusCode HTTP status,defualt 200
 */
export const success = <T>(
    res: Response, 
    data: T, 
    statusCode: StatusCodes = StatusCodes.OK,
    meta?: object,
    message?: string,
): Response<SuccessResponse<T>> => {
    
    //enforce 200 status if it is set incorrently
    if (statusCode < 200 || statusCode >= 300) {
        statusCode = StatusCodes.OK; 
    }

    const responseBody: SuccessResponse<T> = { data };

    if (message) responseBody.message = message;
    if (meta) responseBody.meta = meta;
    
    return res.status(statusCode).json(responseBody);
};

/**
 * @param res Express 
 * @param statusCode HTTP status, defualt 500
 * @param errorCode App internal error code
 * @param message 
 * @param errors 
 */
export const error = (
    res: Response, 
    statusCode: StatusCodes = StatusCodes.INTERNAL_SERVER_ERROR,
    errorCode: string, 
    message: string = getReasonPhrase(statusCode),
    errors?: Array<{ field: string; reason: string }>,
): Response<ErrorResponse> => {
    
    if (statusCode < 400) {
        statusCode = StatusCodes.INTERNAL_SERVER_ERROR;
    }

    const responseBody: ErrorResponse = {
        errorCode: errorCode,
        message: message,
    };
    
    if (errors) responseBody.errors = errors;

    return res.status(statusCode).json(responseBody);
};