import authController from '../controllers/authController.ts';
import userController from '../controllers/userController.ts';
import { Router } from 'express';

const userRouter = Router();

// Protect all routes after this middleware
userRouter.use(authController.verifySession);

userRouter.get('/get-all', userController.getAllUsers);

export default userRouter;
