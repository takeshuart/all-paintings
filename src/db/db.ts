import Database from 'better-sqlite3';
import path from 'path';
import dotenv from 'dotenv';
import { Sequelize } from "sequelize";

dotenv.config();
const dbFileProd = path.join(__dirname, '../../artwork.db')
const dbFileTest = path.join(__dirname, '../../artwork-test.db')

const env = process.env.NODE_ENV || 'prod';
const dbFile = env === 'test' ? dbFileTest : dbFileProd;

export const dbArtwork = new Database(dbFile, {
    // verbose: console.log
});

console.log(`当前使用数据库: ${env === 'test' ? '测试库' : '生产库'} → ${dbFile}`);

// export const sequelize = new Sequelize({
//   dialect: "sqlite",
//   storage: "../artwork.db",
//   logging: false,
//   define: {
//     underscored: true, // 自动将模型驼峰属性映射为下划线字段
//     timestamps: true,  // 自动添加 created_at / updated_at
//     createdAt: "created_at",
//     updatedAt: "updated_at",
//   },
// });
