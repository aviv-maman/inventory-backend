import authController from '../controllers/authController.ts';
import storeController from '../controllers/storeController.ts';
import { Router } from 'express';

const storeRouter = Router();

// Prepare body for all routes after this middleware
storeRouter.use(storeController.prepareBodyStore);

storeRouter
  .route('/')
  .get(storeController.getAllStores)
  .post(authController.verifySession, authController.restrictTo('admin'), storeController.createStore);

storeRouter
  .route('/:id')
  .get(storeController.getStore)
  .patch(authController.verifySession, authController.restrictTo('admin'), storeController.updateStore);

storeRouter
  .route('/:id/stock')
  .patch(authController.verifySession, authController.restrictTo('admin', 'employee'), storeController.updateStock);

export default storeRouter;
