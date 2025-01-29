import { StoreModel } from '../models/storeModel.ts';
import genericHandler from '../utils/genericHandler.ts';
import helpers from '../utils/helpers.ts';

const createStore = helpers.catchAsync(async (req, res, next) => {
  const newStore = await StoreModel.create({
    name: req.body.name,
    location: req.body.location,
    active: helpers.checkIsBoolean(req.body.active),
  });

  res.status(201).json({ success: true, data: newStore });
});

const getAllStores = genericHandler.getAll(StoreModel);

const storeController = {
  createStore,
  getAllStores,
};

export default storeController;
