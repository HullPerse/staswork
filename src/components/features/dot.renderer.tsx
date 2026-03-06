import { useDotState } from "@/context/dot.context";
import { PointsHistory } from "@/types";
import React, { memo } from "react";

interface DotsRendererProps {
  isInteractive?: boolean;
  selectedDotId?: string | null;
  onDotMouseDown?: (e: React.MouseEvent, dotId: string) => void;
  onDotClick?: (e: React.MouseEvent, dotId: string) => void;
  hashEnabled?: boolean;
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
  hashStartIndex?: number;
}

function DotsRenderer({
  isInteractive = false,
  selectedDotId,
  onDotMouseDown,
  onDotClick,
  hashEnabled,
  hashFontSize,
  hashOffset,
  hashColor,
  hashPosition,
  hashStartIndex,
}: DotsRendererProps) {
  const { standaloneDots } = useDotState();

  const getPosition = (
    x: number,
    y: number,
    position: string,
    offset: number,
  ) => {
    const r = 0;
    switch (position) {
      case "top":
        return { x, y: y - r - offset };
      case "top-left":
        return { x: x - r - offset, y: y - r - offset };
      case "top-right":
        return { x: x + r + offset, y: y - r - offset };
      case "right":
        return { x: x + r + offset, y };
      case "bottom-right":
        return { x: x + r + offset, y: y + r + offset };
      case "bottom":
        return { x, y: y + r + offset };
      case "bottom-left":
        return { x: x - r - offset, y: y + r + offset };
      case "left":
        return { x: x - r - offset, y };
      default:
        return { x, y: y - r - offset };
    }
  };

  const dots = standaloneDots;
  const visibleDots = dots.filter((dot) => dot.visible !== false);

  return (
    <>
      {visibleDots.map((dotElement, index) => {
        const isSelected = selectedDotId === dotElement.id;

        const fontSize = dotElement.hashFontSize ?? hashFontSize ?? 12;
        const offset = dotElement.hashOffset ?? hashOffset ?? 5;
        const color = dotElement.hashColor ?? hashColor ?? "black";
        const position = dotElement.hashPosition ?? hashPosition ?? "top";
        const textPos = getPosition(
          dotElement.x,
          dotElement.y,
          position,
          offset,
        );

        if (!isInteractive) {
          return (
            <g key={dotElement.id}>
              <circle
                cx={dotElement.x}
                cy={dotElement.y}
                r={dotElement.size / 2}
                fill={dotElement.color}
                style={{ pointerEvents: "none" }}
              />
              {hashEnabled && (
                <text
                  x={textPos.x}
                  y={textPos.y}
                  textAnchor={
                    position.includes("left")
                      ? "end"
                      : position.includes("right")
                        ? "start"
                        : "middle"
                  }
                  dominantBaseline={
                    position.includes("top")
                      ? "auto"
                      : position.includes("bottom")
                        ? "hanging"
                        : "middle"
                  }
                  fontSize={fontSize}
                  fill={color}
                  fontWeight="bold"
                  style={{ pointerEvents: "none" }}
                >
                  {(hashStartIndex ?? 0) + index + 1}
                </text>
              )}
            </g>
          );
        }

        return (
          <g key={dotElement.id}>
            {isSelected && (
              <circle
                cx={dotElement.x}
                cy={dotElement.y}
                r={dotElement.size / 2 + 4}
                fill="rgba(59, 130, 246, 0.15)"
                stroke="rgb(59, 130, 246)"
                strokeWidth="1.5"
                strokeDasharray="4,2"
                style={{
                  pointerEvents: "none",
                  filter: "drop-shadow(0 0 4px rgba(59, 130, 246, 0.3))",
                }}
              />
            )}
            <circle
              cx={dotElement.x}
              cy={dotElement.y}
              r={dotElement.size / 2}
              fill={dotElement.color}
              style={{
                cursor: "grab",
                opacity: 1,
                transition: "cursor 0.1s ease, filter 0.2s ease",
                filter: isSelected
                  ? "drop-shadow(0 1px 2px rgba(0,0,0,0.2))"
                  : "none",
              }}
              onMouseDown={(e) => onDotMouseDown?.(e as any, dotElement.id)}
              onMouseEnter={(e) => {
                e.currentTarget.style.cursor = "grab";
                e.currentTarget.style.filter = isSelected
                  ? "brightness(1.2) drop-shadow(0 1px 2px rgba(0,0,0,0.2))"
                  : "brightness(1.1) drop-shadow(0 1px 2px rgba(0,0,0,0.2))";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.cursor = "grab";
                e.currentTarget.style.filter = isSelected
                  ? "drop-shadow(0 1px 2px rgba(0,0,0,0.2))"
                  : "none";
              }}
              onClick={(e) => onDotClick?.(e as any, dotElement.id)}
            />
            {hashEnabled && (
              <text
                x={textPos.x}
                y={textPos.y}
                textAnchor={
                  position.includes("left")
                    ? "end"
                    : position.includes("right")
                      ? "start"
                      : "middle"
                }
                dominantBaseline={
                  position.includes("top")
                    ? "auto"
                    : position.includes("bottom")
                      ? "hanging"
                      : "middle"
                }
                fontSize={fontSize}
                fill={color}
                fontWeight="bold"
                style={{ pointerEvents: "none" }}
              >
                {(hashStartIndex ?? 0) + index + 1}
              </text>
            )}
          </g>
        );
      })}
    </>
  );
}

