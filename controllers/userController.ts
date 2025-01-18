import { UserModel } from '../models/userModel.ts';
import AppError from '../utils/AppError.ts';
import { catchAsync } from '../utils/catchAsync.ts';
import genericHandler from '../utils/genericHandler.ts';

const getMe = catchAsync(async (req, res, next) => {
  if (!req.body.user) {
    return next(new AppError('The user belonging to this token does no longer exist.', 404));
  }
  res.status(200).json({ success: true, user: req.body.user });
});

const getAllUsers = genericHandler.getAll(UserModel);

const userController = {
  getMe,
  getAllUsers,
};

export default userController;
