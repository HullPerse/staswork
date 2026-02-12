export type Points = {
  x: number;
  y: number;
};

export type TextElement = {
  id: string;
  x: number;
  y: number;
  text: string;
  fontSize: number;
  fontFamily: string;
  color: string;
  visible: boolean;
};

export type DotElement = {
  id: string;
  x: number;
  y: number;
  size: number;
  color: string;
  visible: boolean;
};

export type PointsHistory = {
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
  texts: TextElement[];
  standaloneDots: DotElement[];
  visible: boolean;
  size: number;

  settings: {
    points: Points[];
    size: number;
    gap: number;
    padding: number;
    rotation: number;
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
  };
};

export type ImageData = {
  id: string;
  file: File;
  BlobUrl: string;
  dimensions: {
    width: number;
    height: number;
  };
  editHistory: PointsHistory[];
  name: string;
  currentTexts: TextElement[];
  currentStandaloneDots: DotElement[];
  sourceFile?: File;
  pageNumber?: number;
};

// Canvas context for rendered dots (not standalone ones)
export interface CanvasState {
  imageHistory: ImageData[];
  activeImageId: string | null;
  area: boolean;
  points: Points[];
  side: "left" | "right";
  amount: string;
  size: number;
  padding: number;
  gap: number;
  rotation: number;
  editIndex: number;
  results: { cx: number; cy: number }[];
  dotMode: boolean;
  textMode: boolean;
  randomJitter: boolean;
  jitter: number;
  hashMode: boolean;
  hashLayerIndex: number | null;
  hashDotIndex: number | null;
}

export interface CanvasStateActions {
  setImageHistory: (history: ImageData[]) => void;
  setActiveImageId: (id: string | null) => void;
  setArea: (area: boolean) => void;
  setPoints: (points: Points[]) => void;
  setSide: (side: "left" | "right") => void;
  setJitter: (jitter: number) => void;
  setAmount: (amount: string) => void;
  setSize: (size: number) => void;
  setPadding: (padding: number) => void;
  setGap: (gap: number) => void;
  setRotation: (rotation: number) => void;
  setEditIndex: (index: number) => void;
  setResults: (results: { cx: number; cy: number }[]) => void;
  setTextMode: (mode: boolean) => void;
  setDotMode: (mode: boolean) => void;
  setRandomJitter: (jitter: boolean) => void;
  handleImagesUpload: (files: File[]) => Promise<void>;
  handleImageSelect: (imageId: string) => void;
  updateActiveImageHistory: (newHistory: PointsHistory[]) => void;
  updateActiveImageTexts: (texts: TextElement[]) => void;
  updateActiveImageDots: (dots: DotElement[]) => void;
  setHashMode: (mode: boolean) => void;
  setHashLayerIndex: (index: number | null) => void;
  setHashDotIndex: (index: number | null) => void;
}

export type CanvasStateContext = CanvasState & CanvasStateActions;

// Legacy type for backward compatibility
export interface LegacyCanvasState extends CanvasState {
  texts: TextElement[];
  standaloneDots: DotElement[];
  textSettings: {
    fontSize: number;
    fontFamily: string;
    color: string;
    text: string;
  };
  dotSettings: {
    size: number;
    color: string;
  };
  selectedTextId: string | null;
  selectedDotId: string | null;
}

export interface LegacyCanvasStateActions extends CanvasStateActions {
  setTexts: (texts: TextElement[]) => void;
  setStandaloneDots: (dots: DotElement[]) => void;
  setTextSettings: (settings: {
    fontSize: number;
    fontFamily: string;
    color: string;
    text: string;
  }) => void;
  setDotSettings: (settings: { size: number; color: string }) => void;
  setSelectedTextId: (id: string | null) => void;
  setSelectedDotId: (id: string | null) => void;
  updateTextElement: (id: string, updates: Partial<TextElement>) => void;
  updateDotElement: (id: string, updates: Partial<DotElement>) => void;
  deleteTextElement: (id: string) => void;
  deleteDotElement: (id: string) => void;
  selectTextElement: (id: string) => void;
  selectDotElement: (id: string) => void;
  imageWorkingStates: Map<
    string,
    {
      texts: TextElement[];
      standaloneDots: DotElement[];
    }
  >;
}
