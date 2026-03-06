import { useCanvasState } from "@/context/canvas.context";
import { Slider } from "../ui/slider.component";
import { Trash2, Eye, EyeOff } from "lucide-react";
import { useState, useEffect, useRef, useCallback } from "react";

export const stampConfig = [
  {
    label: "Илюха",
    path: "./src/assets/stamps/2.png",
  },
];

export default function StampSettings() {
  const {
    stamps,
    selectedStampId,
    selectedStampIndex,
    setSelectedStampId,
    setSelectedStampIndex,
    updateStampElement,
    deleteStampElement,
    imageHistory,
    activeImageId,
  } = useCanvasState();

  // Get active image dimensions
  const activeImage = imageHistory.find((i) => i.id === activeImageId);
  const imageWidth = activeImage?.dimensions.width || 1000; // fallback width
  const imageHeight = activeImage?.dimensions.height || 1000; // fallback height
  const defaultStampSize = Math.min(imageWidth, imageHeight) * 0.2; // 2.5% of smaller dimension

  const selectedLayer = stamps.find((l) => l.id === selectedStampId);

  const [localStampSize, setLocalStampSize] = useState(defaultStampSize);

  const throttleRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (selectedLayer) {
      setLocalStampSize(selectedLayer.width);
    } else {
      setLocalStampSize(defaultStampSize);
    }
  }, [selectedLayer?.id, defaultStampSize]);

  const throttledUpdate = useCallback(
    (updates: Record<string, unknown>) => {
      if (throttleRef.current) {
        clearTimeout(throttleRef.current);
      }
      throttleRef.current = setTimeout(() => {
        if (selectedLayer) {
          updateStampElement(selectedLayer.id, updates);
        }
      }, 150);
    },
    [selectedLayer, updateStampElement],
  );

  useEffect(() => {
    return () => {
      if (throttleRef.current) {
        clearTimeout(throttleRef.current);
      }
    };
  }, []);

  const handleStampSizeChange = (value: number) => {
    setLocalStampSize(value);
    if (selectedLayer) {
      throttledUpdate({ width: value, height: value });
    }
  };

  const toggleStampVisibility = useCallback(
    (stampId: string) => {
      const stampElement = stamps.find((s) => s.id === stampId);
      if (stampElement) {
        updateStampElement(stampId, { visible: !stampElement.visible });
      }
    },
    [stamps, updateStampElement],
  );

  const deleteStampLayer = useCallback(
    (stampId: string) => {
      deleteStampElement(stampId);
      if (selectedStampId === stampId) {
        setSelectedStampId(null);
      }
    },
    [deleteStampElement, selectedStampId, setSelectedStampId],
  );

  return (
    <div className="flex flex-col gap-3 p-2 h-full">
      {/* Stamp size slider */}
      <div className="flex flex-col gap-2">
        <div className="flex flex-row w-full items-center justify-between">
          <span className="text-sm">Размер печати:</span>
          <span className="text-sm tabular-nums">{localStampSize}px</span>
        </div>
        <Slider
          min={20}
          max={1000}
          step={1}
          value={localStampSize}
          onValueChange={(value) => handleStampSizeChange(value as number)}
        />
      </div>

      {/* Stamp selection grid */}
      <div className="flex flex-row flex-wrap gap-2">
        {stampConfig.map((stamp, index) => (
          <div
            key={index}
            className={`relative flex flex-col items-center gap-1 p-2 border rounded cursor-pointer transition-colors ${
              selectedStampIndex === index
                ? "border-green-500 bg-green-500/20"
                : "border-border hover:border-green-500/50"
            }`}
            onClick={() => setSelectedStampIndex(index)}
          >
            <span className="absolute top-1 left-1 text-xs text-muted-foreground bg-background/80 px-1 rounded">
              {index + 1}
            </span>
            <img
              src={stamp.path}
              alt={stamp.label}
              className="w-16 h-16 object-contain"
            />
            <span className="text-xs text-center">{stamp.label}</span>
          </div>
        ))}
      </div>

      {/* Stamp layers list */}
      <div className="flex flex-col h-full overflow-y-auto pb-10">
        {stamps.length > 0 && (
          <div className="flex flex-col gap-2 mt-4">
            <span className="font-medium">Слои:</span>
            <div className="flex flex-col gap-1">
              {stamps.map((layer, index) => (
                <div
                  key={layer.id}
                  className={`flex flex-row items-center justify-between p-2 rounded border cursor-pointer transition-colors ${
                    selectedStampId === layer.id
                      ? "border-primary border-dashed bg-primary/10"
                      : "border-white/10 hover:border-white/30"
                  }`}
                  onClick={() => {
                    if (selectedStampId === layer.id)
                      return setSelectedStampId(null);
                    setSelectedStampId(layer.id);
                  }}
                >
                  <div className="flex items-center gap-2 flex-1 min-w-0">
                    <img
                      src={layer.path}
                      alt={layer.label}
                      className="w-8 h-8 object-contain"
                    />
                    <div className="flex flex-col min-w-0">
                      <span className="text-sm truncate">
                        {layer.label || `Печать ${index + 1}`}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {Math.round(layer.width)}px
                      </span>
                    </div>
                  </div>
                  <div className="flex flex-row items-center gap-1">
                    <button
                      className="p-1 hover:bg-white/10 rounded"
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleStampVisibility(layer.id);
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
                        deleteStampLayer(layer.id);
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
