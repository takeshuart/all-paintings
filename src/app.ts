// app.ts 或 server.ts
import express from 'express';
import cors from 'cors';
import artworkRouter from './routers/artwork.js';
import vangoghRouter from './routers/VincentArtworkRouter.js';
import vincentLetterRouter from './routers/VincentLetterRouter.js';
import { initDatabase, sequelize } from './db/db2.js';

const app = express();
app.use(cors());
initDatabase()

// 使用 artwork 路由
app.use('/artworks', artworkRouter);
app.use('/artworks/vincent', vangoghRouter);
app.use('/vincent/letter', vincentLetterRouter);

const PORT = 5001;

sequelize.authenticate().then(() => {
  console.log('Database connected.');
  app.listen(PORT,'0.0.0.0', () => console.log(`Server running on port ${PORT}`));
});
