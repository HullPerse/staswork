import { Points, ImageData } from "@/types";
import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

//paste image from clipboard
export function pasteImage(
  e: ClipboardEvent,
  setImage: (file: File | null) => void,
) {
  const items = e.clipboardData?.items;
  if (!items) return;

  for (let i = 0; i < items.length; i++) {
    const item = items[i];
    if (item.type.startsWith("image/")) {
      const file = item.getAsFile();
      if (file) {
        setImage(file);
        break;
      }
    }
  }
}

//distance from point to line
export function pointToLineDistance(
  point: Points,
  lineStart: Points,
  lineEnd: Points,
): number {
  const A = point.x - lineStart.x;
  const B = point.y - lineStart.y;
  const C = lineEnd.x - lineStart.x;
  const D = lineEnd.y - lineStart.y;

  const dot = A * C + B * D;
  const lenSq = C * C + D * D;
  let param = -1;

  if (lenSq !== 0) {
    param = dot / lenSq;
  }

  let xx: number;
  let yy: number;

  if (param < 0) {
    xx = lineStart.x;
    yy = lineStart.y;
  } else if (param > 1) {
    xx = lineEnd.x;
    yy = lineEnd.y;
  } else {
    xx = lineStart.x + param * C;
    yy = lineStart.y + param * D;
  }

  const dx = point.x - xx;
  const dy = point.y - yy;

  return Math.sqrt(dx * dx + dy * dy);
}

//calculate if point is in polygon
export function isPointInPolygon(point: Points, polygon: Points[]): boolean {
  if (polygon.length < 3) return false;

  let inside = false;
  const { x, y } = point;

  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const xi = polygon[i].x;
    const yi = polygon[i].y;
    const xj = polygon[j].x;
    const yj = polygon[j].y;

    const intersect =
      yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi;

    if (intersect) {
      inside = !inside;
    }
  }

  return inside;
}

//bounds of polygon
export function getPolygonBounds(polygon: Points[]) {
  if (polygon.length === 0) return { minX: 0, minY: 0, maxX: 0, maxY: 0 };

  let minX = polygon[0].x;
  let minY = polygon[0].y;
  let maxX = polygon[0].x;
  let maxY = polygon[0].y;

  for (const point of polygon) {
    minX = Math.min(minX, point.x);
    minY = Math.min(minY, point.y);
    maxX = Math.max(maxX, point.x);
    maxY = Math.max(maxY, point.y);
  }

  return { minX, minY, maxX, maxY };
}

//calculate polygon centroid (center point)
export function getPolygonCenter(polygon: Points[]): Points {
  if (polygon.length === 0) return { x: 0, y: 0 };

  let sumX = 0;
  let sumY = 0;

  for (const point of polygon) {
    sumX += point.x;
    sumY += point.y;
  }

  return {
    x: sumX / polygon.length,
    y: sumY / polygon.length,
  };
}

//calculate rotating around center point
export function rotatePoint(
  point: Points,
  center: Points,
  angleDegrees: number,
): Points {
  const angleRadians = (angleDegrees * Math.PI) / 180;
  const cos = Math.cos(angleRadians);
  const sin = Math.sin(angleRadians);

  const translatedX = point.x - center.x;
  const translatedY = point.y - center.y;

  const rotatedX = translatedX * cos - translatedY * sin;
  const rotatedY = translatedX * sin + translatedY * cos;

  return {
    x: rotatedX + center.x,
    y: rotatedY + center.y,
  };
}

//calculate polygon area using shoelace formula
export function getPolygonArea(polygon: Points[]): number {
  if (polygon.length < 3) return 0;

  let area = 0;
  const n = polygon.length;

  for (let i = 0; i < n; i++) {
    const j = (i + 1) % n;
    area += polygon[i].x * polygon[j].y;
    area -= polygon[j].x * polygon[i].y;
  }

  return Math.abs(area / 2);
}

//calculate percentage of are
export function calculatePercentage(area: number, areas: number[]) {
  const totalArea = areas.reduce((a, b) => a + b, 0);
  return Math.round((area * 100) / totalArea);
}

//calculate proportions
export function calculateProportions(amount: number, percentages: number[]) {
  const proportions = percentages.map((p) => (p / 100) * amount);
  const floored = proportions.map(Math.floor);
  const remainders = proportions.map((p, i) => p - floored[i]);

  const dots = [...floored];
  let remainingDots = amount - floored.reduce((a, b) => a + b, 0);

  while (remainingDots > 0) {
    const maxIdx = remainders.indexOf(Math.max(...remainders));
    dots[maxIdx]++;
    remainders[maxIdx] = 0;
    remainingDots--;
  }

  return dots;
}

//convert file to data URL
export async function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result as string;
      resolve(result);
    };
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsDataURL(file);
  });
}

//get image dimensions from file
export function getImageDimensions(file: File): Promise<{ width: number; height: number }> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      const src = event.target?.result as string;
      const img = new Image();
      img.onload = () => {
        resolve({
          width: img.width,
          height: img.height,
        });
      };
      img.onerror = () => reject(new Error('Failed to load image'));
      img.src = src;
    };
    reader.readAsDataURL(file);
  });
}

//create image data from file
export async function createImageData(file: File): Promise<ImageData> {
  const [dataUrl, dimensions] = await Promise.all([
    fileToDataUrl(file),
    getImageDimensions(file),
  ]);
  
  return {
    id: crypto.randomUUID(),
    file,
    dataUrl,
    dimensions,
    editHistory: [],
    name: file.name,
  };
}
