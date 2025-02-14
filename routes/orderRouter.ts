import authController from '../controllers/authController.ts';
import orderController from '../controllers/orderController.ts';
import { Router } from 'express';

const orderRouter = Router();

// Protect all routes after this middleware
orderRouter.use(authController.verifySession);

orderRouter.post('/checkout', orderController.prepareOrder, orderController.checkout);

orderRouter.route('/:id').get(orderController.getOrder);

orderRouter.route('/').get(orderController.getAllOrders);

export default orderRouter;
