import { DotElement } from "@/types";
import React, { memo, useState } from "react";

interface GeneratedDotsProps {
  dots: { cx: number; cy: number }[];
  size: number;
  fill?: string;
}

function GeneratedDots({ dots, size, fill = "black" }: GeneratedDotsProps) {
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

interface StandaloneDotsProps {
  dots: DotElement[];
  isInteractive?: boolean;
  selectedDotId?: string | null;
  onDotMouseDown?: (e: React.MouseEvent, dotId: string) => void;
  onDotClick?: (e: React.MouseEvent, dotId: string) => void;
}

function DotsRenderer({
  dots,
  isInteractive = false,
  selectedDotId,
  onDotMouseDown,
  onDotClick,
}: StandaloneDotsProps) {
  return (
    <>
      {dots
        .filter((dot) => dot.visible)
        .map((dotElement) => {
          const isSelected = selectedDotId === dotElement.id;

          if (!isInteractive) {
            return (
              <circle
                key={dotElement.id}
                cx={dotElement.x}
                cy={dotElement.y}
                r={dotElement.size / 2}
                fill={dotElement.color}
                style={{ pointerEvents: "none" }}
              />
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
            </g>
          );
        })}
    </>
  );
}

interface HistoryDotsProps {
  dots: {
    cx: number;
    cy: number;
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
  }[];
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
}

function HistoryDots({
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
}: HistoryDotsProps) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

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
        const fontSize = dot.hashFontSize ?? globalFontSize ?? 12;
        const offset = dot.hashOffset ?? globalOffset ?? 5;
        const color = dot.hashColor ?? globalColor ?? "black";
        const position = dot.hashPosition ?? globalPosition ?? "top";
        const isSelected = selectedDotIndex === index;
        const isHovered = hoveredIndex === index;

        const textPos = getPosition(dot.cx, dot.cy, position, offset);

        return (
          <g
            key={`history-dot-${index}`}
            onMouseEnter={() => hashEnabled && setHoveredIndex(index)}
            onMouseLeave={() => setHoveredIndex(null)}
          >
            {isHovered && hashEnabled && !isSelected && (
              <circle
                cx={dot.cx}
                cy={dot.cy}
                r={size / 2 + 4}
                fill="rgba(255, 255, 255, 0.2)"
                stroke="rgba(255, 255, 255, 0.6)"
                strokeWidth="1.5"
                style={{ pointerEvents: "none" }}
              />
            )}
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
                {index + 1}
              </text>
            )}
          </g>
        );
      })}
    </>
  );
}

export const DotRenderer = memo(DotsRenderer);
export const GeneratedDot = memo(GeneratedDots);
export const HistoryDot = memo(HistoryDots);
