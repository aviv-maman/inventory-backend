import AppError from '../utils/AppError.ts';
import helpers from '../utils/helpers.ts';

const checkAvailabilityAndPrice = helpers.catchAsync(async (req, res, next) => {
  const products = req.body.cart.products as { _id: string; quantity: number; price: number }[] | undefined;

  if (Array.isArray(products)) {
    products.forEach((product) => {
      console.log(product);
    });
  }
});

const prepareOrder = helpers.catchAsync(async (req, res, next) => {
  const order = {
    user: req.body.localUser._id as string | undefined,
    address: req.body.address as string | undefined,
    products: req.body.cart.products as { _id: string; quantity: number; price: number }[] | undefined,
    totalPrice: req.body.cart.totalPrice as number | undefined,
  };

  next();
});

const checkout = helpers.catchAsync(async (req, res, next) => {
  if (!req.body.localUser._id.toString()) {
    return next(new AppError('The user ID is missing or the token belongs to someone else.', 404));
  }

  res.status(200).json({ success: true, cart: req.body.cart });
});

const orderController = { checkout, prepareOrder };

export default orderController;
