import { useState, useEffect } from "react";
import { List, type RowComponentProps } from "react-window";
import { useCanvasState } from "@/context/canvas.context";
import { Switch } from "../ui/switch.component";
import { Slider } from "../ui/slider.component";
import { Button } from "../ui/button.component";
import { Hash, Trash } from "lucide-react";

interface DotRowProps {
  dots: Array<{
    hashFontSize?: number;
    hashOffset?: number;
    hashColor?: string;
  }>;
  settings: {
    hashColor?: string;
    hashFontSize?: number;
  };
  localSelectedDotIndex: number | null;
  onSelect: (index: number) => void;
  onRemove: (index: number) => void;
}

function DotRow({
  index,
  style,
  dots,
  settings,
  localSelectedDotIndex,
  onSelect,
  onRemove,
}: RowComponentProps<DotRowProps>) {
  const dot = dots[index];
  const hasCustomSettings =
    dot.hashFontSize !== undefined ||
    dot.hashOffset !== undefined ||
    dot.hashColor !== undefined;
  const isSelected = localSelectedDotIndex === index;

  return (
    <section
      style={style}
      onClick={() => onSelect(index)}
      className={`flex flex-row w-full h-10 min-h-10 max-h-10 border rounded cursor-pointer ${
        isSelected
          ? "border-primary bg-accent"
          : hasCustomSettings
            ? "border-yellow-500/50 bg-yellow-500/10"
            : "hover:bg-accent/50"
      }`}
    >
      <span className="font-bold border-r h-full items-center flex px-2">
        #{index + 1}
      </span>
      <span className="flex items-center justify-center px-2 text-xs text-muted-foreground">
        {hasCustomSettings ? (
          <span className="flex items-center gap-1">
            <span
              className="w-3 h-3 rounded-full border"
              style={{
                backgroundColor:
                  dot.hashColor || settings.hashColor || "#000000",
              }}
            />
            {dot.hashFontSize || settings.hashFontSize || 12}
            px
          </span>
        ) : (
          <Hash className="w-3 h-3" />
        )}
      </span>
      <div className="flex flex-row ml-auto p-1 h-full items-center justify-center gap-1">
        {hasCustomSettings && (
          <button
            className="cursor-pointer p-1 hover:text-destructive"
            onClick={(e) => {
              e.stopPropagation();
              onRemove(index);
            }}
          >
            <Trash className="w-3 h-3" />
          </button>
        )}
      </div>
    </section>
  );
}

