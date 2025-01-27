import authController from '../controllers/authController.ts';
import userController from '../controllers/userController.ts';
import { Router } from 'express';

const userRouter = Router();

// Protect all routes after this middleware
userRouter.use(authController.verifySession, authController.restrictTo('admin'));

userRouter.get('/get-all', userController.getAllUsers);
userRouter.post('/add-employee', userController.createUser);

export default userRouter;
