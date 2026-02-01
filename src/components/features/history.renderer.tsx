import { PointsHistory } from "@/types";
import { HistoryDots, StandaloneDots } from "./dot.renderer";
import { HistoryTexts } from "./text.renderer";

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
                <HistoryDots dots={item.dots} size={item.size} />
              )}
              <HistoryTexts texts={item.texts || []} />
              <StandaloneDots
                dots={item.standaloneDots || []}
                isInteractive={false}
              />
            </g>
          ),
      )}
    </>
  );
}
