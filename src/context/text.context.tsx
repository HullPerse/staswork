import { createContext, useContext, useState, useCallback, ReactNode, useMemo } from "react";
import { TextElement } from "@/types";

export interface TextContextState {
  texts: TextElement[];
  selectedTextId: string | null;
  textSettings: {
    fontSize: number;
    fontFamily: string;
    color: string;
    text: string;
  };
}

export interface TextContextActions {
  setTexts: (texts: TextElement[]) => void;
  setSelectedTextId: (id: string | null) => void;
  setTextSettings: (settings: {
    fontSize: number;
    fontFamily: string;
    color: string;
    text: string;
  }) => void;
  updateTextElement: (id: string, updates: Partial<TextElement>) => void;
  deleteTextElement: (id: string) => void;
  selectTextElement: (id: string) => void;
  clearTexts: () => void;
}

export type TextStateContext = TextContextState & TextContextActions;

const TextContext = createContext<TextStateContext | undefined>(undefined);

export function useTextState() {
  const context = useContext(TextContext);
  if (!context) {
    throw new Error("useTextState must be used within TextProvider");
  }
  return context;
}

export function TextProvider({ children }: { children: ReactNode }) {
  const [texts, setTexts] = useState<TextElement[]>([]);
  const [selectedTextId, setSelectedTextId] = useState<string | null>(null);
  const [textSettings, setTextSettings] = useState({
    fontSize: 75,
    fontFamily: "Arial",
    color: "#000000",
    text: "",
  });

  const updateTextElement = useCallback(
    (id: string, updates: Partial<TextElement>) => {
      setTexts((prev) =>
        prev.map((text) => (text.id === id ? { ...text, ...updates } : text)),
      );
    },
    [],
  );

  const deleteTextElement = useCallback(
    (id: string) => {
      setTexts((prev) => prev.filter((text) => text.id !== id));
      if (selectedTextId === id) {
        setSelectedTextId(null);
      }
    },
    [selectedTextId],
  );

  const selectTextElement = useCallback((id: string) => {
    setSelectedTextId(id);
  }, []);

  const clearTexts = useCallback(() => {
    setTexts([]);
    setSelectedTextId(null);
  }, []);

  const value = useMemo(
    () => ({
      texts,
      selectedTextId,
      textSettings,
      setTexts,
      setSelectedTextId,
      setTextSettings,
      updateTextElement,
      deleteTextElement,
      selectTextElement,
      clearTexts,
    }),
    [
      texts,
      selectedTextId,
      textSettings,
      setTexts,
      setSelectedTextId,
      setTextSettings,
      updateTextElement,
      deleteTextElement,
      selectTextElement,
      clearTexts,
    ],
  );

  return <TextContext.Provider value={value}>{children}</TextContext.Provider>;
}
