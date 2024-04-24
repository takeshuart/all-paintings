import * as fs from 'fs';
import * as path from 'path';
import * as sqlite3 from 'sqlite3';
import { dbFile } from '../routers/vangogh';

// 定义要遍历的本地目录路径
const directoryPath = 'D:/Arts/Van Gogh/all-collections';

// 初始化 SQLite 数据库连接
const db = new sqlite3.Database(dbFile);

// 定义存储文件信息的映射
const imgMap: { [key: string]: string } = {};

// 遍历本地目录，将文件信息存储在 imgMap 中
function traverseDirectory(dir: string) {
    fs.readdirSync(dir).forEach(file => {
        const filePath = path.join(dir, file);
        if (file.split('_').length < 3) { return }
        const key = file.split('_').slice(0, 2).join('_');
        const stats = fs.statSync(filePath);
        const fileSizeInBytes = stats.size;
        // 只添加大小大于1MB的文件到 imgMap
        if (fileSizeInBytes > 1024 * 1024) {
            imgMap[key] = file;
        }
    });
}

// 查询并更新artwork_vincent表中的数据
function updateArtworks() {
    db.all('SELECT id,jh_code, f_code FROM artwork_vincent', (err, rows) => {
        if (err) {
            console.error('Error querying data:', err);
            return;
        }
        rows.forEach((row: any) => {

            const key = `${row.jh_code}_${row.f_code}`;
            const filePath = imgMap[key];
            if (filePath) {
                // 更新数据库中的记录
                const sql = 'UPDATE artwork_vincent SET primary_image_large = ? WHERE id=' + row.id;
                console.log(`update SQL: ${sql}, imageFile:${filePath}`)
                db.run(sql, [filePath],
                    (err) => {
                        if (err) {
                            console.error('Error updating record:', err);
                        } else {
                            console.log(`Record updated for ${key}`);
                        }
                    });
            }

        });
    });
}

// 执行遍历目录和更新数据的操作
traverseDirectory(directoryPath);
updateArtworks();

// 关闭数据库连接
db.close();
