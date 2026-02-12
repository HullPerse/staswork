import { useState, useEffect } from "react";
import { useCanvasState } from "@/context/canvas.context";
import { Switch } from "../ui/switch.component";
import { Slider } from "../ui/slider.component";

export default function HashSettings() {
  const { imageHistory, activeImageId, updateActiveImageHistory } =
    useCanvasState();

  const activeImage = imageHistory.find((img) => img.id === activeImageId);
  const history = activeImage?.editHistory || [];

  const [selectedLayerIndex, setSelectedLayerIndex] = useState<number>(0);
  const [hashEnabled, setHashEnabled] = useState(false);
  const [hashFontSize, setHashFontSize] = useState(12);
  const [hashOffset, setHashOffset] = useState(5);

  useEffect(() => {
    if (history[selectedLayerIndex]) {
      const layer = history[selectedLayerIndex];
      setHashEnabled(layer.settings.hashEnabled || false);
      setHashFontSize(layer.settings.hashFontSize || 12);
      setHashOffset(layer.settings.hashOffset || 5);
    }
  }, [selectedLayerIndex, history]);

  const handleLayerChange = (index: number) => {
    setSelectedLayerIndex(index);
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
      newHistory[selectedLayerIndex] = {
        ...newHistory[selectedLayerIndex],
        settings: {
          ...newHistory[selectedLayerIndex].settings,
          hashFontSize: size,
        },
      };
      updateActiveImageHistory(newHistory);
    }
  };

  const handleOffsetChange = (offset: number) => {
    setHashOffset(offset);
    const newHistory = [...history];
    if (newHistory[selectedLayerIndex]) {
      newHistory[selectedLayerIndex] = {
        ...newHistory[selectedLayerIndex],
        settings: {
          ...newHistory[selectedLayerIndex].settings,
          hashOffset: offset,
        },
      };
      updateActiveImageHistory(newHistory);
    }
  };

  return (
    <main className="flex flex-col w-full h-full gap-4">
      <select
        className="w-full p-2 bg-background border rounded text-text"
        value={selectedLayerIndex}
        onChange={(e) => handleLayerChange(Number(e.target.value))}
      >
        {history.map((layer, index) => (
          <option key={index} value={index}>
            Слой {index + 1} ({layer.dots.length} точек, {layer.size}px)
          </option>
        ))}
      </select>

      <div className="flex flex-row w-full items-center justify-between">
        <span className="text-text">Нумерация точек:</span>
        <Switch
          checked={hashEnabled}
          onCheckedChange={handleHashToggle}
          disabled={!history[selectedLayerIndex]}
        />
      </div>

      <div className="flex flex-col gap-2">
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

      <div className="flex flex-col gap-2">
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
    </main>
  );
}
