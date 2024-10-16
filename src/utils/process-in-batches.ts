/**
 * Processes an array of tasks in batches with a specified concurrency.
 * @param items - The array of items to process.
 * @param taskFn - The async function to execute on each item.
 * @param batchSize - The number of items to process concurrently.
 * @returns - A promise that resolves when all tasks are complete.
 */

export async function processInBatches<T, R>( batchSize: number,items: T[],  taskFn: (item: T) => Promise<R> ): Promise<R[]> {
    const results: R[] = [];
  
    for (let i = 0; i < items.length; i += batchSize) {
      const batch = items.slice(i, i + batchSize); // Get the current batch of items
      const batchResults = await Promise.all(batch.map(taskFn)); // Process the batch concurrently
      results.push(...batchResults); // Store the results
    }
  
    return results;
  }
  