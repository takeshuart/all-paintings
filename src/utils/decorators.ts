export function catchDbError(
  target: any,
  propertyKey: string,
  descriptor: PropertyDescriptor
) {
  const originalMethod = descriptor.value;
  descriptor.value = function (...args: any[]) {
    try {
      return originalMethod.apply(this, args);
    } catch (err) {
      console.error(`[DB Error] ${target.constructor.name}.${propertyKey}:`, err);
      if (propertyKey.startsWith('get') || propertyKey.startsWith('find')) return [];
      if (propertyKey.startsWith('insert')) return null;
      if (propertyKey.startsWith('update') || propertyKey.startsWith('delete')) return 0;
      return null;
    }
  };
  return descriptor;
}
