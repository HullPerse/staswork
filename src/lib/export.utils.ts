import JSZip from "jszip";
import { ImageData, TextElement, DotElement, StampElement } from "@/types";
import { fileToDataUrl } from "@/lib/utils";

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
    .flatMap((historyItem) => historyItem.texts || []);
}

export function getVisibleStandaloneDotsForImage(imageData: ImageData) {
  return imageData.editHistory
    .filter((historyItem) => historyItem.visible)
    .flatMap((historyItem) => historyItem.standaloneDots || []);
}

const getHashPosition = (
  cx: number,
  cy: number,
  radius: number,
  position: string,
  offset: number,
) => {
  switch (position) {
    case "top":
      return { x: cx, y: cy - radius - offset, align: "center" as const };
    case "top-left":
      return {
        x: cx - radius - offset,
        y: cy - radius - offset,
        align: "right" as const,
      };
    case "top-right":
      return {
        x: cx + radius + offset,
        y: cy - radius - offset,
        align: "left" as const,
      };
    case "right":
      return { x: cx + radius + offset, y: cy, align: "left" as const };
    case "bottom-right":
      return {
        x: cx + radius + offset,
        y: cy + radius + offset,
        align: "left" as const,
      };
    case "bottom":
      return { x: cx, y: cy + radius + offset, align: "center" as const };
    case "bottom-left":
      return {
        x: cx - radius - offset,
        y: cy + radius + offset,
        align: "right" as const,
      };
    case "left":
      return { x: cx - radius - offset, y: cy, align: "right" as const };
    default:
      return { x: cx, y: cy - radius - offset, align: "center" as const };
  }
};

const loadImage = (src: string): Promise<HTMLImageElement> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
};

export async function processImageWithDots(
  imageData: ImageData,
  currentTexts?: TextElement[],
  currentStandaloneDots?: DotElement[],
  currentStamps?: StampElement[],
  hashStandaloneDotsEnabled?: boolean,
  hashStandaloneDotsSettings?: {
    hashFontSize: number;
    hashOffset: number;
    hashColor: string;
    hashPosition:
      | "top"
      | "top-left"
      | "top-right"
      | "right"
      | "bottom-right"
      | "bottom"
      | "bottom-left"
      | "left";
  },
): Promise<ProcessedImage> {
  const img = await loadImage(imageData.blobUrl);

  const canvas = document.createElement("canvas");
  canvas.width = imageData.dimensions.width;
  canvas.height = imageData.dimensions.height;

  const ctx = canvas.getContext("2d");
  if (!ctx) {
    throw new Error("Ошибка при получении контекста");
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

        const pos = getHashPosition(
          dot.cx,
          dot.cy,
          dotRadius,
          position,
          offset,
        );
        ctx.font = `bold ${fontSize}px sans-serif`;
        ctx.fillStyle = color;
        ctx.textAlign = pos.align;
        ctx.textBaseline = "alphabetic";
        ctx.fillText(String(dotIndex + 1), pos.x, pos.y);
      }
    });

    (historyItem.texts || []).forEach((textElement) => {
      if (textElement.visible === false) return;
      ctx.font = `${textElement.fontSize}px ${textElement.fontFamily}`;
      ctx.fillStyle = textElement.color;
      ctx.textAlign = "left";
      ctx.textBaseline = "top";
      ctx.fillText(textElement.text, textElement.x, textElement.y);
    });

    (historyItem.standaloneDots || []).forEach((dot, dotIndex) => {
      if (dot.visible === false) return;
      const radius = dot.size / 2;
      ctx.beginPath();
      ctx.arc(dot.x, dot.y, radius, 0, 2 * Math.PI);
      ctx.fillStyle = dot.color;
      ctx.fill();

      if (hashEnabled) {
        const fontSize = dot.hashFontSize ?? hashFontSize;
        const offset = dot.hashOffset ?? hashOffset;
        const color = dot.hashColor ?? hashColor;
        const position = dot.hashPosition ?? hashPosition;

        const pos = getHashPosition(dot.x, dot.y, radius, position, offset);
        ctx.font = `bold ${fontSize}px sans-serif`;
        ctx.fillStyle = color;
        ctx.textAlign = pos.align;
        ctx.textBaseline = "alphabetic";
        ctx.fillText(String(dotIndex + 1), pos.x, pos.y);
      }
    });
  });

  (currentTexts || []).forEach((textElement) => {
    if (textElement.visible === false) return;
    ctx.font = `${textElement.fontSize}px ${textElement.fontFamily}`;
    ctx.fillStyle = textElement.color;
    ctx.textAlign = "left";
    ctx.textBaseline = "top";
    ctx.fillText(textElement.text, textElement.x, textElement.y);
  });

  const standaloneDots = currentStandaloneDots || [];
  const standaloneHashFontSize = hashStandaloneDotsSettings?.hashFontSize ?? 12;
  const standaloneHashOffset = hashStandaloneDotsSettings?.hashOffset ?? 5;
  const standaloneHashColor = hashStandaloneDotsSettings?.hashColor ?? "black";
  const standaloneHashPosition =
    hashStandaloneDotsSettings?.hashPosition ?? "top";

  standaloneDots.forEach((dot, dotIndex) => {
    if (dot.visible === false) return;
    const radius = dot.size / 2;
    ctx.beginPath();
    ctx.arc(dot.x, dot.y, radius, 0, 2 * Math.PI);
    ctx.fillStyle = dot.color;
    ctx.fill();

    if (hashStandaloneDotsEnabled) {
      const fontSize = dot.hashFontSize ?? standaloneHashFontSize;
      const offset = dot.hashOffset ?? standaloneHashOffset;
      const color = dot.hashColor ?? standaloneHashColor;
      const position = dot.hashPosition ?? standaloneHashPosition;

      const pos = getHashPosition(dot.x, dot.y, radius, position, offset);
      ctx.font = `bold ${fontSize}px sans-serif`;
      ctx.fillStyle = color;
      ctx.textAlign = pos.align;
      ctx.textBaseline = "alphabetic";
      ctx.fillText(String(dotIndex + 1), pos.x, pos.y);
    }
  });

  const stamps = currentStamps || [];
  for (const stamp of stamps) {
    if (stamp.visible === false) continue;
    try {
      const stampImg = await loadImage(stamp.path);

      const imgAspect = stampImg.width / stampImg.height;
      const targetAspect = stamp.width / stamp.height;

      let drawWidth = stamp.width;
      let drawHeight = stamp.height;

      if (imgAspect > targetAspect) {
        drawHeight = stamp.width / imgAspect;
      } else {
        drawWidth = stamp.height * imgAspect;
      }

      ctx.drawImage(
        stampImg,
        stamp.x - drawWidth / 2,
        stamp.y - drawHeight / 2,
        drawWidth,
        drawHeight,
      );
    } catch (e) {
      console.error(e);
      console.warn("Failed to load stamp:", stamp.path);
    }
  }

  const blob = await new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (b) => {
        if (!b) reject(new Error("Ошибка при создания blob"));
        else resolve(b);
      },
      "image/png",
      1.0,
    );
  });

  const allTexts = currentTexts || [];
  const firstVisibleText = allTexts.find((t) => t.visible !== false);

  let name: string;
  if (firstVisibleText) {
    const sanitizedText = firstVisibleText.text
      .replace(/[^a-zA-Zа-яА-Я0-9\s]/g, "_")
      .trim()
      .replace(/\s+/g, "_")
      .slice(0, 50);
    name = sanitizedText + ".png";
  } else {
    name = imageData.name.replace(/\.[^/.]+$/, "") + ".png";
  }

  return { name, blob, dimensions: imageData.dimensions };
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

