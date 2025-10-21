import path from "path";
import { Sequelize } from 'sequelize-typescript';
import { VincentArtwork } from "./models/VincentArtwork";


const dbFile = path.join(__dirname, '../../artwork.db');

export const sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: dbFile,
    logging: true,
    models: [VincentArtwork]
});

export async function initDatabase() {
    try {
        await sequelize.authenticate();
        console.log('✅ SQLite connection established.');
    } catch (err) {
        console.error('❌ Database connection error:', err);
    }
}