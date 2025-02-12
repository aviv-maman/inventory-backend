import { OrderModel } from '../models/orderModel.ts';
import { ProductModel } from '../models/productModel.ts';
import { type Store, StoreModel } from '../models/storeModel.ts';
import AppError from '../utils/AppError.ts';
import genericHandler from '../utils/genericHandler.ts';
import helpers from '../utils/helpers.ts';

const prepareOrder = helpers.catchAsync(async (req, res, next) => {
  const newOrder = {
    user: req.body.localUser._id as string | undefined,
    address: req.body.address as string | undefined,
    products: req.body.cart.products as { _id: string; quantity: number; price: number; store: Store }[] | undefined,
    totalPrice: req.body.cart.totalPrice as number | undefined,
    calculatedTotalPrice: 0,
  };

  if (!newOrder.user) return next(new AppError('User is missing', 404));
  if (!newOrder.address) return next(new AppError('Address is missing', 404));
  if (newOrder.totalPrice && newOrder.totalPrice <= 0) return next(new AppError('Wrong total price', 401));

  if (Array.isArray(newOrder.products)) {
    for (const element of newOrder.products) {
      const product = await ProductModel.findById(element._id);
      if (!product) return next(new AppError('Product was not found', 404));
      if (element.quantity > product.stock) return next(new AppError('Not enough stock is available', 401));
      if (!product?.price) return next(new AppError('A price of a product is missing', 404));

      const discountPrice =
        product.price.fullPrice - product.price.fullPrice * (product.price.discountPercentage / 100);
      if (element.price !== discountPrice) return next(new AppError("A price of a product doesn't match", 401));

      const storesWithCurrentProduct = await StoreModel.find({
        'products.product': element._id,
        'products.stock': { $gte: element.quantity },
        active: true,
      });
      if (!storesWithCurrentProduct?.length)
        return next(new AppError(`A store with enough stock of ${product.name} wasn't found`, 404));

      element.store = storesWithCurrentProduct[0];
      newOrder.calculatedTotalPrice += element.quantity * element.price;
    }

    if (newOrder.calculatedTotalPrice !== newOrder.totalPrice) {
      return next(new AppError("Total price doesn't match", 401));
    }
    req.body.newOrder = newOrder;
  }
  next();
});

const checkout = helpers.catchAsync(async (req, res, next) => {
  if (!req.body.newOrder) {
    return next(new AppError("Order wasn't found.", 404));
  }
  const orderDetails = {
    user: req.body.newOrder.user._id as string,
    address: req.body.newOrder.address as string,
    products: req.body.newOrder.products as { _id: string; quantity: number; price: number; store: Store }[],
    totalPrice: req.body.newOrder.totalPrice as number,
  };
  const preparedProducts = orderDetails.products.map((item) => ({
    product: item._id,
    store: item.store,
    quantity: item.quantity,
    price: item.price,
  }));

  for (const element of preparedProducts) {
    const product = await ProductModel.findById(element.product);
    if (!product) return next(new AppError('Product was not found', 404));
    const store = await StoreModel.findById(element.store);
    if (!store) return next(new AppError('Store was not found', 404));
    const currentStockInStore = store.products.find((item) => item.product?.toString() === element.product);
    if (!currentStockInStore) return next(new AppError('Product was not found in selected store', 404));

    product.stock -= element.quantity;
    currentStockInStore.stock -= element.quantity;
    await product.save();
    await store.save();
  }

  const newOrder = await OrderModel.create({
    user: orderDetails.user,
    address: orderDetails.address,
    products: preparedProducts,
    totalPrice: orderDetails.totalPrice,
  });

  res.status(200).json({ success: true, order: newOrder });
});

const getOrder = genericHandler.getOne(OrderModel);

const orderController = { checkout, prepareOrder, getOrder };

export default orderController;
