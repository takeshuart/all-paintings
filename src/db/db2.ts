import path from "path";
import { Sequelize } from 'sequelize-typescript';
import { VincentArtwork } from "./models/VincentArtwork.js";
import { VincentLetter } from "./models/VincentLetter.js";
import { ArtworkColorFeature } from "./models/ArtworkColorFeature.js";
import { PROJECT_ROOT } from "../utils/files.js";


const dbFile = path.join(PROJECT_ROOT, './artwork.db');

export const sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: dbFile,
    logging: false,
    models: [VincentArtwork,VincentLetter,ArtworkColorFeature]
});

export async function initDatabase() {
    try {
        await sequelize.authenticate();
        console.log(`✅ SQLite connection established. database file:\t${dbFile}`);
    } catch (err) {
        console.error('❌ Database connection error:', err);
    }
}