import type AppError from '../utils/AppError.ts';
import type { NextFunction, Request, Response } from 'express';
import { MongoServerError } from 'mongodb';
import { Error as MongooseError } from 'mongoose';

const sendDevError = (err: Errors, req: Request, res: Response) => {
  const statusCode = 'statusCode' in err ? Number(err.statusCode) : 500;
  const status = 'status' in err ? String(err.status) : 'error';
  const [message1, message2] = ['message' in err && err.message, '_message' in err && (err._message as string)];

  res.status(statusCode).json({
    status,
    error: err,
    message: message1 || message2,
    stack: err.stack,
  });
};

const sendProdError = (err: AppError, req: Request, res: Response) => {
  // A) API
  if (req.originalUrl.startsWith('/api')) {
    // A) Operational, trusted error: send message to client
    if (err.isOperational) {
      return res.status(Number(err.statusCode)).json({
        status: err.status,
        message: err.message,
      });
    }
    // B) Programming or other unknown error: don't leak error details
    // 1) Log error
    console.error('ERROR 💥', err);
    // 2) Send generic message
    return res.status(500).json({
      status: 'error',
      message: 'Something went very wrong!',
    });
  }

  // B) RENDERED WEBSITE
  // A) Operational, trusted error: send message to client
  if (err.isOperational) {
    console.error(err);
    return res.status(Number(err.statusCode)).render('error', {
      title: 'Something went wrong!',
      msg: err.message,
    });
  }
  // B) Programming or other unknown error: don't leak error details
  // 1) Log error
  console.error('ERROR 💥', err);
  // 2) Send generic message
  return res.status(Number(err.statusCode)).render('error', {
    title: 'Something went wrong!',
    msg: 'Please try again later.',
  });
};

type Errors = Error | MongooseError.CastError | MongoServerError | MongooseError.ValidationError;

const errorHandler = (err: Errors, req: Request, res: Response, next: NextFunction) => {
  const appError = {
    ...err,
    code: 'code' in err ? err.code : 500,
    statusCode: 'statusCode' in err && !isNaN(err.statusCode) ? Number(err.statusCode) : 500,
  };

  if (process.env.NODE_ENV === 'development') {
    sendDevError(appError as AppError, req, res);
  } else if (process.env.NODE_ENV === 'production') {
    if (err instanceof MongooseError.CastError && err.name === 'CastError') {
      appError.message = `Invalid ${err.path}: ${err.value}.`;
      appError.code = 400;
    }
    if (err instanceof MongoServerError && err.code === 11000) {
      const errmsg = err.errmsg.match(/(["'])(\\?.)*?\1/);
      const value = errmsg ? errmsg[0] : 'null';
      appError.message = `Duplicate field value: ${value}. Please use another value!`;
      appError.code = 400;
    }
    if (err instanceof MongooseError.ValidationError && err.name === 'ValidationError') {
      const errors = Object.values(err.errors).map((element) => element.message);
      appError.message = `Invalid input data. ${errors.join('. ')}`;
      appError.code = 400;
    }
    if (err.name === 'JsonWebTokenError') {
      appError.message = 'Invalid token. Please log in again!';
      appError.code = 401;
    }
    if (err.name === 'TokenExpiredError') {
      appError.message = 'Your token has expired! Please log in again.';
      appError.code = 401;
    }
    sendProdError(appError as AppError, req, res);
  }
};

export default errorHandler;
