import COS from 'cos-nodejs-sdk-v5';
import * as fs from 'fs';
import * as path from 'path';
import pLimit from 'p-limit';

/**
 * 这里使用的永久密钥，官方建议使用临时密钥
 */
const SECRET_ID: string = '';
const SECRET_KEY: string = '';
const BUCKET: string = '';
const REGION: string = '';


const cos: COS = new COS({
    SecretId: SECRET_ID,
    SecretKey: SECRET_KEY,
});

/**
 * Uploads a file to Tencent Cloud COS using the 'putObject' method.
 * This method is suitable for files up to 5GB.
 * https://cloud.tencent.com/document/product/436/7749
 * @param {string} localFilePath - The local path of the file to upload.
 * @param {string} cosKey - The destination path/key in the COS bucket.，ex: small/123.jgp
 */
export async function uploadFile(localFilePath: string, cosKey: string): Promise<void> {
    console.log(`Starting upload for file: ${path.basename(localFilePath)} to COS key: ${cosKey}`);

    if (!fs.existsSync(localFilePath)) {
        throw new Error(`Local file not found at path: ${localFilePath}`);
    }

    try {
        const fileStream = fs.createReadStream(localFilePath);

        const data = await cos.putObject({
            Bucket: BUCKET,
            Region: REGION,
            Key: cosKey,
            StorageClass: 'STANDARD', // Standard storage class
            Body: fileStream,
            // onProgress is an optional callback to monitor upload progress
            onProgress: function (progressData) {
                console.log(`[Progress] Uploaded: ${progressData.loaded} bytes, Total: ${progressData.total} bytes, Speed: ${progressData.speed} bytes/s`);
            }
        });

        console.log(`Upload Successful！Url:https://${BUCKET}.cos.${REGION}.myqcloud.com${cosKey}`);

    } catch (error) {
        const cosError = error as COS.CosSdkError;
        console.error(`Upload Failed! Error Code: ${cosError.statusCode || 'N/A'},Error Message: ${cosError.message || JSON.stringify(error)}`);
    }
}


export interface CosFileTask {
    localPath: string;
    cosKey: string;
}

export async function batchUploadFiles(tasks: CosFileTask[], limitCount: number = 10): Promise<void> {
    if (tasks.length === 0) {
        console.log('No files to upload. Batch finished.');
        return;
    }

    const totalFiles = tasks.length;
    let completedCount = 0;
    let failedCount = 0;

    console.log(`Starting Batch Upload...`);
    console.log(`Total files: ${totalFiles}. Concurrency limit: ${limitCount}`);

    const limit = pLimit(limitCount);

    // Function to calculate and display the current progress
    const printProgress = () => {
        const percent = ((completedCount + failedCount) / totalFiles) * 100;
        process.stdout.write(
            `\r[PROGRESS] Total: ${totalFiles} | Completed: ${completedCount} (Success) / ${failedCount} (Failed) | ${percent.toFixed(2)}% `
        );
    };

    const limitedPromises = tasks.map(task => {
        return limit(async () => {
            try {
                await uploadFile(task.localPath, task.cosKey);
                completedCount++;
                console.log(`[SUCCESS] Uploaded! ${task.cosKey}.`); // Print success on its own line
            } catch (error) {
                failedCount++;
                console.error(`[FAIL] Task failed for ${task.cosKey}. Error: ${(error as Error).message}`);
                // We just record the failure and continue.
                return { success: false, key: task.cosKey };
            } finally {
                printProgress();
            }
        });
    });

    try {
        await Promise.all(limitedPromises);

        // Final summary print after all tasks are done
        console.log('\n\n--- Batch Upload Complete ---');
        console.log(`Summary: ${completedCount} successful, ${failedCount} failed.`);

    } catch (finalError) {
        console.error('\nFATAL: Batch upload failed unexpectedly.', finalError);
    }
}

