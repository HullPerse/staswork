import { PointsHistory } from "@/types";
import { HistoryDot, DotRenderer } from "./dot.renderer";
import { HistoryText } from "./text.renderer";
import { useCanvasState } from "@/context/canvas.context";

interface HistoryRendererProps {
  history: PointsHistory[];
  editIndex: number;
}

export function HistoryRenderer({ history, editIndex }: HistoryRendererProps) {
  const {
    hashLayerIndex,
    hashDotIndex,
    setHashDotIndex,
    hashStandaloneDotsEnabled,
  } = useCanvasState();

  let hashOffset = 0;
  const layerHashOffsets: number[] = [];

  for (let i = 0; i < history.length; i++) {
    layerHashOffsets.push(hashOffset);
    if (
      i !== editIndex &&
      history[i].visible &&
      history[i].settings.hashEnabled
    ) {
      hashOffset += history[i].dots?.length || 0;
    }
    if (i !== editIndex && history[i].visible && hashStandaloneDotsEnabled) {
      hashOffset +=
        history[i].standaloneDots?.filter((d) => d.visible).length || 0;
    }
  }

  const handleDotClick = (layerIndex: number, dotIndex: number) => {
    if (layerIndex === hashLayerIndex) {
      setHashDotIndex(hashDotIndex === dotIndex ? null : dotIndex);
    }
  };

  return (
    <>
      {history.map(
        (item, historyIndex) =>
          historyIndex !== editIndex && (
            <g key={`history-${historyIndex}`}>
              {item.visible && (
                <HistoryDot
                  dots={item.dots}
                  size={item.size}
                  hashEnabled={item.settings.hashEnabled}
                  hashFontSize={item.settings.hashFontSize}
                  hashOffset={item.settings.hashOffset}
                  hashColor={item.settings.hashColor}
                  hashPosition={item.settings.hashPosition}
                  hashStartIndex={
                    item.settings.hashEnabled
                      ? layerHashOffsets[historyIndex]
                      : undefined
                  }
                  selectedDotIndex={
                    historyIndex === hashLayerIndex ? hashDotIndex : null
                  }
                  onDotClick={(dotIndex) =>
                    handleDotClick(historyIndex, dotIndex)
                  }
                />
              )}
              <HistoryText texts={item.texts || []} />
              <DotRenderer
                dots={item.standaloneDots || []}
                isInteractive={false}
                hashEnabled={hashStandaloneDotsEnabled}
                hashFontSize={item.settings.hashFontSize}
                hashOffset={item.settings.hashOffset}
                hashColor={item.settings.hashColor}
                hashPosition={item.settings.hashPosition}
                hashStartIndex={
                  hashStandaloneDotsEnabled
                    ? layerHashOffsets[historyIndex]
                    : undefined
                }
              />
            </g>
          ),
      )}
    </>
  );
}
