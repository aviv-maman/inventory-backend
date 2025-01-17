import authController from '../controllers/authController.ts';
import userController from '../controllers/userController.ts';
import { Router } from 'express';

const authRouter = Router();

authRouter.post('/register', authController.register);
authRouter.post('/login', authController.login);
authRouter.get('/logout', authController.logout);
authRouter.get('/verify-session', authController.verifySession, userController.getMe);

export default authRouter;
