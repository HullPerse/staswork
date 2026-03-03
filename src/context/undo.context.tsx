import {
  createContext,
  useContext,
  useState,
  useCallback,
  ReactNode,
  useMemo,
} from "react";
import { TextElement, DotElement } from "@/types";

export type UndoActionType = "addText" | "addDot" | "addHashToStandaloneDot";

export interface UndoAction {
  type: UndoActionType;
  data: TextElement | DotElement;
}

export interface UndoContextState {
  undoStack: UndoAction[];
  redoStack: UndoAction[];
}

export interface UndoContextActions {
  recordAction: (action: UndoAction) => void;
  undo: () => UndoAction | undefined;
  canUndo: () => boolean;
  clearHistory: () => void;
}

export type UndoStateContext = UndoContextState & UndoContextActions;

const UndoContext = createContext<UndoStateContext | undefined>(undefined);

export function useUndoState() {
  const context = useContext(UndoContext);
  if (!context) {
    throw new Error("useUndoState must be used within UndoProvider");
  }
  return context;
}

export function UndoProvider({ children }: { children: ReactNode }) {
  const [undoStack, setUndoStack] = useState<UndoAction[]>([]);
  const [redoStack, setRedoStack] = useState<UndoAction[]>([]);

  const recordAction = useCallback((action: UndoAction) => {
    setUndoStack((prev) => [...prev, action]);
    setRedoStack([]);
  }, []);

  const undo = useCallback((): UndoAction | undefined => {
    let action: UndoAction | undefined;
    setUndoStack((prev) => {
      if (prev.length === 0) return prev;
      const newStack = [...prev];
      action = newStack.pop();
      return newStack;
    });
    if (action) {
      setRedoStack((prev) => [...prev, action!]);
    }
    return action;
  }, []);

  const canUndo = useCallback((): boolean => {
    return undoStack.length > 0;
  }, [undoStack]);

  const clearHistory = useCallback(() => {
    setUndoStack([]);
    setRedoStack([]);
  }, []);

  const value = useMemo(
    () => ({
      undoStack,
      redoStack,
      recordAction,
      undo,
      canUndo,
      clearHistory,
    }),
    [undoStack, redoStack, recordAction, undo, canUndo, clearHistory],
  );

  return <UndoContext.Provider value={value}>{children}</UndoContext.Provider>;
}
