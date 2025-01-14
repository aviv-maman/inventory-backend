class AppError extends Error {
  statusCode: number;
  code?: string | number;

  constructor(message: string, statusCode: number, code?: string | number, name = 'Error') {
    super();
    this.name = name;
    this.message = message;
    this.statusCode = statusCode;
    this.code = code;
    Error.captureStackTrace(this, this.constructor);
  }
}

export default AppError;
