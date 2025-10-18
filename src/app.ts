// app.ts 或 server.ts
import express from 'express';
import cors from 'cors';
import artworkRouter from './routers/artwork';
import vangoghRouter, { sequelize } from './routers/vangogh';

const app = express();
app.use(cors());

// 使用 artwork 路由
app.use('/artworks', artworkRouter);
app.use('/artworks/vincent', vangoghRouter);

const PORT = 5001;

sequelize.authenticate().then(() => {
  console.log('Database connected.');
  app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
});
