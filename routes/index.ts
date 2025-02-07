import { Router } from 'express';
import authRouter from './authRouter.ts';
import categoryRouter from './categoryRouter.ts';
import orderRouter from './orderRouter.ts';
import productRouter from './productRouter.ts';
import storeRouter from './storeRouter.ts';
import userRouter from './userRouter.ts';

const router = Router();

router.use('/auth', authRouter);
router.use('/order', orderRouter);
router.use('/product', productRouter);
router.use('/store', storeRouter);
router.use('/user', userRouter);
router.use('/category', categoryRouter);

export default router;
