import authHandler from '../handlers/authHandler.ts';
import userHandler from '../handlers/userHandler.ts';
import { Router } from 'express';

const authRouter = Router();

authRouter.post('/register', authHandler.register);
authRouter.post('/login', authHandler.login);
authRouter.get('/logout', authHandler.logout);
authRouter.get('/verify-session', authHandler.verifySession, userHandler.getMe);

export default authRouter;
