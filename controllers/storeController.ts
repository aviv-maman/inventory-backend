import { StoreModel } from '../models/storeModel.ts';
import helpers from '../utils/helpers.ts';

const createStore = helpers.catchAsync(async (req, res, next) => {
  const newStore = await StoreModel.create({
    name: req.body.name,
    location: req.body.location,
    active: helpers.checkIsBoolean(req.body.active),
  });

  res.status(200).json({ success: true, data: newStore });
});

const storeController = {
  createStore,
};

export default storeController;
