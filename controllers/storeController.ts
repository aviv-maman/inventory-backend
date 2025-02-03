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
  const { id: productId, stock: newStockInStore } = req.body as { id: string; stock: number };
  const storeId = req.params.id;

  const product = await ProductModel.findById(productId);
  if (!product) {
    return next(new AppError('Product was not found', 404));
  }
  const store = await StoreModel.findById(storeId);
  if (!store) {
    return next(new AppError('Store was not found', 404));
  }

  const currentStockInStore = store.products.find((item) => item.product?.toString() === productId);

  if (!currentStockInStore) {
    //return next(new AppError(`Product with ID ${productId} is not in the store with ID ${storeId}`, 404));
    const updatedStore = await store.updateOne(
      {
        $addToSet: { products: { product, stock: newStockInStore } },
      },
      { new: true, runValidators: true },
    );
    product.stock += newStockInStore;
  } else {
    if (newStockInStore > currentStockInStore.stock) {
      currentStockInStore.stock += newStockInStore - currentStockInStore.stock; // Increase
      product.stock += newStockInStore - currentStockInStore.stock;
    } else if (newStockInStore < currentStockInStore.stock) {
      product.stock -= currentStockInStore.stock - newStockInStore;
      currentStockInStore.stock -= currentStockInStore.stock - newStockInStore; // Decrease
    }
  }
  const updatedProduct = await product.save();
  const updatedStore = await store.save();

  res.status(200).json({ success: true, data: updatedStore });
});

const getProductsByStoreIds = helpers.catchAsync(async (req, res, next) => {
  const { store, excludedStores, name } = req.query;
  const filterByStores = typeof store === 'string' ? store?.split(',') : undefined;
  const filterByExcludedStores = typeof excludedStores === 'string' ? excludedStores?.split(',') : undefined;
  //const sort = typeof req.query.sort === 'string' ? req.query.sort?.split(',').join(' ') : '-createdAt';
  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 10;
  const skip = (page - 1) * limit;

  const qObj = {
    _id: { $in: filterByStores, $nin: filterByExcludedStores },
    name: {
      $or: [{ name: { $regex: name, $options: 'i' } }, { description: { $regex: name, $options: 'i' } }],
    },
  };
  if (!filterByStores) {
    helpers.deleteProperties(qObj._id, ['$in']);
  }
  if (!filterByExcludedStores) {
    helpers.deleteProperties(qObj._id, ['$nin']);
  }
  if (!name) {
    helpers.deleteProperties(qObj, ['name']);
  }

  const stores = await StoreModel.find(qObj)
    .populate({
      path: 'products',
      populate: {
        path: 'product',
        model: 'Product',
        options: { limit, skip },
      },
    })
    .exec();

  const productsAndStock = stores.reduce<any>((currentArray, item) => {
    currentArray.push(...item.products);
    return currentArray;
  }, []);

  res.status(200).json({ success: true, data: productsAndStock });
});

const storeController = {
  createStore,
  getAllStores,
  getStore,
  updateStore,
  prepareBodyStore,
  updateStock,
  getProductsByStoreIds,
};

export default storeController;
