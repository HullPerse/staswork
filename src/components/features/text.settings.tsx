import { useCanvasState } from "@/context/canvas.context";
import { useTextState } from "@/context/text.context";
import { Input } from "../ui/input.component";
import { Slider } from "../ui/slider.component";
import { Trash2, Move, Eye, EyeOff } from "lucide-react";
import { useState, useEffect, useRef, useCallback } from "react";

const FONT_FAMILIES = [
  "Arial",
  "Times New Roman",
  "Georgia",
  "Verdana",
  "Courier New",
  "Impact",
  "Comic Sans MS",
];

export default function TextSettings() {
  const { updateActiveImageTexts } = useCanvasState();

  const {
    textSettings,
    setTextSettings,
    texts,
    setTexts,
    selectedTextId,
    setSelectedTextId,
    updateTextElement,
    deleteTextElement,
  } = useTextState();

  const selectedLayer = texts.find((l) => l.id === selectedTextId);

  const [localText, setLocalText] = useState(
    selectedLayer?.text || textSettings.text || "",
  );
  const [localFontSize, setLocalFontSize] = useState(
    selectedLayer?.fontSize || textSettings.fontSize,
  );
  const [localFontFamily, setLocalFontFamily] = useState(
    selectedLayer?.fontFamily || textSettings.fontFamily,
  );

  const throttleRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (selectedLayer) {
      setLocalText(selectedLayer.text);
      setLocalFontSize(selectedLayer.fontSize);
      setLocalFontFamily(selectedLayer.fontFamily);
    } else {
      setLocalText(textSettings.text);
      setLocalFontSize(textSettings.fontSize);
      setLocalFontFamily(textSettings.fontFamily);
    }
  }, [selectedLayer?.id, textSettings]);

  const throttledUpdate = useCallback(
    (updates: Record<string, unknown>) => {
      if (throttleRef.current) {
        clearTimeout(throttleRef.current);
      }
      throttleRef.current = setTimeout(() => {
        if (selectedLayer) {
          updateTextElement(selectedLayer.id, updates);
        }
      }, 150);
    },
    [selectedLayer, updateTextElement],
  );

  useEffect(() => {
    return () => {
      if (throttleRef.current) {
        clearTimeout(throttleRef.current);
      }
    };
  }, []);

  const handleTextChange = (value: string) => {
    setLocalText(value);

    if (selectedLayer) {
      throttledUpdate({ text: value || "Текст" });
    } else {
      setTextSettings({ ...textSettings, text: value });
    }
  };

  const handleFontSizeChange = (value: number) => {
    setLocalFontSize(value);
    if (selectedLayer) {
      throttledUpdate({ fontSize: value });
    } else {
      setTextSettings({ ...textSettings, fontSize: value });
    }
  };

  const handleFontFamilyChange = (value: string) => {
    setLocalFontFamily(value);
    if (selectedLayer) {
      throttledUpdate({ fontFamily: value });
    } else {
      setTextSettings({ ...textSettings, fontFamily: value });
    }
  };

  const toggleTextVisibility = useCallback(
    (textId: string) => {
      const updatedTexts = texts.map((text) =>
        text.id === textId ? { ...text, visible: !text.visible } : text,
      );

      setTexts(updatedTexts); // Update texts state immediately
      updateActiveImageTexts(updatedTexts); // Sync with canvas state
    },
    [texts, setTexts, updateActiveImageTexts],
  );

  const deleteTextLayer = useCallback(
    (textId: string) => {
      // 1. Filter texts to remove the deleted one
      const newTexts = texts.filter((t) => t.id !== textId);

      // 2. IMMEDIATELY update canvas state's imageData.currentTexts
      updateActiveImageTexts(newTexts);

      // 3. Update local text state
      setTexts(newTexts);

      // 4. Clear selection and do any other cleanup
      if (selectedTextId === textId) {
        setSelectedTextId(null);
      }
      deleteTextElement(textId); // Last, for any additional cleanup
    },
    [
      texts,
      updateActiveImageTexts,
      setTexts,
      selectedTextId,
      setSelectedTextId,
      deleteTextElement,
    ],
  );

  const handleLayerClick = (layerId: string) => {
    if (selectedTextId === layerId) {
      setSelectedTextId(null);
    } else {
      setSelectedTextId(layerId);
    }
  };

  return (
    <div className="flex flex-col gap-3 p-2 h-full">
      <div className="flex flex-col gap-2">
        <span className="text-sm">Текст:</span>
        <Input
          type="text"
          value={localText}
          onChange={(e) => handleTextChange(e.target.value)}
          placeholder="Введите текст..."
          className="w-full"
        />
      </div>

      <div className="flex flex-col gap-2">
        <div className="flex flex-row w-full items-center justify-between">
          <span className="text-sm">Размер:</span>
          <span className="text-sm tabular-nums">{localFontSize}px</span>
        </div>
        <Slider
          min={12}
          max={200}
          step={1}
          defaultValue={75}
          value={localFontSize}
          onValueChange={(value) => handleFontSizeChange(value as number)}
        />
      </div>

      <div className="flex flex-col gap-2 ">
        <span className="text-sm">Шрифт:</span>
        <select
          className="w-full p-2 bg-background border rounded text-text"
          value={localFontFamily}
          onChange={(e) => handleFontFamilyChange(e.target.value)}
        >
          {FONT_FAMILIES.map((font) => (
            <option key={font} value={font} style={{ fontFamily: font }}>
              {font}
            </option>
          ))}
        </select>
      </div>

      <div className="flex flex-col h-full overflow-y-auto">
        {texts.length > 0 && (
          <div className="flex flex-col gap-2 mt-4 ">
            <span className="font-medium">Слои:</span>
            <div className="flex flex-col gap-1">
              {texts.map((layer, index) => (
                <div
                  key={layer.id}
                  className={`flex flex-row items-center justify-between p-2 rounded border cursor-pointer transition-colors ${
                    selectedTextId === layer.id
                      ? "border-primary border-dashed bg-primary/10"
                      : "border-white/10 hover:border-white/30"
                  }`}
                  onClick={() => handleLayerClick(layer.id)}
                >
                  <div className="flex items-center gap-2 flex-1 min-w-0">
                    <Move className="size-3 text-white/50 shrink-0" />
                    <span className="text-sm truncate">
                      {index + 1}. {layer.text.slice(0, 12)}
                      {layer.text.length > 12 ? "..." : ""}
                    </span>
                  </div>
                  <div className="flex flex-row gap-1 shrink-0">
                    <button
                      className="p-1 hover:bg-white/20 rounded text-white/70"
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleTextVisibility(layer.id);
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
                        deleteTextLayer(layer.id);
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
