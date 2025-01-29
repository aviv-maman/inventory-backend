import cookieParser from 'cookie-parser';
import cors from 'cors';
import express from 'express';
import helmet from 'helmet';
import connectDB from './configs/database.ts';
import router from './routes/index.ts';
import AppError from './utils/AppError.ts';
import errorHandler from './utils/errorHandler.ts';

const app = express();
const PORT = process.env.PORT || 5000;

connectDB();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

if (process.env.NODE_ENV === 'development') {
  app.use(
    cors({
      origin: `http://localhost:3000`,
      credentials: true,
    }),
  );
} else {
  app.use(helmet());
}

//Routes
app.use('/api', router);

const server = app.listen(PORT, () => {
  console.log(`Server is listening on port ${PORT} in ${process.env.NODE_ENV} environment 🚀`);
});

app.all('*', (req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

app.use(errorHandler);

process.on('uncaughtException', (err: Error) => {
  console.log('Uncaught Exception! Shutting down... 💩');
  console.error(err.name, err.message, err.stack);
  process.exit(1);
});

process.on('unhandledRejection', (err: Error) => {
  console.log('Unhandled Rejection! Shutting down... 🤡');
  console.error(err.name, err.message, err.stack);
  server.close((err) => {
    process.exit(1);
  });
});

process.on('SIGTERM', (listener) => {
  console.log('Sigterm Received. Shutting down... 👋');
  server.close((err) => {
    console.error(err?.name, err?.message, err?.stack);
    console.log('Process terminated! 💥');
    process.exit(0);
  });
});
