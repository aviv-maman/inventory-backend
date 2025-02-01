import { UserModel } from '../models/userModel.ts';
import AppError from '../utils/AppError.ts';
import genericHandler from '../utils/genericHandler.ts';
import helpers from '../utils/helpers.ts';

const getMe = helpers.catchAsync(async (req, res, next) => {
  if (!req.body.localUser) {
    return next(new AppError('The user belonging to this token does no longer exist', 404));
  }
  res.status(200).json({ success: true, data: req.body.localUser });
});

const getAllUsers = genericHandler.getAll(UserModel);
const createUser = genericHandler.createOne(UserModel);
const getUser = genericHandler.getOne(UserModel);

const prepareBodyCreateEmployee = helpers.catchAsync(async (req, res, next) => {
  req.body.role = 'employee';
  req.body.active = helpers.checkIsBoolean(req.body.active);

  next();
});

const userController = {
  getMe,
  getAllUsers,
  createUser,
  prepareBodyCreateEmployee,
  getUser,
};

export default userController;
