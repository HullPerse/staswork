import { DotElement } from "@/types";
import React, { memo } from "react";

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
  dots: { cx: number; cy: number }[];
  size: number;
  fill?: string;
}

function HistoryDots({ dots, size, fill = "black" }: HistoryDotsProps) {
  return (
    <>
      {dots.map((dot, index) => (
        <circle
          key={`history-dot-${index}`}
          cx={dot.cx}
          cy={dot.cy}
          r={size / 2}
          fill={fill}
        />
      ))}
    </>
  );
}

export const DotRenderer = memo(DotsRenderer);
export const GeneratedDot = memo(GeneratedDots);
export const HistoryDot = memo(HistoryDots);
