import { useState, useEffect } from "react";
import { List, type RowComponentProps } from "react-window";
import { useCanvasState } from "@/context/canvas.context";
import { useDotState } from "@/context/dot.context";
import { Switch } from "../ui/switch.component";
import { Slider } from "../ui/slider.component";
import { Button } from "../ui/button.component";
import { Hash, Trash, Circle } from "lucide-react";

const STANDALONE_DOTS_LAYER_INDEX = -1;

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

interface StandaloneDotRowProps {
  dots: Array<{
    id: string;
    hashFontSize?: number;
    hashOffset?: number;
    hashColor?: string;
    hashPosition?:
      | "top"
      | "top-left"
      | "top-right"
      | "right"
      | "bottom-right"
      | "bottom"
      | "bottom-left"
      | "left";
  }>;
  settings: {
    hashFontSize?: number;
    hashOffset?: number;
    hashColor?: string;
  };
  localSelectedDotId: string | null;
  onSelect: (id: string) => void;
  onRemove: (id: string) => void;
}

function StandaloneDotRow({
  index,
  style,
  dots,
  settings,
  localSelectedDotId,
  onSelect,
  onRemove,
}: RowComponentProps<StandaloneDotRowProps>) {
  const dot = dots[index];
  const hasCustomSettings =
    dot.hashFontSize !== undefined ||
    dot.hashOffset !== undefined ||
    dot.hashColor !== undefined;
  const isSelected = localSelectedDotId === dot.id;

  return (
    <section
      style={style}
      onClick={() => onSelect(dot.id)}
      className={`flex flex-row w-full h-10 min-h-10 max-h-10 border rounded cursor-pointer ${
        isSelected
          ? "border-primary bg-accent"
          : hasCustomSettings
            ? "border-yellow-500/50 bg-yellow-500/10"
            : "hover:bg-accent/50"
      }`}
    >
      <span className="font-bold border-r h-full items-center flex px-2">
        <Circle className="w-3 h-3" />
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
              onRemove(dot.id);
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
    hashStandaloneDotsEnabled,
    setHashStandaloneDotsEnabled,
    hashStandaloneDotsSettings,
    setHashStandaloneDotsSettings,
    updateActiveImageDots,
  } = useCanvasState();

  const { standaloneDots, setStandaloneDots } = useDotState();

  const activeImage = imageHistory.find((img) => img.id === activeImageId);
  const history = activeImage?.editHistory || [];

  const [selectedLayerIndex, setSelectedLayerIndex] = useState<number>(0);
  const [isStandaloneDotsMode, setIsStandaloneDotsMode] = useState(false);
  const [localSelectedDotIndex, setLocalSelectedDotIndex] = useState<
    number | null
  >(null);
  const [localSelectedDotId, setLocalSelectedDotId] = useState<string | null>(
    null,
  );
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
  const hasSelectedStandaloneDot = localSelectedDotId !== null;

  useEffect(() => {
    if (hashLayerIndex === STANDALONE_DOTS_LAYER_INDEX) {
      setIsStandaloneDotsMode(true);
      setSelectedLayerIndex(STANDALONE_DOTS_LAYER_INDEX);
    } else if (history.length === 0 && standaloneDots.length > 0) {
      setIsStandaloneDotsMode(true);
      setSelectedLayerIndex(STANDALONE_DOTS_LAYER_INDEX);
      setHashLayerIndex(STANDALONE_DOTS_LAYER_INDEX);
    } else {
      setIsStandaloneDotsMode(false);
      setSelectedLayerIndex(hashLayerIndex ?? 0);
    }
    setLocalSelectedDotIndex(hashDotIndex);
  }, [hashLayerIndex, hashDotIndex, history.length, standaloneDots.length]);

  useEffect(() => {
    if (isStandaloneDotsMode) {
      setHashEnabled(hashStandaloneDotsEnabled);
      setHashFontSize(hashStandaloneDotsSettings.hashFontSize);
      setHashOffset(hashStandaloneDotsSettings.hashOffset);
      setHashColor(hashStandaloneDotsSettings.hashColor);
      setHashPosition(hashStandaloneDotsSettings.hashPosition);
    } else if (currentLayer) {
      setHashEnabled(currentLayer.settings.hashEnabled || false);
      setHashFontSize(currentLayer.settings.hashFontSize || 12);
      setHashOffset(currentLayer.settings.hashOffset || 5);
      setHashColor(currentLayer.settings.hashColor || "#000000");
      setHashPosition(currentLayer.settings.hashPosition || "top");
    }
  }, [
    selectedLayerIndex,
    history,
    isStandaloneDotsMode,
    hashStandaloneDotsEnabled,
    hashStandaloneDotsSettings,
  ]);

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
    if (hasSelectedStandaloneDot && localSelectedDotId) {
      const selectedStandaloneDot = standaloneDots.find(
        (d) => d.id === localSelectedDotId,
      );
      if (selectedStandaloneDot) {
        setHashFontSize(
          selectedStandaloneDot.hashFontSize ??
            hashStandaloneDotsSettings.hashFontSize,
        );
        setHashOffset(
          selectedStandaloneDot.hashOffset ??
            hashStandaloneDotsSettings.hashOffset,
        );
        setHashColor(
          selectedStandaloneDot.hashColor ??
            hashStandaloneDotsSettings.hashColor,
        );
        setHashPosition(
          selectedStandaloneDot.hashPosition ??
            hashStandaloneDotsSettings.hashPosition,
        );
      }
    }
  }, [
    localSelectedDotIndex,
    localSelectedDotId,
    selectedLayerIndex,
    history,
    standaloneDots,
    hashStandaloneDotsSettings,
  ]);

  const handleLayerChange = (index: number) => {
    if (index === STANDALONE_DOTS_LAYER_INDEX) {
      setIsStandaloneDotsMode(true);
      setSelectedLayerIndex(STANDALONE_DOTS_LAYER_INDEX);
      setHashLayerIndex(STANDALONE_DOTS_LAYER_INDEX);
      setHashDotIndex(null);
      setLocalSelectedDotIndex(null);
      setLocalSelectedDotId(null);
    } else {
      setIsStandaloneDotsMode(false);
      setSelectedLayerIndex(index);
      setHashLayerIndex(index);
      setHashDotIndex(null);
      setLocalSelectedDotIndex(null);
      setLocalSelectedDotId(null);
    }
  };

  const handleDotSelect = (dotIndex: number) => {
    const newDotIndex = localSelectedDotIndex === dotIndex ? null : dotIndex;
    setLocalSelectedDotIndex(newDotIndex);
    setHashLayerIndex(selectedLayerIndex);
    setHashDotIndex(newDotIndex);
  };

  const handleStandaloneDotSelect = (dotId: string) => {
    const newDotId = localSelectedDotId === dotId ? null : dotId;
    setLocalSelectedDotId(newDotId);
    setHashLayerIndex(STANDALONE_DOTS_LAYER_INDEX);
  };

  const handleStandaloneDotRemove = (dotId: string) => {
    const newDots = standaloneDots.map((dot) => {
      if (dot.id === dotId) {
        const {
          hashFontSize: _,
          hashOffset: __,
          hashColor: ___,
          hashPosition: ____,
          ...rest
        } = dot;
        return rest;
      }
      return dot;
    });
    setStandaloneDots(newDots);
    if (activeImageId) {
      updateActiveImageDots(newDots);
    }
    if (localSelectedDotId === dotId) {
      setLocalSelectedDotId(null);
      setHashFontSize(hashStandaloneDotsSettings.hashFontSize);
      setHashOffset(hashStandaloneDotsSettings.hashOffset);
      setHashColor(hashStandaloneDotsSettings.hashColor);
      setHashPosition(hashStandaloneDotsSettings.hashPosition);
    }
  };

  const clearDotSettings = () => {
    if (isStandaloneDotsMode && localSelectedDotId) {
      const newDots = standaloneDots.map((dot) => {
        if (dot.id === localSelectedDotId) {
          const {
            hashFontSize: _,
            hashOffset: __,
            hashColor: ___,
            hashPosition: ____,
            ...rest
          } = dot;
          return rest;
        }
        return dot;
      });
      setStandaloneDots(newDots);
      if (activeImageId) {
        updateActiveImageDots(newDots);
      }
      setLocalSelectedDotId(null);
      setHashFontSize(hashStandaloneDotsSettings.hashFontSize);
      setHashOffset(hashStandaloneDotsSettings.hashOffset);
      setHashColor(hashStandaloneDotsSettings.hashColor);
      setHashPosition(hashStandaloneDotsSettings.hashPosition);
    } else {
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
    }
  };

  const handleHashToggle = (enabled: boolean) => {
    setHashEnabled(enabled);
    if (isStandaloneDotsMode) {
      setHashStandaloneDotsEnabled(enabled);
    } else {
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
    }
  };

  const handleFontSizeChange = (size: number) => {
    setHashFontSize(size);
    if (isStandaloneDotsMode) {
      if (hasSelectedStandaloneDot && localSelectedDotId) {
        const newDots = standaloneDots.map((dot) => {
          if (dot.id === localSelectedDotId) {
            return { ...dot, hashFontSize: size };
          }
          return dot;
        });
        setStandaloneDots(newDots);
        if (activeImageId) {
          updateActiveImageDots(newDots);
        }
      } else {
        setHashStandaloneDotsSettings({
          ...hashStandaloneDotsSettings,
          hashFontSize: size,
        });
      }
    } else {
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
    }
  };

  const handleOffsetChange = (offset: number) => {
    setHashOffset(offset);
    if (isStandaloneDotsMode) {
      if (hasSelectedStandaloneDot && localSelectedDotId) {
        const newDots = standaloneDots.map((dot) => {
          if (dot.id === localSelectedDotId) {
            return { ...dot, hashOffset: offset };
          }
          return dot;
        });
        setStandaloneDots(newDots);
        if (activeImageId) {
          updateActiveImageDots(newDots);
        }
      } else {
        setHashStandaloneDotsSettings({
          ...hashStandaloneDotsSettings,
          hashOffset: offset,
        });
      }
    } else {
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
    }
  };

  const handleColorChange = (color: string) => {
    setHashColor(color);
    if (isStandaloneDotsMode) {
      if (hasSelectedStandaloneDot && localSelectedDotId) {
        const newDots = standaloneDots.map((dot) => {
          if (dot.id === localSelectedDotId) {
            return { ...dot, hashColor: color };
          }
          return dot;
        });
        setStandaloneDots(newDots);
        if (activeImageId) {
          updateActiveImageDots(newDots);
        }
      } else {
        setHashStandaloneDotsSettings({
          ...hashStandaloneDotsSettings,
          hashColor: color,
        });
      }
    } else {
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
    if (isStandaloneDotsMode) {
      if (hasSelectedStandaloneDot && localSelectedDotId) {
        const newDots = standaloneDots.map((dot) => {
          if (dot.id === localSelectedDotId) {
            return { ...dot, hashPosition: position };
          }
          return dot;
        });
        setStandaloneDots(newDots);
        if (activeImageId) {
          updateActiveImageDots(newDots);
        }
      } else {
        setHashStandaloneDotsSettings({
          ...hashStandaloneDotsSettings,
          hashPosition: position,
        });
      }
    } else {
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

  if (history.length === 0 && standaloneDots.length === 0) {
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
        onChange={(e) => {
          const val = Number(e.target.value);
          if (isNaN(val)) {
            handleLayerChange(STANDALONE_DOTS_LAYER_INDEX);
          } else {
            handleLayerChange(val);
          }
        }}
      >
        {history.length > 0 ? (
          history.map((layer, index) => (
            <option key={index} value={index}>
              Слой {index + 1} ({layer.dots.length} точек, {layer.size}px)
            </option>
          ))
        ) : (
          <option disabled>Нет слоев</option>
        )}
        {standaloneDots.length > 0 && (
          <option
            key={STANDALONE_DOTS_LAYER_INDEX}
            value={STANDALONE_DOTS_LAYER_INDEX}
          >
            Отдельные точки ({standaloneDots.length})
          </option>
        )}
      </select>

      <div className="flex flex-row w-full items-center justify-between shrink-0">
        <span className="text-text">Нумерация точек:</span>
        <Switch
          checked={hashEnabled}
          onCheckedChange={handleHashToggle}
          disabled={
            !isStandaloneDotsMode &&
            (!history[selectedLayerIndex] || history.length === 0)
          }
        />
      </div>

      {hasSelectedDot && !isStandaloneDotsMode && (
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

      {hasSelectedStandaloneDot && isStandaloneDotsMode && (
        <div className="flex flex-col gap-2 p-2 border border-blue-500/50 rounded bg-blue-500/10 shrink-0">
          <div className="flex flex-row w-full items-center justify-between">
            <span className="text-blue-400 text-sm font-medium">
              Точка{" "}
              {standaloneDots.findIndex((d) => d.id === localSelectedDotId) + 1}
              /{standaloneDots.length}
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
          max={100}
          step={1}
          value={hashFontSize}
          onValueChange={(val) => handleFontSizeChange(val as number)}
          disabled={
            !hashEnabled ||
            (!isStandaloneDotsMode &&
              (!history[selectedLayerIndex] || history.length === 0))
          }
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
          disabled={
            !hashEnabled ||
            (!isStandaloneDotsMode &&
              (!history[selectedLayerIndex] || history.length === 0))
          }
        />
      </div>

      <div className="flex flex-col gap-2 shrink-0">
        <div className="flex flex-row w-full items-center justify-between">
          <span className="text-text">Цвет:</span>
          <input
            type="color"
            value={hashColor}
            onChange={(e) => handleColorChange(e.target.value)}
            disabled={
              !hashEnabled ||
              (!isStandaloneDotsMode &&
                (!history[selectedLayerIndex] || history.length === 0))
            }
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
          disabled={
            !hashEnabled ||
            (!isStandaloneDotsMode &&
              (!history[selectedLayerIndex] || history.length === 0))
          }
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

      {hashEnabled && isStandaloneDotsMode && standaloneDots.length > 0 && (
        <div className="flex flex-col gap-1 h-full overflow-y-auto pb-10">
          <span className="text-text text-sm font-medium shrink-0">
            Отдельные точки:
          </span>
          <div className="flex flex-col gap-1 flex-1">
            <List
              rowComponent={StandaloneDotRow}
              rowProps={{
                dots: standaloneDots,
                settings: hashStandaloneDotsSettings,
                localSelectedDotId,
                onSelect: handleStandaloneDotSelect,
                onRemove: handleStandaloneDotRemove,
              }}
              rowCount={standaloneDots.length}
              rowHeight={45}
              style={{ height: "100%" }}
            />
          </div>
        </div>
      )}
    </main>
  );
}
