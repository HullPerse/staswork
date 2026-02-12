import { PointsHistory } from "@/types";
import { HistoryDot, DotRenderer } from "./dot.renderer";
import { HistoryText } from "./text.renderer";

interface HistoryRendererProps {
  history: PointsHistory[];
  editIndex: number;
}

export function HistoryRenderer({ history, editIndex }: HistoryRendererProps) {
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
                />
              )}
              <HistoryText texts={item.texts || []} />
              <DotRenderer
                dots={item.standaloneDots || []}
                isInteractive={false}
              />
            </g>
          ),
      )}
    </>
  );
}
