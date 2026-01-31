import { useCanvasState } from "@/context/canvas.context";
import { Slider } from "../ui/slider.component";
import { Trash2, Move, Eye, EyeOff } from "lucide-react";
import { useState, useEffect, useRef, useCallback } from "react";

export default function DotSettings() {
  const {
    dotSettings,
    setDotSettings,
    standaloneDots,
    imageHistory,
    activeImageId,
    selectedDotId,
    setSelectedDotId,
    updateDotElement,
    deleteDotElement,
  } = useCanvasState();

  const activeImage = imageHistory.find((img) => img.id === activeImageId);
  const history = activeImage?.editHistory || [];


  const allDots = [
    ...standaloneDots,
    ...history
      .filter((item) => item.visible)
      .flatMap((item) =>
        (item.standaloneDots || []).map((dot) => ({
          ...dot,
          visible: dot.visible !== undefined ? dot.visible : true,
        })),
      ),
  ];

  const selectedLayer = allDots.find((l) => l.id === selectedDotId);


  const [localDotSize, setLocalDotSize] = useState(
    selectedLayer?.size || dotSettings.size,
  );

  const throttleRef = useRef<NodeJS.Timeout | null>(null);


  useEffect(() => {
    if (selectedLayer) {
      setLocalDotSize(selectedLayer.size);
    } else {
      setLocalDotSize(dotSettings.size);
    }
  }, [selectedLayer?.id, dotSettings]);


  const throttledUpdate = useCallback(
    (updates: Record<string, unknown>) => {
      if (throttleRef.current) {
        clearTimeout(throttleRef.current);
      }
      throttleRef.current = setTimeout(() => {
        if (selectedLayer) {

          updateDotElement(selectedLayer.id, updates);
        }
      }, 150);
    },
    [selectedLayer, updateDotElement],
  );


  useEffect(() => {
    return () => {
      if (throttleRef.current) {
        clearTimeout(throttleRef.current);
      }
    };
  }, []);

  const handleDotSizeChange = (value: number) => {
    setLocalDotSize(value);
    if (selectedLayer) {
      throttledUpdate({ size: value });
    } else {

      setDotSettings({ ...dotSettings, size: value });
    }
  };

  const toggleDotVisibility = useCallback(
    (dotId: string) => {
      const dotElement = allDots.find((d) => d.id === dotId);
      if (dotElement) {
        updateDotElement(dotId, { visible: !dotElement.visible });
      }
    },
    [allDots, updateDotElement],
  );

  const deleteDotLayer = useCallback(
    (dotId: string) => {
      deleteDotElement(dotId);
      if (selectedDotId === dotId) {
        setSelectedDotId(null);
      }
    },
    [deleteDotElement, selectedDotId, setSelectedDotId],
  );

  return (
    <div className="flex flex-col gap-3 p-2 h-full">
      {/* Dot size */}
      <div className="flex flex-col gap-2">
        <div className="flex flex-row w-full items-center justify-between">
          <span className="text-sm">Размер точки:</span>
          <span className="text-sm tabular-nums">{localDotSize}px</span>
        </div>
        <Slider
          min={1}
          max={30}
          step={1}
          value={localDotSize}
          onValueChange={(value) => handleDotSizeChange(value as number)}
        />
      </div>

      {/* Dot layers list */}
      <div className="flex flex-col h-full overflow-y-auto">
        {allDots.length > 0 && (
          <div className="flex flex-col gap-2 mt-4">
            <span className="font-medium">Слои:</span>
            <div className="flex flex-col gap-1">
              {allDots.map((layer, index) => (
                <div
                  key={layer.id}
                  className={`flex flex-row items-center justify-between p-2 rounded border cursor-pointer transition-colors ${
                    selectedDotId === layer.id
                      ? "border-primary border-dashed bg-primary/10"
                      : "border-white/10 hover:border-white/30"
                  }`}
                  onClick={() => {
                    if (selectedDotId === layer.id)
                      return setSelectedDotId(null);
                    setSelectedDotId(layer.id);
                  }}
                >
                  <div className="flex items-center gap-2 flex-1 min-w-0">
                    <Move className="size-3 text-white/50 shrink-0" />
                    <div className="flex items-center gap-2">
                      <div
                        className="w-3 h-3 rounded-full border border-white/20"
                        style={{ backgroundColor: layer.color }}
                      />
                      <span className="text-sm truncate">
                        {index + 1}. Точка ({Math.round(layer.size)}px)
                      </span>
                    </div>
                  </div>
                  <div className="flex flex-row gap-1 shrink-0">
                    <button
                      className="p-1 hover:bg-white/20 rounded text-white/70"
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleDotVisibility(layer.id);
                      }}
                      title={layer.visible ? "Hide" : "Show"}
                    >
                      {layer.visible ? (
                        <Eye className="size-4" />
                      ) : (
                        <EyeOff className="size-4" />
                      )}
                    </button>
                    <button
                      className="p-1 hover:bg-red-500/20 rounded text-red-500"
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteDotLayer(layer.id);
                      }}
                      title="Delete"
                    >
                      <Trash2 className="size-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
