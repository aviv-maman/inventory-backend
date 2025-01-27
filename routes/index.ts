import { Router } from 'express';
import authRouter from './authRouter.ts';
import orderRouter from './orderRouter.ts';
import storeRouter from './storeRouter.ts';
import userRouter from './userRouter.ts';

const router = Router();

router.use('/auth', authRouter);
router.use('/user', userRouter);
router.use('/store', storeRouter);
//router.use('/product', productRouter);
router.use('/order', orderRouter);

export default router;
