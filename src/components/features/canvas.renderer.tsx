import { ReactLassoSelect } from "react-lasso-select";
import { SelectionPolygon, SvgOverlay } from "../shared/svg.component";
import { DotRenderer, GeneratedDot } from "./dot.renderer";
import { HistoryRenderer } from "./history.renderer";
import { TextRenderer } from "./text.renderer";
import { StampRenderer } from "./stamp.renderer";
import { Image } from "../shared/image.component";
import {
  DotElement,
  Points,
  PointsHistory,
  TextElement,
  StampElement,
} from "@/types";
import { useCallback, type MouseEvent } from "react";
import { useCanvasState } from "@/context/canvas.context";
import { useTextState } from "@/context/text.context";
import { useDotState } from "@/context/dot.context";
import { useUndoState } from "@/context/undo.context";
import { useDotDrag, useTextDrag, useStampDrag } from "@/hook/canvas.hook";
import { stampConfig } from "./stamp.settings";

export default function ModeRenderer({
  dots,
  imgSrc,
  dimensions,
  history,
}: {
  dots: { cx: number; cy: number }[];
  imgSrc: string;
  dimensions: { width: number; height: number };
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
  const { recordAction } = useUndoState();
  const {
    setArea,
    points,
    setPoints,
    size,
    setResults,
    editIndex,
    textMode,
    dotMode,
    stampMode,
    stamps,
    setStamps,
    selectedStampIndex,
    selectedStampId,
    setSelectedStampId,
    updateStampElement,
    hashStandaloneDotsEnabled,
    hashStandaloneDotsSettings,
    imageHistory,
    activeImageId,
  } = useCanvasState();

  // Get active image dimensions
  const activeImage = imageHistory.find((i) => i.id === activeImageId);
  const imageWidth = activeImage?.dimensions.width || 1000; // fallback width
  const imageHeight = activeImage?.dimensions.height || 1000; // fallback height
  const defaultStampSize = Math.min(imageWidth, imageHeight) * 0.2; // 2.5% of smaller dimension

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
    (e: MouseEvent<SVGSVGElement>) => {
      if (!textMode && !dotMode && !stampMode) return;

      const target = e.target as SVGElement;
      if (
        target.tagName === "text" ||
        target.tagName === "g" ||
        target.tagName === "image" ||
        target.tagName === "circle"
      ) {
        return;
      }

      // If a stamp is already selected from layers, don't place new stamps
      if (stampMode && selectedStampId !== null) {
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
        recordAction({ type: "addText", data: newTextElement });
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
        recordAction({ type: "addDot", data: newDotElement });
      } else if (stampMode && selectedStampIndex !== null) {
        const selectedStamp = stampConfig[selectedStampIndex];
        if (selectedStamp) {
          const newStampElement: StampElement = {
            id: `stamp-${Date.now()}`,
            x,
            y,
            path: selectedStamp.path,
            label: selectedStamp.label,
            width: defaultStampSize || 64,
            height: defaultStampSize || 64,
            visible: true,
          };
          setStamps([...stamps, newStampElement]);
          setSelectedStampId(newStampElement.id);
        }
      }
    },
    [
      textMode,
      dotMode,
      stampMode,
      texts,
      textSettings,
      setTexts,
      setSelectedTextId,
      standaloneDots,
      dotSettings,
      setStandaloneDots,
      setSelectedDotId,
      stamps,
      selectedStampId,
      selectedStampIndex,
      setStamps,
      setSelectedStampId,
      recordAction,
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
  const handleStampMouseDown = useStampDrag(
    { updateElement: updateStampElement, setSelectedId: setSelectedStampId },
    stamps,
  );

  const handleTextClick = useCallback(
    (e: MouseEvent, textId: string) => {
      e.stopPropagation();
      if (textMode) {
        setSelectedTextId(textId);
      }
    },
    [textMode, setSelectedTextId],
  );

  const handleDotClick = useCallback(
    (e: MouseEvent, dotId: string) => {
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
      {!stampMode && (texts.length > 0 || standaloneDots.length > 0) && (
        <SvgOverlay
          dimensions={dimensions}
          className={`absolute inset-0 ${textMode ? "cursor-crosshair" : "pointer-events-none"}`}
          onClick={textMode ? handleCanvasClick : undefined}
        >
          <DotRenderer
            isInteractive={dotMode}
            selectedDotId={selectedDotId}
            onDotMouseDown={handleDotMouseDown}
            onDotClick={handleDotClick}
            hashEnabled={hashStandaloneDotsEnabled}
            hashFontSize={hashStandaloneDotsSettings.hashFontSize}
            hashOffset={hashStandaloneDotsSettings.hashOffset}
            hashColor={hashStandaloneDotsSettings.hashColor}
            hashPosition={hashStandaloneDotsSettings.hashPosition}
          />
          <TextRenderer
            texts={texts}
            isInteractive={textMode}
            selectedTextId={selectedTextId}
            onTextMouseDown={handleTextMouseDown}
            onTextClick={handleTextClick}
          />
          <StampRenderer
            stamps={stamps}
            isInteractive={true}
            selectedStampId={selectedStampId}
            onStampMouseDown={handleStampMouseDown}
          />
        </SvgOverlay>
      )}
      {/* Stamps overlay - show only when not in text/dot/hash modes */}
      {stampMode && stamps.length > 0 && (
        <SvgOverlay
          dimensions={dimensions}
          className="absolute inset-0 pointer-events-none"
        >
          <StampRenderer
            stamps={stamps}
            isInteractive={true}
            selectedStampId={selectedStampId}
            onStampMouseDown={handleStampMouseDown}
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
          isInteractive={true}
          selectedDotId={selectedDotId}
          onDotMouseDown={handleDotMouseDown}
          onDotClick={handleDotClick}
          hashEnabled={hashStandaloneDotsEnabled}
          hashFontSize={hashStandaloneDotsSettings.hashFontSize}
          hashOffset={hashStandaloneDotsSettings.hashOffset}
          hashColor={hashStandaloneDotsSettings.hashColor}
          hashPosition={hashStandaloneDotsSettings.hashPosition}
        />
        <TextRenderer texts={texts} isInteractive={false} />
        <GeneratedDot dots={dots} size={size} />

        <StampRenderer
          stamps={stamps}
          isInteractive={true}
          selectedStampId={selectedStampId}
          onStampMouseDown={handleStampMouseDown}
        />
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
        <HistoryRenderer
          history={history}
          editIndex={editIndex}
          showTexts={false}
        />
        <TextRenderer
          texts={texts}
          isInteractive={true}
          selectedTextId={selectedTextId}
          onTextMouseDown={handleTextMouseDown}
          onTextClick={handleTextClick}
        />
        <DotRenderer
          isInteractive={false}
          hashEnabled={hashStandaloneDotsEnabled}
          hashFontSize={hashStandaloneDotsSettings.hashFontSize}
          hashOffset={hashStandaloneDotsSettings.hashOffset}
          hashColor={hashStandaloneDotsSettings.hashColor}
          hashPosition={hashStandaloneDotsSettings.hashPosition}
        />
        <GeneratedDot dots={dots} size={size} />

        <StampRenderer
          stamps={stamps}
          isInteractive={true}
          selectedStampId={selectedStampId}
          onStampMouseDown={handleStampMouseDown}
        />
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
        <DotRenderer
          isInteractive={false}
          hashEnabled={hashStandaloneDotsEnabled}
          hashFontSize={hashStandaloneDotsSettings.hashFontSize}
          hashOffset={hashStandaloneDotsSettings.hashOffset}
          hashColor={hashStandaloneDotsSettings.hashColor}
          hashPosition={hashStandaloneDotsSettings.hashPosition}
        />
        <TextRenderer
          texts={texts}
          isInteractive={textMode}
          selectedTextId={selectedTextId}
          onTextMouseDown={handleTextMouseDown}
          onTextClick={handleTextClick}
        />
        <GeneratedDot dots={dots} size={size} />

        <StampRenderer
          stamps={stamps}
          isInteractive={true}
          selectedStampId={selectedStampId}
          onStampMouseDown={handleStampMouseDown}
        />
      </SvgOverlay>
    </div>
  );

  const renderStampMode = () => (
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
        <StampRenderer
          stamps={stamps}
          isInteractive={true}
          selectedStampId={selectedStampId}
          onStampMouseDown={handleStampMouseDown}
        />
      </SvgOverlay>
    </div>
  );

  return {
    renderLasso: renderLasso(),
    renderDot: renderDotMode(),
    renderText: renderTextMode(),
    renderStamp: renderStampMode(),
    renderDefault: renderDefaultView(),
  };
}
