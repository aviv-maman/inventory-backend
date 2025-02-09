import AppError from '../utils/AppError.ts';
import helpers from '../utils/helpers.ts';

const checkout = helpers.catchAsync(async (req, res, next) => {
  if (!req.body.localUser._id.toString()) {
    return next(new AppError('The user ID is missing or the token belongs to someone else.', 404));
  }
  res.status(200).json({ success: true, cart: req.body.cart });
});

const orderController = {
  checkout,
};

export default orderController;