export interface SdotImage {
  id: string;
  name: string;
  imageData: string;
  dimensions: { width: number; height: number };
  editHistory: ImageData["editHistory"];
  currentTexts: ImageData["currentTexts"];
  currentStandaloneDots: ImageData["currentStandaloneDots"];
  currentStamps: ImageData["currentStamps"];
}

export interface SdotProject {
  version: string;
  images: SdotImage[];
}

async function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      const base64 = result.split(",")[1];
      resolve(base64);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export async function serializeProject(
  imageHistory: ImageData[],
): Promise<SdotProject> {
  const images: SdotImage[] = [];

  for (const img of imageHistory) {
    const imageData = await fileToBase64(img.file);
    images.push({
      id: img.id,
      name: img.name,
      imageData,
      dimensions: img.dimensions,
      editHistory: img.editHistory,
      currentTexts: img.currentTexts,
      currentStandaloneDots: img.currentStandaloneDots,
      currentStamps: img.currentStamps,
    });
  }

  return {
    version: "1.0",
    images,
  };
}

export async function downloadSdot(imageHistory: ImageData[]) {
  const project = await serializeProject(imageHistory);
  const json = JSON.stringify(project);
  const blob = new Blob([json], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "project.sdot";
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

function base64ToBlob(base64: string, mimeType: string = "image/png"): Blob {
  const byteCharacters = atob(base64);
  const byteNumbers = Array(byteCharacters.length);
  for (let i = 0; i < byteCharacters.length; i++) {
    byteNumbers[i] = byteCharacters.charCodeAt(i);
  }
  const byteArray = new Uint8Array(byteNumbers);
  return new Blob([byteArray], { type: mimeType });
}

function base64ToFile(
  base64: string,
  filename: string,
  mimeType: string = "image/png",
): File {
  const blob = base64ToBlob(base64, mimeType);
  return new File([blob], filename, { type: mimeType });
}

export async function loadSdotProject(file: File): Promise<ImageData[]> {
  const text = await file.text();
  const project: SdotProject = JSON.parse(text);

  if (!project.images || !Array.isArray(project.images)) {
    throw new Error("Invalid .sdot file format");
  }

  const imageDataList: ImageData[] = [];

  for (const img of project.images) {
    const file = base64ToFile(img.imageData, img.name);
    const blobUrl = await fileToDataUrl(file);

    imageDataList.push({
      id: img.id,
      file,
      blobUrl,
      dimensions: img.dimensions,
      editHistory: img.editHistory || [],
      name: img.name,
      currentTexts: img.currentTexts || [],
      currentStandaloneDots: img.currentStandaloneDots || [],
      currentStamps: img.currentStamps || [],
    });
  }

  return imageDataList;
}
