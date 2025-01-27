import { StoreModel } from '../models/storeModel.ts';
import { catchAsync } from '../utils/catchAsync.ts';

const createStore = catchAsync(async (req, res, next) => {
  const isActive = req.body.active === 'active' || req.body.active === 1 ? true : false;

  const newStore = await StoreModel.create({
    name: req.body.name,
    location: req.body.location,
    active: isActive,
  });

  res.status(200).json({ success: true, data: newStore });
});

const storeController = {
  createStore,
};

export default storeController;
