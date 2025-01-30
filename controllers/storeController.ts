import { StoreModel } from '../models/storeModel.ts';
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

const storeController = {
  createStore,
  getAllStores,
  getStore,
  updateStore,
  prepareBodyStore,
};

export default storeController;
