import { PDFService } from '../service/pdf.service';

const pdfService = PDFService.getInstance();

export function isPDFFile(file: File): boolean {
  return file.type === 'application/pdf';
}

export async function convertPDFToImages(file: File) {
  return await pdfService.convertPDFToImages(file);
}