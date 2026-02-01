import { TextElement } from "@/types";
import { memo } from "react";

interface TextsRendererProps {
  texts: TextElement[];
  isInteractive?: boolean;
  selectedTextId?: string | null;
  onTextMouseDown?: (e: MouseEvent, textId: string) => void;
  onTextClick?: (e: MouseEvent, textId: string) => void;
}

function TextsRenderer({
  texts,
  isInteractive = false,
  selectedTextId,
  onTextMouseDown,
  onTextClick,
}: TextsRendererProps) {
  return (
    <>
      {texts
        .filter((text) => text.visible !== false)
        .map((textElement) => {
          const textWidth =
            textElement.text.length * textElement.fontSize * 0.6;
          const isSelected = selectedTextId === textElement.id;

          if (!isInteractive) {
            return (
              <text
                key={textElement.id}
                x={textElement.x}
                y={textElement.y}
                fontSize={textElement.fontSize}
                fontFamily={textElement.fontFamily}
                fill={textElement.color}
                textAnchor="start"
                dominantBaseline="hanging"
                style={{ pointerEvents: "none" }}
              >
                {textElement.text}
              </text>
            );
          }

          return (
            <g key={textElement.id}>
              {isSelected && (
                <rect
                  x={textElement.x - 4}
                  y={textElement.y - 4}
                  width={textWidth + 8}
                  height={textElement.fontSize + 8}
                  fill="rgba(59, 130, 246, 0.15)"
                  stroke="rgb(59, 130, 246)"
                  strokeWidth="1.5"
                  strokeDasharray="4,2"
                  rx="2"
                  style={{
                    pointerEvents: "none",
                    filter: "drop-shadow(0 0 4px rgba(59, 130, 246, 0.3))",
                  }}
                />
              )}
              <text
                x={textElement.x}
                y={textElement.y}
                fontSize={textElement.fontSize}
                fontFamily={textElement.fontFamily}
                fill={textElement.color}
                textAnchor="start"
                dominantBaseline="hanging"
                style={{
                  cursor: "grab",
                  opacity: 1,
                  transition: "cursor 0.1s ease, filter 0.2s ease",
                  filter: isSelected
                    ? "drop-shadow(0 1px 2px rgba(0,0,0,0.2))"
                    : "none",
                }}
                onMouseDown={(e) => onTextMouseDown?.(e, textElement.id)}
                onMouseEnter={(e) => {
                  e.currentTarget.style.cursor = "grab";
                  e.currentTarget.style.filter =
                    "brightness(1.1) drop-shadow(0 1px 2px rgba(0,0,0,0.2))";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.cursor = "grab";
                  e.currentTarget.style.filter = isSelected
                    ? "drop-shadow(0 1px 2px rgba(0,0,0,0.2))"
                    : "none";
                }}
                onClick={(e) => onTextClick?.(e, textElement.id)}
              >
                {textElement.text}
              </text>
            </g>
          );
        })}
    </>
  );
}

interface HistoryTextsProps {
  texts: TextElement[];
}

function HistoryTexts({ texts }: HistoryTextsProps) {
  return (
    <>
      {texts
        .filter((text) => text.visible !== false)
        .map((textElement, index) => (
          <text
            key={`history-text-${textElement.id || index}`}
            x={textElement.x}
            y={textElement.y}
            fontSize={textElement.fontSize}
            fontFamily={textElement.fontFamily}
            fill={textElement.color}
            textAnchor="start"
            dominantBaseline="hanging"
          >
            {textElement.text}
          </text>
        ))}
    </>
  );
}

export const TextRenderer = memo(TextsRenderer);
export const HistoryText = memo(HistoryTexts);
