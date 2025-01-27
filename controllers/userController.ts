import { UserModel } from '../models/userModel.ts';
import AppError from '../utils/AppError.ts';
import { catchAsync } from '../utils/catchAsync.ts';
import genericHandler from '../utils/genericHandler.ts';
import helpers from '../utils/helpers.ts';

const getMe = catchAsync(async (req, res, next) => {
  if (!req.body.localUser) {
    return next(new AppError('The user belonging to this token does no longer exist.', 404));
  }
  res.status(200).json({ success: true, data: req.body.localUser });
});

const getAllUsers = genericHandler.getAll(UserModel);

const createUser = catchAsync(async (req, res, next) => {
  const newUser = await UserModel.create({
    firstName: req.body.firstName,
    lastName: req.body.lastName,
    email: req.body.email,
    password: req.body.password,
    passwordConfirmation: req.body.passwordConfirmation,
    role: 'employee',
    active: helpers.checkIsBoolean(req.body.active),
  });

  res.status(201).json({
    success: true,
    data: newUser._id,
  });
});

const userController = {
  getMe,
  getAllUsers,
  createUser,
};

export default userController;
