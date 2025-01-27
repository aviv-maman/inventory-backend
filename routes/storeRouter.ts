import authController from '../controllers/authController.ts';
import storeController from '../controllers/storeController.ts';
import { Router } from 'express';

const storeRouter = Router();

// Protect all routes after this middleware
storeRouter.use(authController.verifySession, authController.restrictTo('admin'));

storeRouter.post('/add-store', storeController.createStore);

export default storeRouter;
