import { StampElement } from "@/types";
import React, { memo } from "react";

interface StampRendererProps {
  stamps: StampElement[];
  isInteractive?: boolean;
  selectedStampId?: string | null;
  onStampMouseDown?: (e: React.MouseEvent, stampId: string) => void;
}

function StampsRenderer({
  stamps,
  isInteractive = false,
  selectedStampId,
  onStampMouseDown,
}: StampRendererProps) {
  const visibleStamps = stamps.filter((stamp) => stamp.visible !== false);
  const hasSelection = selectedStampId !== null;

  return (
    <>
      {visibleStamps.map((stampElement) => {
        const isSelected = selectedStampId === stampElement.id;

        return (
          <g key={stampElement.id}>
            {hasSelection && (
              <rect
                x={stampElement.x - stampElement.width / 2 - 4}
                y={stampElement.y - stampElement.height / 2 - 4}
                width={stampElement.width + 8}
                height={stampElement.height + 8}
                fill={
                  isSelected
                    ? "rgba(59, 130, 246, 0.15)"
                    : "rgba(100, 100, 100, 0.1)"
                }
                stroke={isSelected ? "rgb(59, 130, 246)" : "rgb(100, 100, 100)"}
                strokeWidth="1.5"
                strokeDasharray="4,2"
                style={{
                  pointerEvents: "none",
                  filter: isSelected
                    ? "drop-shadow(0 0 4px rgba(59, 130, 246, 0.3))"
                    : "none",
                }}
              />
            )}
            <image
              href={stampElement.path}
              x={stampElement.x - stampElement.width / 2}
              y={stampElement.y - stampElement.height / 2}
              width={stampElement.width}
              height={stampElement.height}
              preserveAspectRatio="xMidYMid meet"
              style={{
                cursor: isInteractive ? "grab" : "none",
                opacity: 1,
                transition: "cursor 0.1s ease, filter 0.2s ease",
              }}
              onMouseDown={(e) => {
                if (isInteractive && onStampMouseDown) {
                  onStampMouseDown(e, stampElement.id);
                }
              }}
            />
          </g>
        );
      })}
    </>
  );
}

export const StampRenderer = memo(StampsRenderer);
