import {
  getPolygonBounds,
  getPolygonCenter,
  isPointInPolygon,
  pointToLineDistance,
} from "@/lib/utils";
import { memo, useEffect, useMemo, useRef } from "react";
import { TransformComponent, TransformWrapper } from "react-zoom-pan-pinch";
import { useCanvasState } from "@/context/canvas.context";
import { useTextState } from "@/context/text.context";
import { useDotState } from "@/context/dot.context";

import ModeRenderer from "./canvas.renderer";

function ImageCanvas() {
  const {
    area,
    points,
    amount,
    size,
    gap,
    padding,
    rotation,
    setResults,
    imageHistory,
    activeImageId,
    textMode,
    dotMode,
    randomJitter,
    jitter,
  } = useCanvasState();

  const { texts, selectedTextId, updateTextElement, deleteTextElement } =
    useTextState();

  const { standaloneDots, selectedDotId, updateDotElement, deleteDotElement } =
    useDotState();

  const activeImage = imageHistory.find((img) => img.id === activeImageId);
  const file = activeImage?.file;
  const dimensions = activeImage?.dimensions || { width: 0, height: 0 };
  const history = activeImage?.editHistory || [];
  const imgSrc = useMemo(() => (file ? URL.createObjectURL(file) : ""), [file]);

  const dots = useMemo(() => {
    if (!area || points.length < 3) return [];

    const result: { cx: number; cy: number }[] = [];
    const step = size + gap;

    const bounds = getPolygonBounds(points);
    const center = getPolygonCenter(points);

    const maxRadius = Math.max(
      Math.abs(bounds.maxX - center.x),
      Math.abs(bounds.minX - center.x),
      Math.abs(bounds.maxY - center.y),
      Math.abs(bounds.minY - center.y),
    );

    const angleRad = (rotation * Math.PI) / 180;
    const dirX = { x: Math.cos(angleRad), y: Math.sin(angleRad) };
    const dirY = { x: -Math.sin(angleRad), y: Math.cos(angleRad) };

    const startX = center.x - maxRadius * dirX.x - maxRadius * dirY.x;
    const startY = center.y - maxRadius * dirX.y - maxRadius * dirY.y;

    let count = 0;
    const maxSteps = Math.ceil((2 * maxRadius) / step) * 2;

    for (let row = 0; row < maxSteps && count < Number(amount); row++) {
      for (let col = 0; col < maxSteps && count < Number(amount); col++) {
        const worldX = startX + col * step * dirX.x + row * step * dirY.x;
        const worldY = startY + col * step * dirX.y + row * step * dirY.y;

        const point = { x: worldX, y: worldY };

        if (
          worldX < bounds.minX - padding ||
          worldX > bounds.maxX + padding ||
          worldY < bounds.minY - padding ||
          worldY > bounds.maxY + padding
        ) {
          continue;
        }

        if (isPointInPolygon(point, points)) {
          const edgeDistances = points.every((_, i) => {
            const p1 = points[i];
            const p2 = points[(i + 1) % points.length];
            const dist = pointToLineDistance(point, p1, p2);
            return dist >= padding;
          });

          if (edgeDistances || padding === 0) {
            const jitterX = randomJitter ? Math.random() * jitter : 0;
            const jitterY = randomJitter ? Math.random() * jitter : 0;
            result.push({ cx: worldX + jitterX, cy: worldY + jitterY });
            count++;
          }
        }
      }
    }

    return result;
  }, [
    JSON.stringify(points),
    area,
    amount,
    size,
    gap,
    padding,
    rotation,
    randomJitter,
    jitter,
  ]);

  const setResultsRef = useRef(setResults);
  setResultsRef.current = setResults;

  useEffect(() => {
    setResultsRef.current(dots);
  }, [dots]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (selectedTextId && textMode) {
        const selectedText = texts.find((t) => t.id === selectedTextId);
        if (!selectedText) return;

        const moveDistance = e.shiftKey ? 10 : 1;
        let newX = selectedText.x;
        let newY = selectedText.y;

        switch (e.key) {
          case "Delete":
            deleteTextElement(selectedTextId);
            break;
          case "ArrowUp":
            e.preventDefault();
            newY -= moveDistance;
            break;
          case "ArrowDown":
            e.preventDefault();
            newY += moveDistance;
            break;
          case "ArrowLeft":
            e.preventDefault();
            newX -= moveDistance;
            break;
          case "ArrowRight":
            e.preventDefault();
            newX += moveDistance;
            break;
          default:
            return;
        }

        if (e.key.startsWith("Arrow")) {
          updateTextElement(selectedTextId, { x: newX, y: newY });
        }
        return;
      }

      if (selectedDotId && dotMode) {
        const selectedDot = standaloneDots.find((d) => d.id === selectedDotId);
        if (!selectedDot) return;

        const moveDistance = e.shiftKey ? 10 : 1;
        let newX = selectedDot.x;
        let newY = selectedDot.y;

        switch (e.key) {
          case "Delete":
            deleteDotElement(selectedDotId);
            break;
          case "ArrowUp":
            e.preventDefault();
            newY -= moveDistance;
            break;
          case "ArrowDown":
            e.preventDefault();
            newY += moveDistance;
            break;
          case "ArrowLeft":
            e.preventDefault();
            newX -= moveDistance;
            break;
          case "ArrowRight":
            e.preventDefault();
            newX += moveDistance;
            break;
          default:
            return;
        }

        if (e.key.startsWith("Arrow")) {
          updateDotElement(selectedDotId, { x: newX, y: newY });
        }
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [
    selectedTextId,
    selectedDotId,
    textMode,
    dotMode,
    deleteTextElement,
    deleteDotElement,
    texts,
    standaloneDots,
    updateTextElement,
    updateDotElement,
  ]);

  const renderContent = () => {
    if (!textMode && !dotMode) {
      return ModeRenderer({ imgSrc, dimensions, dots, history }).renderLasso;
    }
    if (dotMode) {
      return ModeRenderer({ imgSrc, dimensions, dots, history }).renderDot;
    }
    if (textMode) {
      return ModeRenderer({ imgSrc, dimensions, dots, history }).renderText;
    }

    return ModeRenderer({ imgSrc, dimensions, dots, history }).renderDefault;
  };

  return (
    <main
      className="flex h-full w-full border rounded"
      onContextMenu={(e) => e.preventDefault()}
    >
      <TransformWrapper
        limitToBounds={false}
        initialScale={1}
        minScale={0.5}
        maxScale={5}
        centerOnInit={true}
        panning={{
          allowLeftClickPan: false,
          allowMiddleClickPan: false,
          allowRightClickPan: true,
        }}
        wheel={{ step: 0.1 }}
      >
        <TransformComponent
          contentStyle={{ width: "100%", height: "100%" }}
          wrapperStyle={{ width: "100%", height: "100%" }}
        >
          {renderContent()}
        </TransformComponent>
      </TransformWrapper>
    </main>
  );
}

export default memo(ImageCanvas);
