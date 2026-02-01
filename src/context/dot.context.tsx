import { createContext, useContext, useState, useCallback, ReactNode, useMemo } from "react";
import { DotElement } from "@/types";

export interface DotContextState {
  standaloneDots: DotElement[];
  selectedDotId: string | null;
  dotSettings: {
    size: number;
    color: string;
  };
}

export interface DotContextActions {
  setStandaloneDots: (dots: DotElement[]) => void;
  setSelectedDotId: (id: string | null) => void;
  setDotSettings: (settings: { size: number; color: string }) => void;
  updateDotElement: (id: string, updates: Partial<DotElement>) => void;
  deleteDotElement: (id: string) => void;
  selectDotElement: (id: string) => void;
  clearDots: () => void;
}

export type DotStateContext = DotContextState & DotContextActions;

const DotContext = createContext<DotStateContext | undefined>(undefined);

export function useDotState() {
  const context = useContext(DotContext);
  if (!context) {
    throw new Error("useDotState must be used within DotProvider");
  }
  return context;
}

export function DotProvider({ children }: { children: ReactNode }) {
  const [standaloneDots, setStandaloneDots] = useState<DotElement[]>([]);
  const [selectedDotId, setSelectedDotId] = useState<string | null>(null);
  const [dotSettings, setDotSettings] = useState({
    size: 13,
    color: "#000000",
  });

  const updateDotElement = useCallback(
    (id: string, updates: Partial<DotElement>) => {
      setStandaloneDots((prev) =>
        prev.map((dot) => (dot.id === id ? { ...dot, ...updates } : dot)),
      );
    },
    [],
  );

  const deleteDotElement = useCallback(
    (id: string) => {
      setStandaloneDots((prev) => prev.filter((dot) => dot.id !== id));
      if (selectedDotId === id) {
        setSelectedDotId(null);
      }
    },
    [selectedDotId],
  );

  const selectDotElement = useCallback((id: string) => {
    setSelectedDotId(id);
  }, []);

  const clearDots = useCallback(() => {
    setStandaloneDots([]);
    setSelectedDotId(null);
  }, []);

  const value = useMemo(
    () => ({
      standaloneDots,
      selectedDotId,
      dotSettings,
      setStandaloneDots,
      setSelectedDotId,
      setDotSettings,
      updateDotElement,
      deleteDotElement,
      selectDotElement,
      clearDots,
    }),
    [
      standaloneDots,
      selectedDotId,
      dotSettings,
      setStandaloneDots,
      setSelectedDotId,
      setDotSettings,
      updateDotElement,
      deleteDotElement,
      selectDotElement,
      clearDots,
    ],
  );

  return <DotContext.Provider value={value}>{children}</DotContext.Provider>;
}
