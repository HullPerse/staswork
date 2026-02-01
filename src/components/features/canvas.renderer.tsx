import { ReactLassoSelect } from "react-lasso-select";
import { SelectionPolygon, SvgOverlay } from "../shared/svg.component";
import { DotRenderer, GeneratedDot } from "./dot.renderer";
import { HistoryRenderer } from "./history.renderer";
import { TextRenderer } from "./text.renderer";
import { Image } from "../shared/image.component";
import { DotElement, Points, PointsHistory, TextElement } from "@/types";
import { useCallback } from "react";
import { useCanvasState } from "@/context/canvas.context";
import { useTextState } from "@/context/text.context";
import { useDotState } from "@/context/dot.context";
import { useDotDrag, useTextDrag } from "@/hook/canvas.hook";

export default function ModeRenderer({
  imgSrc,
  dimensions,
  dots,
  history,
}: {
  imgSrc: string;
  dimensions: { width: number; height: number };
  dots: { cx: number; cy: number }[];
  history: PointsHistory[];
}) {
  const {
    texts,
    selectedTextId,
    setTexts,
    textSettings,
    setSelectedTextId,
    updateTextElement,
  } = useTextState();
  const {
    standaloneDots,
    selectedDotId,
    dotSettings,
    setStandaloneDots,
    setSelectedDotId,
    updateDotElement,
  } = useDotState();
  const {
    setArea,
    points,
    setPoints,
    size,
    setResults,
    editIndex,
    textMode,
    dotMode,
  } = useCanvasState();

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

  const handleTextMouseDown = useTextDrag(
    { updateElement: updateTextElement, setSelectedId: setSelectedTextId },
    texts,
  );
  const handleDotMouseDown = useDotDrag(
    { updateElement: updateDotElement, setSelectedId: setSelectedDotId },
    standaloneDots,
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

  const renderLasso = () => (
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
        <GeneratedDot dots={dots} size={size} />
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
          <DotRenderer
            dots={standaloneDots}
            isInteractive={dotMode}
            selectedDotId={selectedDotId}
            onDotMouseDown={handleDotMouseDown}
            onDotClick={handleDotClick}
          />
          <TextRenderer
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
        <DotRenderer
          dots={standaloneDots}
          isInteractive={true}
          selectedDotId={selectedDotId}
          onDotMouseDown={handleDotMouseDown}
          onDotClick={handleDotClick}
        />
        <TextRenderer texts={texts} isInteractive={false} />
        <GeneratedDot dots={dots} size={size} />
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
        <TextRenderer
          texts={texts}
          isInteractive={true}
          selectedTextId={selectedTextId}
          onTextMouseDown={handleTextMouseDown}
          onTextClick={handleTextClick}
        />
        <DotRenderer dots={standaloneDots} isInteractive={false} />
        <GeneratedDot dots={dots} size={size} />
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
        <TextRenderer
          texts={texts}
          isInteractive={textMode}
          selectedTextId={selectedTextId}
          onTextMouseDown={handleTextMouseDown}
          onTextClick={handleTextClick}
        />
        <DotRenderer dots={standaloneDots} isInteractive={false} />
        <GeneratedDot dots={dots} size={size} />
      </SvgOverlay>
    </div>
  );

  return {
    renderLasso: renderLasso(),
    renderDot: renderDotMode(),
    renderText: renderTextMode(),
    renderDefault: renderDefaultView(),
  };
}
