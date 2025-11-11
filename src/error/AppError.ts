
import { ERROR_CODES } from './errorCodes.js';

export class AppError extends Error {
  code: string;
  status: number;

  constructor(code: string, message: string, status = 400) {
    super(message);
    this.code = code;
    this.status = status;
  }

  static badRequest(code: string, message: string) {
    return new AppError(code, message, 400);
  }

  static unauthorized(message = 'Unauthorized') {
    return new AppError(ERROR_CODES.UNAUTHORIZED, message, 401);
  }

  static notFound(message = 'Not Found') {
    return new AppError(ERROR_CODES.NOT_FOUND, message, 404);
  }

  static internal(message = 'Internal server error') {
    return new AppError(ERROR_CODES.INTERNAL_ERROR, message, 500);
  }
}
