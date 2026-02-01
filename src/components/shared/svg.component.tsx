import { ReactNode, type MouseEvent } from "react";

interface SvgOverlayProps {
  dimensions: { width: number; height: number };
  className?: string;
  onClick?: (e: MouseEvent<SVGSVGElement>) => void;
  children: ReactNode;
}

export function SvgOverlay({
  dimensions,
  className = "pointer-events-none absolute inset-0",
  onClick,
  children,
}: SvgOverlayProps) {
  return (
    <svg
      className={className}
      viewBox={`0 0 ${dimensions.width} ${dimensions.height}`}
      preserveAspectRatio="xMidYMid meet"
      onClick={onClick}
    >
      {children}
    </svg>
  );
}

interface SelectionPolygonProps {
  points: { x: number; y: number }[];
}

export function SelectionPolygon({ points }: SelectionPolygonProps) {
  if (points.length === 0) return null;

  return (
    <polygon
      points={points.map((p) => `${p.x},${p.y}`).join(" ")}
      fill="rgba(59, 130, 246, 0.1)"
      stroke="rgb(59, 130, 246)"
      strokeWidth="2"
      strokeDasharray="5,5"
    />
  );
}
