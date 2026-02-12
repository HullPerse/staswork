import {
  createContext,
  useContext,
  useState,
  useCallback,
  ReactNode,
  useMemo,
  useEffect,
} from "react";
import {
  CanvasState,
  CanvasStateContext as TCanvasStateContext,
  PointsHistory,
  ImageData,
  TextElement,
  DotElement,
} from "@/types";
import { createImageDataWithMetadata } from "@/lib/utils";
import ImageStorage from "@/service/image.service";
import type { ProcessedFile } from "@/service/image.service";

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
  const [jitter, setJitter] = useState<CanvasState["jitter"]>(0);
  const [editIndex, setEditIndex] = useState<CanvasState["editIndex"]>(-1);
  const [results, setResults] = useState<CanvasState["results"]>([
    { cx: 0, cy: 0 },
  ]);
  const [textMode, setTextMode] = useState<CanvasState["textMode"]>(false);
  const [dotMode, setDotMode] = useState<CanvasState["dotMode"]>(false);
  const [randomJitter, setRandomJitter] =
    useState<CanvasState["randomJitter"]>(false);
  const [hashMode, setHashMode] = useState<CanvasState["hashMode"]>(false);
  const [hashLayerIndex, setHashLayerIndex] = useState<number | null>(null);

  const imageService = new ImageStorage();

  const handleImagesUpload = useCallback(
    async (files: File[]) => {
      if (!files.length) return;

      try {
        const processedFiles = await Promise.all(
          files.map((file) => imageService.processFile(file)),
        );

        const allProcessedFiles: ProcessedFile[] = processedFiles.flat();

        const newImageData = await Promise.all(
          allProcessedFiles.map((processedFile) =>
            createImageDataWithMetadata(processedFile),
          ),
        );

        setImageHistory((prev) => [...prev, ...newImageData]);

        if (!activeImageId && newImageData.length > 0) {
          setActiveImageId(newImageData[0].id);
        }
      } catch (error) {
        console.error("Failed to process files:", error);
      }
    },
    [activeImageId],
  );

  const handleImageSelect = useCallback((imageId: string) => {
    setActiveImageId(imageId);
    setEditIndex(-1);
    setArea(false);
    setPoints([]);
    setResults([{ cx: 0, cy: 0 }]);
  }, []);

  useEffect(() => {
    return () => {
      new ImageStorage().cleanup();
    };
  }, []);

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

  const updateActiveImageTexts = useCallback(
    (newTexts: TextElement[]) => {
      if (!activeImageId) return;

      setImageHistory((prev) =>
        prev.map((img) =>
          img.id === activeImageId ? { ...img, currentTexts: newTexts } : img,
        ),
      );
    },
    [activeImageId],
  );

  const updateActiveImageDots = useCallback(
    (newDots: DotElement[]) => {
      if (!activeImageId) return;

      setImageHistory((prev) =>
        prev.map((img) =>
          img.id === activeImageId
            ? { ...img, currentStandaloneDots: newDots }
            : img,
        ),
      );
    },
    [activeImageId],
  );

  const value = useMemo(
    () => ({
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
      randomJitter,
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
      setRandomJitter,
      handleImagesUpload,
      handleImageSelect,
      updateActiveImageHistory,
      updateActiveImageTexts,
      updateActiveImageDots,
      jitter,
      setJitter,
      hashMode,
      setHashMode,
      hashLayerIndex,
      setHashLayerIndex,
    }),
    [
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
      randomJitter,
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
      setRandomJitter,
      handleImagesUpload,
      handleImageSelect,
      updateActiveImageHistory,
      updateActiveImageTexts,
      updateActiveImageDots,
      jitter,
      setJitter,
      hashMode,
      setHashMode,
      hashLayerIndex,
      setHashLayerIndex,
    ],
  );

  return (
    <CanvasStateContext.Provider value={value}>
      {children}
    </CanvasStateContext.Provider>
  );
}
