// app.ts 或 server.ts
import express from 'express';
import cors from 'cors';
import artworkRouter from './routers/artwork';

const app = express();
app.use(cors());

// 使用 artwork 路由
app.use('/artwork', artworkRouter);

const PORT = 5001;
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
