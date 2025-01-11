import { Router } from 'express';
import authRouter from './authRouter.ts';

const router = Router();

router.use('/auth', authRouter);
//router.use('/user', userRouter);
//router.use('/product', productRouter);

export default router;