function GeneratedDots({
  dots,
  size,
  fill = "black",
}: {
  dots: { cx: number; cy: number }[];
  size: number;
  fill?: string;
}) {
  return (
    <>
      {dots.map((dot, index) => (
        <circle
          key={`generated-${index}`}
          cx={dot.cx}
          cy={dot.cy}
          r={size / 2}
          fill={fill}
        />
      ))}
    </>
  );
}

interface HistoryDotProps {
  dots: PointsHistory["dots"];
  size: number;
  fill?: string;
  hashEnabled?: boolean;
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
  selectedDotIndex?: number | null;
  onDotClick?: (index: number) => void;
  hashStartIndex?: number;
}

function HistoryDot({
  dots,
  size,
  fill = "black",
  hashEnabled,
  hashFontSize: globalFontSize,
  hashOffset: globalOffset,
  hashColor: globalColor,
  hashPosition: globalPosition,
  selectedDotIndex,
  onDotClick,
  hashStartIndex,
}: HistoryDotProps) {
  const getPosition = (
    cx: number,
    cy: number,
    position: string,
    offset: number,
  ) => {
    const r = size / 2;
    switch (position) {
      case "top":
        return { x: cx, y: cy - r - offset };
      case "top-left":
        return { x: cx - r - offset, y: cy - r - offset };
      case "top-right":
        return { x: cx + r + offset, y: cy - r - offset };
      case "right":
        return { x: cx + r + offset, y: cy };
      case "bottom-right":
        return { x: cx + r + offset, y: cy + r + offset };
      case "bottom":
        return { x: cx, y: cy + r + offset };
      case "bottom-left":
        return { x: cx - r - offset, y: cy + r + offset };
      case "left":
        return { x: cx - r - offset, y: cy };
      default:
        return { x: cx, y: cy - r - offset };
    }
  };

  return (
    <>
      {dots.map((dot, index) => {
        const fontSize = globalFontSize ?? 12;
        const offset = globalOffset ?? 5;
        const color = globalColor ?? "black";
        const position = globalPosition ?? "top";
        const isSelected = selectedDotIndex === index;

        const textPos = getPosition(dot.cx, dot.cy, position, offset);

        return (
          <g key={`history-dot-${index}`}>
            {isSelected && (
              <circle
                cx={dot.cx}
                cy={dot.cy}
                r={size / 2 + 6}
                fill="rgba(59, 130, 246, 0.15)"
                stroke="rgb(59, 130, 246)"
                strokeWidth="2"
                strokeDasharray="4,2"
                style={{ pointerEvents: "none" }}
              />
            )}
            <circle
              cx={dot.cx}
              cy={dot.cy}
              r={size / 2}
              fill={fill}
              style={{ cursor: hashEnabled ? "pointer" : "default" }}
              onClick={() => onDotClick?.(index)}
            />
            {hashEnabled && (
              <text
                x={textPos.x}
                y={textPos.y}
                textAnchor={
                  position.includes("left")
                    ? "end"
                    : position.includes("right")
                      ? "start"
                      : "middle"
                }
                dominantBaseline={
                  position.includes("top")
                    ? "auto"
                    : position.includes("bottom")
                      ? "hanging"
                      : "middle"
                }
                fontSize={fontSize}
                fill={color}
                fontWeight="bold"
                style={{ pointerEvents: "none" }}
              >
                {(hashStartIndex ?? 0) + index + 1}
              </text>
            )}
          </g>
        );
      })}
    </>
  );
}

export const HistoryDots = memo(HistoryDot);
export const DotRenderer = memo(DotsRenderer);
export const GeneratedDot = memo(GeneratedDots);
