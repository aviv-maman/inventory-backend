import express from 'express';
import { env } from 'node:process';

const app = express();

app.get('/', (req, res) => {
  res.send('Hello, TypeScript with Node.js!');
});

app.listen(env.PORT, () => {
  console.log(`Server is running at http://localhost:${env.PORT}`);
});
