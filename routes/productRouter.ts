import authController from '../controllers/authController.ts';
import productController from '../controllers/productController.ts';
import { Router } from 'express';

const productRouter = Router();

// Prepare body for all routes after this middleware
productRouter.use(productController.prepareBodyProduct);

productRouter
  .route('/')
  .get(productController.getAllProducts)
  .post(authController.verifySession, authController.restrictTo('admin', 'employee'), productController.createProduct);

productRouter.route('/:id').get(productController.getProduct);

export default productRouter;