export default function HashSettings() {
  const {
    imageHistory,
    activeImageId,
    updateActiveImageHistory,
    hashLayerIndex,
    hashDotIndex,
    setHashLayerIndex,
    setHashDotIndex,
  } = useCanvasState();

  const activeImage = imageHistory.find((img) => img.id === activeImageId);
  const history = activeImage?.editHistory || [];

  const [selectedLayerIndex, setSelectedLayerIndex] = useState<number>(0);
  const [localSelectedDotIndex, setLocalSelectedDotIndex] = useState<
    number | null
  >(null);
  const [hashEnabled, setHashEnabled] = useState(false);
  const [hashFontSize, setHashFontSize] = useState(12);
  const [hashOffset, setHashOffset] = useState(5);
  const [hashColor, setHashColor] = useState("#000000");
  const [hashPosition, setHashPosition] = useState<
    | "top"
    | "top-left"
    | "top-right"
    | "right"
    | "bottom-right"
    | "bottom"
    | "bottom-left"
    | "left"
  >("top");

  const currentLayer = history[selectedLayerIndex];
  const selectedDot = currentLayer?.dots?.[hashDotIndex ?? -1];
  const hasSelectedDot = localSelectedDotIndex !== null;

  useEffect(() => {
    setSelectedLayerIndex(hashLayerIndex ?? 0);
    setLocalSelectedDotIndex(hashDotIndex);
  }, [hashLayerIndex, hashDotIndex]);

  useEffect(() => {
    if (currentLayer) {
      setHashEnabled(currentLayer.settings.hashEnabled || false);
      setHashFontSize(currentLayer.settings.hashFontSize || 12);
      setHashOffset(currentLayer.settings.hashOffset || 5);
      setHashColor(currentLayer.settings.hashColor || "#000000");
      setHashPosition(currentLayer.settings.hashPosition || "top");
    }
  }, [selectedLayerIndex, history]);

  useEffect(() => {
    if (hasSelectedDot && selectedDot) {
      setHashFontSize(
        selectedDot.hashFontSize ?? currentLayer?.settings.hashFontSize ?? 12,
      );
      setHashOffset(
        selectedDot.hashOffset ?? currentLayer?.settings.hashOffset ?? 5,
      );
      setHashColor(
        selectedDot.hashColor ?? currentLayer?.settings.hashColor ?? "#000000",
      );
      setHashPosition(
        selectedDot.hashPosition ??
          currentLayer?.settings.hashPosition ??
          "top",
      );
    }
  }, [localSelectedDotIndex, selectedLayerIndex, history]);

  const handleLayerChange = (index: number) => {
    setSelectedLayerIndex(index);
    setHashLayerIndex(index);
    setHashDotIndex(null);
    setLocalSelectedDotIndex(null);
  };

  const handleDotSelect = (dotIndex: number) => {
    const newDotIndex = localSelectedDotIndex === dotIndex ? null : dotIndex;
    setLocalSelectedDotIndex(newDotIndex);
    setHashLayerIndex(selectedLayerIndex);
    setHashDotIndex(newDotIndex);
  };

  const clearDotSettings = () => {
    const newHistory = [...history];
    if (newHistory[selectedLayerIndex] && localSelectedDotIndex !== null) {
      const newDots = [...newHistory[selectedLayerIndex].dots];
      const {
        hashFontSize: _,
        hashOffset: __,
        hashColor: ___,
        ...rest
      } = newDots[localSelectedDotIndex];
      newDots[localSelectedDotIndex] = rest;
      newHistory[selectedLayerIndex] = {
        ...newHistory[selectedLayerIndex],
        dots: newDots,
      };
      updateActiveImageHistory(newHistory);
      setLocalSelectedDotIndex(null);
      setHashDotIndex(null);
      setHashFontSize(currentLayer?.settings.hashFontSize ?? 12);
      setHashOffset(currentLayer?.settings.hashOffset ?? 5);
      setHashColor(currentLayer?.settings.hashColor ?? "#000000");
    }
  };

  const handleHashToggle = (enabled: boolean) => {
    setHashEnabled(enabled);
    const newHistory = [...history];
    if (newHistory[selectedLayerIndex]) {
      newHistory[selectedLayerIndex] = {
        ...newHistory[selectedLayerIndex],
        settings: {
          ...newHistory[selectedLayerIndex].settings,
          hashEnabled: enabled,
        },
      };
      updateActiveImageHistory(newHistory);
    }
  };

  const handleFontSizeChange = (size: number) => {
    setHashFontSize(size);
    const newHistory = [...history];
    if (newHistory[selectedLayerIndex]) {
      if (hasSelectedDot && localSelectedDotIndex !== null) {
        const newDots = [...newHistory[selectedLayerIndex].dots];
        newDots[localSelectedDotIndex] = {
          ...newDots[localSelectedDotIndex],
          hashFontSize: size,
        };
        newHistory[selectedLayerIndex] = {
          ...newHistory[selectedLayerIndex],
          dots: newDots,
        };
      } else {
        newHistory[selectedLayerIndex] = {
          ...newHistory[selectedLayerIndex],
          settings: {
            ...newHistory[selectedLayerIndex].settings,
            hashFontSize: size,
          },
        };
      }
      updateActiveImageHistory(newHistory);
    }
  };

  const handleOffsetChange = (offset: number) => {
    setHashOffset(offset);
    const newHistory = [...history];
    if (newHistory[selectedLayerIndex]) {
      if (hasSelectedDot && localSelectedDotIndex !== null) {
        const newDots = [...newHistory[selectedLayerIndex].dots];
        newDots[localSelectedDotIndex] = {
          ...newDots[localSelectedDotIndex],
          hashOffset: offset,
        };
        newHistory[selectedLayerIndex] = {
          ...newHistory[selectedLayerIndex],
          dots: newDots,
        };
      } else {
        newHistory[selectedLayerIndex] = {
          ...newHistory[selectedLayerIndex],
          settings: {
            ...newHistory[selectedLayerIndex].settings,
            hashOffset: offset,
          },
        };
      }
      updateActiveImageHistory(newHistory);
    }
  };

  const handleColorChange = (color: string) => {
    setHashColor(color);
    const newHistory = [...history];
    if (newHistory[selectedLayerIndex]) {
      if (hasSelectedDot && localSelectedDotIndex !== null) {
        const newDots = [...newHistory[selectedLayerIndex].dots];
        newDots[localSelectedDotIndex] = {
          ...newDots[localSelectedDotIndex],
          hashColor: color,
        };
        newHistory[selectedLayerIndex] = {
          ...newHistory[selectedLayerIndex],
          dots: newDots,
        };
      } else {
        newHistory[selectedLayerIndex] = {
          ...newHistory[selectedLayerIndex],
          settings: {
            ...newHistory[selectedLayerIndex].settings,
            hashColor: color,
          },
        };
      }
      updateActiveImageHistory(newHistory);
    }
  };

  const handlePositionChange = (
    position:
      | "top"
      | "top-left"
      | "top-right"
      | "right"
      | "bottom-right"
      | "bottom"
      | "bottom-left"
      | "left",
  ) => {
    setHashPosition(position);
    const newHistory = [...history];
    if (newHistory[selectedLayerIndex]) {
      if (hasSelectedDot && localSelectedDotIndex !== null) {
        const newDots = [...newHistory[selectedLayerIndex].dots];
        newDots[localSelectedDotIndex] = {
          ...newDots[localSelectedDotIndex],
          hashPosition: position,
        };
        newHistory[selectedLayerIndex] = {
          ...newHistory[selectedLayerIndex],
          dots: newDots,
        };
      } else {
        newHistory[selectedLayerIndex] = {
          ...newHistory[selectedLayerIndex],
          settings: {
            ...newHistory[selectedLayerIndex].settings,
            hashPosition: position,
          },
        };
      }
      updateActiveImageHistory(newHistory);
    }
  };

  const removeDotHash = (dotIndex: number) => {
    const newHistory = [...history];
    if (newHistory[selectedLayerIndex]) {
      const newDots = [...newHistory[selectedLayerIndex].dots];
      const {
        hashFontSize: _,
        hashOffset: __,
        hashColor: ___,
        ...rest
      } = newDots[dotIndex];
      newDots[dotIndex] = rest;
      newHistory[selectedLayerIndex] = {
        ...newHistory[selectedLayerIndex],
        dots: newDots,
      };
      updateActiveImageHistory(newHistory);
    }
  };

  if (history.length === 0) {
    return (
      <main className="flex flex-col w-full h-full items-center justify-center">
        <span className="text-2xl text-center">Пока нет данных</span>
      </main>
    );
  }

  return (
    <main className="flex flex-col w-full h-full gap-2">
      <select
        className="w-full p-2 bg-background border rounded text-text shrink-0"
        value={selectedLayerIndex}
        onChange={(e) => handleLayerChange(Number(e.target.value))}
      >
        {history.map((layer, index) => (
          <option key={index} value={index}>
            Слой {index + 1} ({layer.dots.length} точек, {layer.size}px)
          </option>
        ))}
      </select>

      <div className="flex flex-row w-full items-center justify-between shrink-0">
        <span className="text-text">Нумерация точек:</span>
        <Switch
          checked={hashEnabled}
          onCheckedChange={handleHashToggle}
          disabled={!history[selectedLayerIndex]}
        />
      </div>

      {hasSelectedDot && (
        <div className="flex flex-col gap-2 p-2 border border-blue-500/50 rounded bg-blue-500/10 shrink-0">
          <div className="flex flex-row w-full items-center justify-between">
            <span className="text-blue-400 text-sm font-medium">
              Точка {localSelectedDotIndex + 1}/{currentLayer?.dots.length}
            </span>
            <Button
              variant="ghost"
              size="sm"
              onClick={clearDotSettings}
              className="text-xs h-6 text-muted-foreground hover:text-destructive"
            >
              Сбросить
            </Button>
          </div>
        </div>
      )}

      <div className="flex flex-col gap-2 shrink-0">
        <div className="flex flex-row w-full items-center justify-between">
          <span className="text-text">Размер шрифта:</span>
          <span>{hashFontSize}</span>
        </div>
        <Slider
          min={8}
          max={32}
          step={1}
          value={hashFontSize}
          onValueChange={(val) => handleFontSizeChange(val as number)}
          disabled={!hashEnabled || !history[selectedLayerIndex]}
        />
      </div>

      <div className="flex flex-col gap-2 shrink-0">
        <div className="flex flex-row w-full items-center justify-between">
          <span className="text-text">Отступ от точки:</span>
          <span>{hashOffset}</span>
        </div>
        <Slider
          min={0}
          max={30}
          step={1}
          value={hashOffset}
          onValueChange={(val) => handleOffsetChange(val as number)}
          disabled={!hashEnabled || !history[selectedLayerIndex]}
        />
      </div>

      <div className="flex flex-col gap-2 shrink-0">
        <div className="flex flex-row w-full items-center justify-between">
          <span className="text-text">Цвет:</span>
          <input
            type="color"
            value={hashColor}
            onChange={(e) => handleColorChange(e.target.value)}
            disabled={!hashEnabled || !history[selectedLayerIndex]}
            className="w-8 h-8 rounded cursor-pointer"
          />
        </div>
      </div>

      <div className="flex flex-col gap-2 shrink-0">
        <span className="text-text">Позиция:</span>
        <select
          className="w-full p-2 bg-background border rounded text-text"
          value={hashPosition}
          onChange={(e) => handlePositionChange(e.target.value as any)}
          disabled={!hashEnabled || !history[selectedLayerIndex]}
        >
          <option value="top">Сверху</option>
          <option value="top-right">Сверху справа</option>
          <option value="right">Справа</option>
          <option value="bottom-right">Снизу справа</option>
          <option value="bottom">Снизу</option>
          <option value="bottom-left">Снизу слева</option>
          <option value="left">Слева</option>
          <option value="top-left">Сверху слева</option>
        </select>
      </div>

      {hashEnabled && currentLayer && (
        <div className="flex flex-col gap-1 h-full overflow-y-auto pb-10">
          <span className="text-text text-sm font-medium shrink-0">Точки:</span>
          <div className="flex flex-col gap-1 flex-1">
            <List
              rowComponent={DotRow}
              rowProps={{
                dots: currentLayer.dots,
                settings: currentLayer.settings,
                localSelectedDotIndex,
                onSelect: handleDotSelect,
                onRemove: removeDotHash,
              }}
              rowCount={currentLayer.dots.length}
              rowHeight={45}
              style={{ height: "100%" }}
            />
          </div>
        </div>
      )}
    </main>
  );
}
