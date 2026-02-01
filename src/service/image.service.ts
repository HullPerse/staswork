import { PDFService } from './pdf.service';

export interface ProcessedFile {
  file: File;
  dimensions: { width: number; height: number };
  sourceFile?: File;
  pageNumber?: number;
}

export default class ImageStorage {
  private cache = new Map<string, Blob>();
  private maxCacheSize = 50;
  private pdfService = PDFService.getInstance();

  async storeImage(id: string, file: File): Promise<string> {
    const blob = file.slice(0, file.size);

    if (this.cache.size >= this.maxCacheSize) {
      const firstKey = this.cache.keys().next().value;
      this.cache.delete(firstKey as string);
    }

    this.cache.set(id, blob);
    return URL.createObjectURL(blob);
  }

  async processFile(file: File): Promise<ProcessedFile[]> {
    if (file.type === 'application/pdf') {
      // Convert PDF to images
      const pages = await this.pdfService.convertPDFToImages(file);
      return pages.map(page => ({
        file: page.file,
        dimensions: page.dimensions,
        sourceFile: file,
        pageNumber: page.pageNumber
      }));
    } else {
      // Regular image processing
      const dimensions = await this.getImageDimensions(file);
      return [{
        file,
        dimensions,
        sourceFile: undefined,
        pageNumber: undefined
      }];
    }
  }

  private async getImageDimensions(file: File): Promise<{ width: number; height: number }> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      const url = URL.createObjectURL(file);
      
      img.onload = () => {
        URL.revokeObjectURL(url);
        resolve({
          width: img.naturalWidth,
          height: img.naturalHeight
        });
      };
      
      img.onerror = () => {
        URL.revokeObjectURL(url);
        reject(new Error('Failed to load image'));
      };
      
      img.src = url;
    });
  }

  cleanup() {
    this.cache.forEach((_, id) => {
      URL.revokeObjectURL(id);
    });
    this.cache.clear();
  }
}
