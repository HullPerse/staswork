import JSZip from "jszip";
import { ImageData, TextElement, DotElement } from "@/types";

export interface ProcessedImage {
  name: string;
  blob: Blob;
  dimensions: { width: number; height: number };
}

export function getVisibleDotsForImage(imageData: ImageData) {
  return imageData.editHistory
    .filter((historyItem) => historyItem.visible)
    .flatMap((historyItem) => historyItem.dots);
}

export function getVisibleTextsForImage(imageData: ImageData) {
  return imageData.editHistory
    .filter((historyItem) => historyItem.visible)
    .flatMap((historyItem) => historyItem.texts);
}

export function getVisibleStandaloneDotsForImage(imageData: ImageData) {
  return imageData.editHistory
    .filter((historyItem) => historyItem.visible)
    .flatMap((historyItem) => historyItem.standaloneDots || []);
}

export async function processImageWithDots(
  imageData: ImageData,
  _currentTexts?: TextElement[],
  _currentStandaloneDots?: DotElement[],
): Promise<ProcessedImage> {
  return new Promise((resolve, reject) => {
    const img = new window.Image();
    img.crossOrigin = "anonymous";

    img.onload = () => {
      try {
        const canvas = document.createElement("canvas");
        canvas.width = imageData.dimensions.width;
        canvas.height = imageData.dimensions.height;

        const ctx = canvas.getContext("2d");
        if (!ctx) {
          reject(new Error("Ошибка при получениии контекста"));
          return;
        }

        ctx.drawImage(img, 0, 0);

        imageData.editHistory.forEach((historyItem) => {
          if (!historyItem.visible) return;

          const dotRadius = historyItem.size / 2;
          const hashEnabled = historyItem.settings.hashEnabled;
          const hashFontSize = historyItem.settings.hashFontSize || 12;
          const hashOffset = historyItem.settings.hashOffset || 5;
          const hashColor = historyItem.settings.hashColor || "black";
          const hashPosition = historyItem.settings.hashPosition || "top";

          const getHashPosition = (
            cx: number,
            cy: number,
            position: string,
            offset: number,
          ) => {
            switch (position) {
              case "top":
                return { x: cx, y: cy - dotRadius - offset, align: "center" };
              case "top-left":
                return {
                  x: cx - dotRadius - offset,
                  y: cy - dotRadius - offset,
                  align: "right",
                };
              case "top-right":
                return {
                  x: cx + dotRadius + offset,
                  y: cy - dotRadius - offset,
                  align: "left",
                };
              case "right":
                return { x: cx + dotRadius + offset, y: cy, align: "left" };
              case "bottom-right":
                return {
                  x: cx + dotRadius + offset,
                  y: cy + dotRadius + offset,
                  align: "left",
                };
              case "bottom":
                return { x: cx, y: cy + dotRadius + offset, align: "center" };
              case "bottom-left":
                return {
                  x: cx - dotRadius - offset,
                  y: cy + dotRadius + offset,
                  align: "right",
                };
              case "left":
                return { x: cx - dotRadius - offset, y: cy, align: "right" };
              default:
                return { x: cx, y: cy - dotRadius - offset, align: "center" };
            }
          };

          historyItem.dots.forEach((dot, dotIndex) => {
            ctx.beginPath();
            ctx.arc(dot.cx, dot.cy, dotRadius, 0, 2 * Math.PI);
            ctx.fillStyle = "black";
            ctx.fill();

            if (hashEnabled) {
              const fontSize = dot.hashFontSize ?? hashFontSize;
              const offset = dot.hashOffset ?? hashOffset;
              const color = dot.hashColor ?? hashColor;
              const position = dot.hashPosition ?? hashPosition;

              const pos = getHashPosition(dot.cx, dot.cy, position, offset);
              ctx.font = `bold ${fontSize}px sans-serif`;
              ctx.fillStyle = color;
              ctx.textAlign = pos.align as CanvasTextAlign;
              ctx.textBaseline = "alphabetic";
              ctx.fillText(String(dotIndex + 1), pos.x, pos.y);
            }
          });

          const texts = historyItem.texts || [];
          texts.forEach((textElement) => {
            if (textElement.visible === false) return;
            ctx.font = `${textElement.fontSize}px ${textElement.fontFamily}`;
            ctx.fillStyle = textElement.color;
            ctx.textAlign = "left";
            ctx.textBaseline = "top";
            ctx.fillText(textElement.text, textElement.x, textElement.y);
          });

          const standaloneDots = historyItem.standaloneDots || [];
          standaloneDots.forEach((dot) => {
            if (dot.visible === false) return;
            ctx.beginPath();
            ctx.arc(dot.x, dot.y, dot.size / 2, 0, 2 * Math.PI);
            ctx.fillStyle = dot.color;
            ctx.fill();
          });
        });

        const imageTexts = imageData.currentTexts || [];
        if (imageTexts.length > 0) {
          imageTexts.forEach((textElement) => {
            if (textElement.visible === false) return;
            ctx.font = `${textElement.fontSize}px ${textElement.fontFamily}`;
            ctx.fillStyle = textElement.color;
            ctx.textAlign = "left";
            ctx.textBaseline = "top";
            ctx.fillText(textElement.text, textElement.x, textElement.y);
          });
        }

        const imageDots = imageData.currentStandaloneDots || [];
        if (imageDots.length > 0) {
          imageDots.forEach((dot) => {
            if (dot.visible === false) return;
            ctx.beginPath();
            ctx.arc(dot.x, dot.y, dot.size / 2, 0, 2 * Math.PI);
            ctx.fillStyle = dot.color;
            ctx.fill();
          });
        }

        canvas.toBlob(
          (blob) => {
            if (!blob) {
              reject(new Error("Ошибка при создании blob"));
              return;
            }

            const name = imageData.name.replace(/\.[^/.]+$/, "") + ".png";
            resolve({ name, blob, dimensions: imageData.dimensions });
          },
          "image/png",
          1.0,
        );
      } catch (error) {
        reject(error);
      }
    };

    img.onerror = () => reject(new Error("Failed to load image"));
    img.src = imageData.BlobUrl;
  });
}

export async function createImageArchive(
  processedImages: ProcessedImage[],
): Promise<Blob> {
  const zip = new JSZip();

  const pdfGroups = new Map<string, ProcessedImage[]>();
  const standaloneImages: ProcessedImage[] = [];

  processedImages.forEach((image) => {
    if (image.name.includes("_страница_")) {
      const pdfName = image.name.split("_страница_")[0];
      if (!pdfGroups.has(pdfName)) {
        pdfGroups.set(pdfName, []);
      }
      pdfGroups.get(pdfName)!.push(image);
    } else {
      standaloneImages.push(image);
    }
  });

  standaloneImages.forEach((image) => {
    zip.file(image.name, image.blob);
  });

  pdfGroups.forEach((images, pdfName) => {
    const pdfFolder = zip.folder(pdfName);
    if (pdfFolder) {
      images.forEach((image) => {
        const pageName = image.name.replace(
          `${pdfName}_страница_`,
          "страница_",
        );
        pdfFolder.file(pageName, image.blob);
      });
    }
  });

  return await zip.generateAsync({ type: "blob" });
}

export async function downloadArchive(
  archiveBlob: Blob,
  filename: string = "Результат.zip",
) {
  const url = URL.createObjectURL(archiveBlob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
