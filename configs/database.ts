import AppError from '../utils/AppError.ts';
import mongoose from 'mongoose';

const connectDB = async () => {
  const conn = { isEstablished: false };
  mongoose.set('strictQuery', true);

  if (conn.isEstablished) {
    console.warn('MongoDB is already connected.');
    return;
  }

  try {
    console.log('Connecting to MongoDB. Please wait... ⏳');
    const connectionRes = await mongoose.connect(process.env.MONGODB_URI as string);
    if (connectionRes.ConnectionStates[1]) {
      console.log(`[2/2] MongoDB is connected on host ${connectionRes.connection.host} 🌐`);
      conn.isEstablished = true;
    }
  } catch (err) {
    console.error('Connection to MongoDB was failed. ❌');
    const error = err as Error;
    if (process.env.NODE_ENV === 'production') {
      console.error(error.message);
    } else if (process.env.NODE_ENV === 'development') {
      console.error(error.name, error.message, error.stack);
    }
    return new AppError(error.message, 500);
  }
  mongoose.connection.on('error', (err) => {
    const start = Date.now();
    console.error(`Error ${err.name} was caught after ${(Date.now() - start).toString()}`);
    console.error(err.message);
  });
};

export default connectDB;
