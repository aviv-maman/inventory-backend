import authController from '../controllers/authController.ts';
import orderController from '../controllers/orderController.ts';
import { Router } from 'express';

const orderRouter = Router();

// Protect all routes after this middleware
orderRouter.use(authController.verifySession);

orderRouter.post('/checkout', orderController.prepareOrder, orderController.checkout);

export default orderRouter;
