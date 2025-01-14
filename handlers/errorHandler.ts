import AppError from '../utils/AppError.ts';
import type { NextFunction, Request, Response } from 'express';
import { MongoServerError } from 'mongodb';
import { Error as MongooseError } from 'mongoose';

type Errors = AppError | Error | MongooseError.CastError | MongoServerError | MongooseError.ValidationError;

const errorHandler = (err: Errors, req: Request, res: Response, next: NextFunction) => {
  const extendedError = {
    ...err,
    statusCode: 'statusCode' in err && typeof err.statusCode === 'number' ? err.statusCode : 500,
    code: 'code' in err ? err.code : 500,
  };

  if (process.env.NODE_ENV === 'development') {
    const [message1, message2] = ['message' in err && err.message, '_message' in err && (err._message as string)];

    res.status(extendedError.statusCode).json({
      error: err,
      stack: err.stack,
      code: extendedError.code,
      statusCode: extendedError.statusCode,
      message: message1 || message2 || 'Something went wrong',
    });
  } else if (process.env.NODE_ENV === 'production') {
    if (err instanceof MongooseError.CastError && err.name === 'CastError') {
      err.message = `Invalid ${err.path}: ${err.value}.`;
    }
    if (err instanceof MongoServerError && err.code === 11000) {
      const errmsg = err.errmsg.match(/(["'])(\\?.)*?\1/);
      const value = errmsg ? errmsg[0] : 'null';
      err.message = `Duplicate field value: ${value}. Please use another value!`;
    }
    if (err instanceof MongooseError.ValidationError && err.name === 'ValidationError') {
      const errors = Object.values(err.errors).map((element) => element.message);
      err.message = `Invalid input data. ${errors.join('. ')}`;
    }
    if (err.name === 'JsonWebTokenError') {
      err.message = 'Invalid token. Please log in again!';
    }
    if (err.name === 'TokenExpiredError') {
      err.message = 'Your token has expired! Please log in again.';
    }

    // Custom AppError, trusted error: send message to client
    if (err instanceof AppError) {
      return res.status(Number(err.statusCode)).json({
        message: err.message,
      });
    }
    // Programming or other unknown error: don't leak error details
    console.error('ERROR 💥', err);
    return res.status(500).json({
      message: 'Something went wrong',
    });
  }
};

export default errorHandler;
