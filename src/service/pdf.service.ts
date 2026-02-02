import { GlobalWorkerOptions, getDocument } from "pdfjs-dist";

GlobalWorkerOptions.workerSrc = new URL(
  "pdfjs-dist/build/pdf.worker.mjs",
  import.meta.url,
).toString();

export interface ConvertedPage {
  pageNumber: number;
  imageUrl: string;
  width: number;
  height: number;
  originalFile: File;
}

export interface ProcessedFile {
  file: File;
  dimensions: { width: number; height: number };
  sourceFile?: File;
  pageNumber?: number;
}

export class PDFService {
  private static instance: PDFService;

  static getInstance(): PDFService {
    if (!PDFService.instance) {
      PDFService.instance = new PDFService();
    }
    return PDFService.instance;
  }

  async convertPDFToImages(
    file: File,
    scale: number = 2.0,
  ): Promise<ProcessedFile[]> {
    try {
      const arrayBuffer = await file.arrayBuffer();
      const pdf = await getDocument({ data: arrayBuffer }).promise;
      const processedFiles: ProcessedFile[] = [];

      for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
        const page = await pdf.getPage(pageNum);
        const viewport = page.getViewport({ scale });

        const canvas = document.createElement("canvas");
        const context = canvas.getContext("2d");

        if (!context) {
          throw new Error("Could not get canvas context");
        }

        canvas.width = viewport.width;
        canvas.height = viewport.height;

        await page.render({
          canvasContext: context,
          viewport: viewport,
          canvas: canvas,
        }).promise;

        const imageUrl = canvas.toDataURL("image/png");

        const imageFile = await this.dataURLtoFile(
          imageUrl,
          `${file.name.replace(".pdf", "")}_page_${pageNum}.png`,
        );

        processedFiles.push({
          file: imageFile,
          dimensions: {
            width: viewport.width,
            height: viewport.height,
          },
          sourceFile: file,
          pageNumber: pageNum,
        });
      }

      return processedFiles;
    } catch (error) {
      console.error("Error converting PDF to images:", error);
      throw new Error(
        `Failed to convert PDF: ${error instanceof Error ? error.message : "Unknown error"}`,
      );
    }
  }

  private async dataURLtoFile(
    dataURL: string,
    filename: string,
  ): Promise<File> {
    return new Promise((resolve, reject) => {
      try {
        const arr = dataURL.split(",");
        const mime = arr[0].match(/:(.*?);/)?.[1];
        const bstr = atob(arr[1]);
        let n = bstr.length;
        const u8arr = new Uint8Array(n);

        while (n--) {
          u8arr[n] = bstr.charCodeAt(n);
        }

        const file = new File([u8arr], filename, { type: mime });
        resolve(file);
      } catch (error) {
        reject(error);
      }
    });
  }

  async validatePDF(file: File): Promise<boolean> {
    try {
      if (file.type !== "application/pdf") {
        return false;
      }

      const arrayBuffer = await file.arrayBuffer();
      const pdf = await getDocument({ data: arrayBuffer }).promise;
      return pdf.numPages > 0;
    } catch {
      return false;
    }
  }

  async getPDFInfo(file: File): Promise<{ pages: number; title?: string }> {
    try {
      const arrayBuffer = await file.arrayBuffer();
      const pdf = await getDocument({ data: arrayBuffer }).promise;

      let title: string | undefined;
      try {
        const metadata = await pdf.getMetadata();
        title = (metadata.info as any)?.Title;
      } catch (error) {
        console.error(error);
      }

      return {
        pages: pdf.numPages,
        title,
      };
    } catch (error) {
      throw new Error(
        `Failed to read PDF info: ${error instanceof Error ? error.message : "Unknown error"}`,
      );
    }
  }
}
