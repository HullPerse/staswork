import {
  getPolygonBounds,
  getPolygonCenter,
  isPointInPolygon,
  pointToLineDistance,
} from "@/lib/utils";
import { Points, TextElement, DotElement } from "@/types";
import { useCallback, useEffect, useMemo, useRef } from "react";
import { ReactLassoSelect } from "react-lasso-select";
import { Image } from "../shared/image.component";
import { TransformComponent, TransformWrapper } from "react-zoom-pan-pinch";
import { useCanvasState } from "@/context/canvas.context";
import { useTextState } from "@/context/text.context";
import { useDotState } from "@/context/dot.context";
import { GeneratedDots, StandaloneDots } from "./dot.renderer";
import { TextsRenderer } from "./text.renderer";
import { HistoryRenderer } from "./history.renderer";
import { SvgOverlay, SelectionPolygon } from "../shared/svg.component";
import { useTextDrag, useDotDrag } from "../../hook/canvas.hook";

export default function ImageCanvas() {
  const {
    area,
    setArea,
    points,
    setPoints,
    amount,
    size,
    gap,
    padding,
    rotation,
    setResults,
    editIndex,
    imageHistory,
    activeImageId,
    textMode,
    dotMode,
    randomJitter,
  } = useCanvasState();

  const {
    texts,
    textSettings,
    selectedTextId,
    setSelectedTextId,
    updateTextElement,
    deleteTextElement,
    setTexts,
  } = useTextState();

  const {
    standaloneDots,
    dotSettings,
    selectedDotId,
    setSelectedDotId,
    updateDotElement,
    deleteDotElement,
    setStandaloneDots,
  } = useDotState();

  const activeImage = imageHistory.find((img) => img.id === activeImageId);
  const file = activeImage?.file;
  const dimensions = activeImage?.dimensions || { width: 0, height: 0 };
  const history = activeImage?.editHistory || [];
  const imgSrc = useMemo(() => (file ? URL.createObjectURL(file) : ""), [file]);

  const handleTextMouseDown = useTextDrag(
    { updateElement: updateTextElement, setSelectedId: setSelectedTextId },
    texts,
  );
  const handleDotMouseDown = useDotDrag(
    { updateElement: updateDotElement, setSelectedId: setSelectedDotId },
    standaloneDots,
  );

  const handleLassoChange = useCallback(
    (value: Points[]) => {
      setPoints(value);
      if (value.length === 0) {
        setArea(false);
      }
    },
    [setPoints, setArea],
  );

  const handleLassoComplete = useCallback(
    (value: Points[]) => {
      if (value.length >= 3) {
        setPoints(value);
        setArea(true);
      } else {
        setArea(false);
        setPoints([]);
        setResults([]);
      }
    },
    [setPoints, setArea, setResults],
  );

  const handleCanvasClick = useCallback(
    (e: React.MouseEvent<SVGSVGElement>) => {
      if (!textMode && !dotMode) return;

      const target = e.target as SVGElement;
      if (
        target.tagName === "text" ||
        target.tagName === "g" ||
        target.tagName === "circle"
      ) {
        return;
      }

      const svg = e.currentTarget;
      const rect = svg.getBoundingClientRect();
      const viewBox = svg.viewBox.baseVal;

      const x = ((e.clientX - rect.left) / rect.width) * viewBox.width;
      const y = ((e.clientY - rect.top) / rect.height) * viewBox.height;

      if (textMode) {
        const newTextElement: TextElement = {
          id: `text-${Date.now()}`,
          x,
          y,
          text: textSettings.text || "Текст",
          fontSize: textSettings.fontSize,
          fontFamily: textSettings.fontFamily,
          color: textSettings.color,
          visible: true,
        };
        setTexts([...texts, newTextElement]);
        setSelectedTextId(newTextElement.id);
      } else if (dotMode) {
        const newDotElement: DotElement = {
          id: `dot-${Date.now()}`,
          x,
          y,
          size: dotSettings.size,
          color: dotSettings.color,
          visible: true,
        };
        setStandaloneDots([...standaloneDots, newDotElement]);
        setSelectedDotId(newDotElement.id);
      }
    },
    [
      textMode,
      dotMode,
      texts,
      textSettings,
      setTexts,
      setSelectedTextId,
      standaloneDots,
      dotSettings,
      setStandaloneDots,
      setSelectedDotId,
    ],
  );

  const handleTextClick = useCallback(
    (e: React.MouseEvent, textId: string) => {
      e.stopPropagation();
      if (textMode) {
        setSelectedTextId(textId);
      }
    },
    [textMode, setSelectedTextId],
  );

  const handleDotClick = useCallback(
    (e: React.MouseEvent, dotId: string) => {
      e.stopPropagation();
      if (dotMode) {
        setSelectedDotId(dotId);
      }
    },
    [dotMode, setSelectedDotId],
  );

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
            const jitterX = randomJitter ? Math.random() * 2 : 0;
            const jitterY = randomJitter ? Math.random() * 2 : 0;
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

  const renderLassoMode = () => (
    <div className="relative">
      <ReactLassoSelect
        value={points}
        src={imgSrc}
        onChange={handleLassoChange}
        onComplete={handleLassoComplete}
        imageStyle={{
          maxHeight: "100%",
          maxWidth: "100%",
          objectFit: "contain",
        }}
      />

      {/* Generated dots overlay */}
      <SvgOverlay dimensions={dimensions}>
        <GeneratedDots dots={dots} size={size} />
      </SvgOverlay>

      {/* History overlay */}
      {history.length > 0 && (
        <SvgOverlay dimensions={dimensions}>
          <HistoryRenderer history={history} editIndex={editIndex} />
        </SvgOverlay>
      )}

      {/* Current texts and standalone dots overlay */}
      {(texts.length > 0 || standaloneDots.length > 0) && (
        <SvgOverlay
          dimensions={dimensions}
          className={`absolute inset-0 ${textMode ? "cursor-crosshair" : "pointer-events-none"}`}
          onClick={textMode ? handleCanvasClick : undefined}
        >
          <StandaloneDots
            dots={standaloneDots}
            isInteractive={dotMode}
            selectedDotId={selectedDotId}
            onDotMouseDown={handleDotMouseDown}
            onDotClick={handleDotClick}
          />
          <TextsRenderer
            texts={texts}
            isInteractive={textMode}
            selectedTextId={selectedTextId}
            onTextMouseDown={handleTextMouseDown}
            onTextClick={handleTextClick}
          />
        </SvgOverlay>
      )}
    </div>
  );

  const renderDotMode = () => (
    <div className="relative">
      <Image
        src={imgSrc}
        alt="Image"
        className="block max-h-full max-w-full object-contain"
        draggable={false}
      />
      <SvgOverlay
        dimensions={dimensions}
        className="absolute inset-0 cursor-crosshair"
        onClick={handleCanvasClick}
      >
        <HistoryRenderer history={history} editIndex={editIndex} />
        <StandaloneDots
          dots={standaloneDots}
          isInteractive={true}
          selectedDotId={selectedDotId}
          onDotMouseDown={handleDotMouseDown}
          onDotClick={handleDotClick}
        />
        <TextsRenderer texts={texts} isInteractive={false} />
        <GeneratedDots dots={dots} size={size} />
      </SvgOverlay>
    </div>
  );

  const renderTextMode = () => (
    <div className="relative">
      <Image
        src={imgSrc}
        alt="Image"
        className="block max-h-full max-w-full object-contain"
        draggable={false}
      />
      <SvgOverlay
        dimensions={dimensions}
        className="absolute inset-0 cursor-crosshair"
        onClick={handleCanvasClick}
      >
        <HistoryRenderer history={history} editIndex={editIndex} />
        <TextsRenderer
          texts={texts}
          isInteractive={true}
          selectedTextId={selectedTextId}
          onTextMouseDown={handleTextMouseDown}
          onTextClick={handleTextClick}
        />
        <StandaloneDots dots={standaloneDots} isInteractive={false} />
        <GeneratedDots dots={dots} size={size} />
      </SvgOverlay>
    </div>
  );

  const renderDefaultView = () => (
    <div className="relative">
      <Image
        src={imgSrc}
        alt="Image"
        className="block max-h-full max-w-full object-contain"
        draggable={false}
      />
      <SvgOverlay
        dimensions={dimensions}
        className={`absolute inset-0 ${textMode ? "" : "pointer-events-none"}`}
        onClick={textMode ? handleCanvasClick : undefined}
      >
        <SelectionPolygon points={points} />
        <HistoryRenderer history={history} editIndex={editIndex} />
        <TextsRenderer
          texts={texts}
          isInteractive={textMode}
          selectedTextId={selectedTextId}
          onTextMouseDown={handleTextMouseDown}
          onTextClick={handleTextClick}
        />
        <StandaloneDots dots={standaloneDots} isInteractive={false} />
        <GeneratedDots dots={dots} size={size} />
      </SvgOverlay>
    </div>
  );

  const renderContent = () => {
    if (!textMode && !dotMode) {
      return renderLassoMode();
    }
    if (dotMode) {
      return renderDotMode();
    }
    if (textMode) {
      return renderTextMode();
    }
    return renderDefaultView();
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
