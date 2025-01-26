import AppError from '../utils/AppError.ts';
import { catchAsync } from '../utils/catchAsync.ts';

const checkout = catchAsync(async (req, res, next) => {
  if (!req.body.userId || req.body.user._id.toString() !== req.body.userId) {
    return next(new AppError('The user ID is missing or the token belongs to someone else.', 404));
  }
  res.status(200).json({ success: true, userId: req.body.userId });
});

const orderController = {
  checkout,
};

export default orderController;
