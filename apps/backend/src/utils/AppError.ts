/**
 * Error controlado con código HTTP explícito. Los controladores lanzan esto
 * (o dejan que un error inesperado se propague) y el error.middleware central
 * decide cómo responder.
 */
export class AppError extends Error {
  public readonly statusCode: number;

  constructor(message: string, statusCode = 400) {
    super(message);
    this.name = "AppError";
    this.statusCode = statusCode;
    Error.captureStackTrace(this, this.constructor);
  }
}
