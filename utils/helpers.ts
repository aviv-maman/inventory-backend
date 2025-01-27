import type { NextFunction, Request, Response } from 'express';

type AsyncFunction = (req: Request, res: Response, next: NextFunction) => Promise<void>;

const catchAsync = (fn: AsyncFunction) => (req: Request, res: Response, next: NextFunction) => {
  fn(req, res, next).catch((err) => next(err));
};

const checkIsBoolean = (arg: string | number | undefined) => {
  if (arg === 'active' || arg === 'true' || arg === 1) {
    return true;
  } else if (arg === 'inactive' || arg === 'false' || arg === 0) {
    return false;
  } else {
    return arg;
  }
};

const helpers = {
  catchAsync,
  checkIsBoolean,
};

export default helpers;
