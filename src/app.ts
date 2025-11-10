// app.ts 或 server.ts
import express from 'express';
import cors from 'cors';
import artworkRouter from './routers/artwork.js';
import VincentRouter from './routers/VincentArtworkRouter.js';
import vincentLetterRouter from './routers/VincentLetterRouter.js';
import userRouter from './routers/UserRouter.js';
import { initDatabase, sequelize } from './db/db2.js';
import cookieParser from 'cookie-parser'; 

const allowedOrigins = [
  "http://localhost:3000",
  "http://49.235.40.16:80",
  "http://starryvincent.com",
  "https://starryvincent.com"
]
const app = express();
app.use(express.json());//json requery body
app.use(express.urlencoded({ extended: true }));//form request
app.use(cors({
  origin: allowedOrigins,
  credentials: true,     //Allow the front end to carry cookies
}));
app.use(cookieParser());

initDatabase()

// 使用 artwork 路由

const API_PREFIX = '/api/v1'; // 定义版本前缀

// app.use('api/artworks', artworkRouter);
app.use(`${API_PREFIX}/artworks/vincent`, VincentRouter);
app.use(`${API_PREFIX}/letters/vincent`, vincentLetterRouter);
app.use(`${API_PREFIX}/user`, userRouter);

const PORT = 5001;

sequelize.authenticate().then(() => {
  console.log('Database connected.');
  app.listen(PORT, '0.0.0.0', () => console.log(`Server running on port ${PORT}`));
});
