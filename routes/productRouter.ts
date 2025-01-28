import authController from '../controllers/authController.ts';
import productController from '../controllers/productController.ts';
import { Router } from 'express';

const productRouter = Router();

productRouter.get('/get-all', productController.getAllProducts);
// Protect all routes after this middleware
productRouter.use(authController.verifySession);
productRouter.post('/add-product', productController.createProduct);

export default productRouter;
