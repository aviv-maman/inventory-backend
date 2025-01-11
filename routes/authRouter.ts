import authHandler from '../handlers/authHandler.ts';
import { Router } from 'express';

const authRouter = Router();

authRouter.post('/register', authHandler.register);
authRouter.post('/login', authHandler.login);
authRouter.get('/logout', authHandler.logout);

export default authRouter;
