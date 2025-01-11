class AppError extends Error {
  code: number;
  statusCode?: number;
  status: string;
  isOperational: boolean;
  path?: string;

  constructor(message: string, code: number, statusCode?: number) {
    super(message);
    this.code = code;
    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }
}

export default AppError;
