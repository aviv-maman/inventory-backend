import AppError from '../utils/AppError.ts';
import type { NextFunction, Request, Response } from 'express';
import { MongoError } from 'mongodb';
import { Error as MongooseError } from 'mongoose';

type Errors = AppError | Error | MongooseError | MongoError;

const errorHandler = (err: Errors, req: Request, res: Response, next: NextFunction) => {
  const errmsg = 'errmsg' in err ? err.errmsg : undefined;
  const _message = '_message' in err ? String(err._message) : undefined;
  const code = 'code' in err ? err.code : undefined;
  const extendedError = {
    ...err,
    statusCode: 'statusCode' in err && typeof err.statusCode === 'number' ? err.statusCode : 500,
    code,
    message: err.message || errmsg || _message || 'Something went wrong',
  };

  if (process.env.NODE_ENV === 'development') {
    res.status(extendedError.statusCode).json({
      success: false,
      data: null,
      error: { ...extendedError, stack: err.stack },
    });
  } else if (process.env.NODE_ENV === 'production') {
    if (err instanceof MongooseError.CastError && err.name === 'CastError') {
      err.message = `Invalid ${err.path}: ${err.value}.`;
    }
    if (err instanceof MongoError && err.code === 11000) {
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
      res.status(Number(err.statusCode)).json({
        success: false,
        data: null,
        error: { message: err.message || 'Something went wrong' },
      });
    }
    // Programming or other unknown error: don't leak error details
    console.error('ERROR 💥', err);
    res.status(500).json({
      success: false,
      data: null,
      error: { message: 'Something went wrong' },
    });
  }
};

export default errorHandler;
