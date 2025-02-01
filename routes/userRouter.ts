import authController from '../controllers/authController.ts';
import userController from '../controllers/userController.ts';
import { Router } from 'express';

const userRouter = Router();

// Protect all routes after this middleware
userRouter.use(authController.verifySession, authController.restrictTo('admin'));

userRouter
  .route('/')
  .get(userController.getAllUsers)
  .post(userController.prepareBodyCreateEmployee, userController.createUser);

userRouter.route('/:id').get(authController.restrictTo('admin'), userController.getUser);

export default userRouter;
