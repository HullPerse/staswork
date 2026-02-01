export default class ImageStorage {
  private cache = new Map<string, Blob>();
  private maxCacheSize = 50;

  async storeImage(id: string, file: File): Promise<string> {
    const blob = file.slice(0, file.size);

    if (this.cache.size >= this.maxCacheSize) {
      const firstKey = this.cache.keys().next().value;
      this.cache.delete(firstKey as string);
    }

    this.cache.set(id, blob);
    return URL.createObjectURL(blob);
  }

  cleanup() {
    this.cache.forEach((_, id) => {
      URL.revokeObjectURL(id);
    });
    this.cache.clear();
  }
}
