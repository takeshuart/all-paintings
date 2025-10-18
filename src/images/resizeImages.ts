import { getAllItemsOfPath, searchEagleItems } from "./eagleApi";
import fs from "fs-extra";
import path from "path";
import sharp from "sharp";
import pLimit from "p-limit"; //control batch size, version 3.0 only


interface ResizeTask {
  inputPath: string;
  outputDir: string;
}

async function main() {
  const inputDir = "E:\\Arts.library";
  const outputDir = "D:\\image test\\vgCollections-medium";

  const items = await getAllItemsOfPath("/Vincent/Collections");

  
  const tasks: ResizeTask[] = items.map(item => {
    const fileDir = path.join(inputDir, item.filePath);
    return { inputPath: path.join(fileDir, item.fileName), outputDir: outputDir }
  });

  console.log(`Found ${items.length} items. Start resizing...`);

  const options: ResizeOptions = {
    maxSize: 1200,
    format: "webp",
    quality:90
  }

  batchResizeImages(tasks, options, 10)
}
main()





//Google’s cwebp vs Sharp?  
interface ResizeOptions {
  width?: number;
  height?: number;
  maxSize?: number; //limit height and width 
  quality?: number; // (1-100),default 80
  //output format, If no format is specified, the original format is retained.
  format?: "jpeg" | "jpg" | "png" | "webp" | "avif" | "tiff";
  outputFileName?: string; // Optional: custom output filename (without extension)
}
/**
 * resize and compress an image 
 * @param inputPath  input file path
 * @param outputDir auto create if not exist,The output file will keep the original name (or use outputName if provided),
 * @param options size\quality\format
 */
export async function resizeImage(inputPath: string, outputDir: string, options: ResizeOptions = {}): Promise<void> {
  try {
    const dir = path.dirname(outputDir);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

    const image = sharp(inputPath);

    const metadata = await image.metadata();
    const format = options.format || metadata.format || "jpeg";

    let pipeline = image.resize({
      width: options.maxSize ? options.maxSize : options.width,
      height: options.maxSize ? options.maxSize : options.height,
      fit: "inside",  // Keep scaling
      //If less than the maximum value, keep the resolution
      withoutEnlargement: true,
    });

    switch (format) {
      case "jpeg":
        pipeline = pipeline.jpeg({ quality: options.quality ?? 80 });
        break;
      case "png":
        pipeline = pipeline.png({ compressionLevel: 9 });
        break;
      case "webp":
        pipeline = pipeline.webp({ quality: options.quality ?? 80 });
        break;
      case "avif":
        pipeline = pipeline.avif({ quality: options.quality ?? 50 });
        break;
      case "tiff":
        pipeline = pipeline.tiff({ quality: options.quality ?? 80 });
        break;
    }

    const { name } = path.parse(inputPath);
    const finalName = options.outputFileName || name;//default,use original name
    const outputPath = path.join(outputDir, `${finalName}.${format}`);

    await pipeline.toFile(outputPath);
    console.log(`Processed: ${inputPath} → ${outputPath}`);

  } catch (error) {
    console.error(`Failed to process ${inputPath}:`, error);
  }
}




/**
 * 批量并发调整图片尺寸
 * @param tasks 输入与输出文件路径列表
 * @param options 尺寸、质量、格式
 * @param concurrency 并发数
 */
export async function batchResizeImages(tasks: ResizeTask[], options: ResizeOptions, concurrency = 5) {
  const limit = pLimit(concurrency);
  let completed = 0;

  const promises = tasks.map(task =>
    limit(async () => {
      try {
        await resizeImage(task.inputPath, task.outputDir, options);
        completed++;
        console.log(`${completed}/${tasks.length}: ${task.inputPath}\n`);
      } catch (err) {
        console.log(`Failed: ${task.inputPath}\n`);
      }
    })
  );

  await Promise.all(promises);
  console.log(`✔ All ${tasks.length} images processed.`);

}