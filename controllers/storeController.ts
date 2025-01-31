import { ProductModel } from '../models/productModel.ts';
import { StoreModel } from '../models/storeModel.ts';
import AppError from '../utils/AppError.ts';
import genericHandler from '../utils/genericHandler.ts';
import helpers from '../utils/helpers.ts';

const createStore = genericHandler.createOne(StoreModel);
const getAllStores = genericHandler.getAll(StoreModel);
const getStore = genericHandler.getOne(StoreModel);
const updateStore = genericHandler.updateOne(StoreModel);

const prepareBodyStore = helpers.catchAsync(async (req, res, next) => {
  const preparedActive = helpers.checkIsBoolean(req.body.active);
  req.body.active = preparedActive;

  next();
});

const updateStock = helpers.catchAsync(async (req, res, next) => {
  const { id: productId, stock: newStockInStore } = req.body;

  const product = await ProductModel.findById(productId);
  if (!product) {
    return next(new AppError('Product was not found', 404));
  }
  const store = await StoreModel.findById(req.params.id);
  if (!store) {
    return next(new AppError('Store was not found', 404));
  }

  const currentStockInStore = store.products.find((item) => item._id === productId)?.stock || 0;
  const stockOffset = newStockInStore - currentStockInStore;

  const updatedProduct = await product.updateOne(
    { stock: product.stock + stockOffset },
    { new: true, runValidators: true },
  );

  const updatedStore = await store.updateOne(
    {
      $addToSet: { products: { product, stock: newStockInStore } },
    },
    { new: true, runValidators: true },
  );

  res.status(200).json({ success: true, data: updatedStore });
});

const storeController = {
  createStore,
  getAllStores,
  getStore,
  updateStore,
  prepareBodyStore,
  updateStock,
};

export default storeController;
