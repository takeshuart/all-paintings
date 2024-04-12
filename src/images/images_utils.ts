import * as fs from 'fs';
import { promisify } from 'util';

//识别图片的主要颜色

// 将读取图片封装为异步函数
const readFileAsync = promisify(fs.readFile);
