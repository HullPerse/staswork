import {
  createContext,
  useContext,
  useState,
  useCallback,
  ReactNode,
} from "react";
import {
  CanvasState,
  CanvasStateContext as TCanvasStateContext,
  PointsHistory,
  ImageData,
  TextElement,
  DotElement,
} from "@/types";
import { createImageData } from "@/lib/utils";

const CanvasStateContext = createContext<TCanvasStateContext | undefined>(
  undefined,
);

export function useCanvasState() {
  const context = useContext(CanvasStateContext);
  if (!context) {
    throw new Error("useCanvasState must be used within CanvasProvider");
  }
  return context;
}

export function CanvasProvider({ children }: { children: ReactNode }) {
  const [imageHistory, setImageHistory] = useState<ImageData[]>([]);
  const [activeImageId, setActiveImageId] = useState<string | null>(null);
  const [area, setArea] = useState(false);
  const [points, setPoints] = useState<CanvasState["points"]>([]);
  const [side, setSide] = useState<CanvasState["side"]>("left");
  const [amount, setAmount] = useState<CanvasState["amount"]>("");
  const [size, setSize] = useState<CanvasState["size"]>(13);
  const [padding, setPadding] = useState<CanvasState["padding"]>(0);
  const [gap, setGap] = useState<CanvasState["gap"]>(10);
  const [rotation, setRotation] = useState<CanvasState["rotation"]>(0);
  const [editIndex, setEditIndex] = useState<CanvasState["editIndex"]>(-1);
  const [results, setResults] = useState<CanvasState["results"]>([
    { cx: 0, cy: 0 },
  ]);
  const [textMode, setTextMode] = useState<CanvasState["textMode"]>(false);
  const [dotMode, setDotMode] = useState<CanvasState["dotMode"]>(false);
  const [texts, setTexts] = useState<CanvasState["texts"]>([]);
  const [textSettings, setTextSettings] = useState<CanvasState["textSettings"]>(
    {
      fontSize: 75,
      fontFamily: "Arial",
      color: "#000000",
      text: "",
    },
  );
  const [selectedTextId, setSelectedTextId] =
    useState<CanvasState["selectedTextId"]>(null);
  const [standaloneDots, setStandaloneDots] = useState<
    CanvasState["standaloneDots"]
  >([]);
  const [dotSettings, setDotSettings] = useState<CanvasState["dotSettings"]>({
    size: 13,
    color: "#000000",
  });
  const [selectedDotId, setSelectedDotId] =
    useState<CanvasState["selectedDotId"]>(null);
  const [randomJitter, setRandomJitter] =
    useState<CanvasState["randomJitter"]>(false);


  const [imageWorkingStates, setImageWorkingStates] = useState<
    Map<
      string,
      {
        texts: TextElement[];
        standaloneDots: DotElement[];
      }
    >
  >(new Map());

  const handleImagesUpload = useCallback(
    async (files: File[]) => {
      const imageFiles = files.filter((file) => file.type.startsWith("image/"));

      if (imageFiles.length === 0) return;

      try {
        const newImageData = await Promise.all(
          imageFiles.map((file) => createImageData(file)),
        );

        setImageHistory((prev) => [...prev, ...newImageData]);
        setStandaloneDots([]);
        setTexts([]);

        if (!activeImageId && newImageData.length > 0) {
          setActiveImageId(newImageData[0].id);
        }
      } catch (error) {
        console.error("Failed to process images:", error);
      }
    },
    [activeImageId],
  );

  const handleImageSelect = useCallback(
    (imageId: string) => {

      if (activeImageId && activeImageId !== imageId) {
        setImageWorkingStates((prev) => {
          const newMap = new Map(prev);
          newMap.set(activeImageId, {
            texts: [...texts],
            standaloneDots: [...standaloneDots],
          });
          return newMap;
        });
      }


      setActiveImageId(imageId);
      setEditIndex(-1);
      setArea(false);
      setPoints([]);
      setResults([{ cx: 0, cy: 0 }]);


      setImageWorkingStates((prev) => {
        const workingState = prev.get(imageId);
        if (workingState) {
          setTexts(workingState.texts);
          setStandaloneDots(workingState.standaloneDots);
        } else {

          setTexts([]);
          setStandaloneDots([]);
        }
        return prev;
      });


      setSelectedTextId(null);
      setSelectedDotId(null);
    },
    [activeImageId, texts, standaloneDots],
  );

  const updateActiveImageHistory = useCallback(
    (newHistory: PointsHistory[]) => {
      if (!activeImageId) return;

      setImageHistory((prev) =>
        prev.map((img) =>
          img.id === activeImageId ? { ...img, editHistory: newHistory } : img,
        ),
      );
    },
    [activeImageId],
  );

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

  const value: TCanvasStateContext = {
    imageHistory,
    activeImageId,
    area,
    points,
    side,
    amount,
    size,
    padding,
    gap,
    rotation,
    editIndex,
    results,
    textMode,
    dotMode,
    texts,
    standaloneDots,
    randomJitter,
    textSettings,
    dotSettings,
    selectedTextId,
    selectedDotId,
    setImageHistory,
    setActiveImageId,
    setArea,
    setPoints,
    setSide,
    setAmount,
    setSize,
    setPadding,
    setGap,
    setRotation,
    setEditIndex,
    setResults,
    setTextMode,
    setDotMode,
    setTexts,
    setStandaloneDots,
    setRandomJitter,
    setTextSettings,
    setDotSettings,
    setSelectedTextId,
    setSelectedDotId,
    updateTextElement,
    updateDotElement,
    deleteTextElement,
    deleteDotElement,
    selectTextElement,
    selectDotElement,
    handleImagesUpload,
    handleImageSelect,
    updateActiveImageHistory,
    imageWorkingStates,
  };

  return (
    <CanvasStateContext.Provider value={value}>
      {children}
    </CanvasStateContext.Provider>
  );
}
