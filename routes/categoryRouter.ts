import authController from '../controllers/authController.ts';
import categoryController from '../controllers/categoryController.ts';
import { Router } from 'express';

const categoryRouter = Router();

categoryRouter
  .route('/')
  .get(categoryController.getAllCategories)
  .post(
    authController.verifySession,
    authController.restrictTo('admin', 'employee'),
    categoryController.createCategory,
  );

categoryRouter.route('/with-ancestors').get(categoryController.getCategoriesWithAncestors);

export default categoryRouter;
