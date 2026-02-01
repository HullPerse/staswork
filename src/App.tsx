//TODO: save input before editing to cache

import {
  ArrowLeft,
  ArrowRight,
  Dot,
  Download,
  ImageMinus,
  ImagePlus,
  LassoSelect,
  Type,
} from "lucide-react";
import { lazy, Suspense, useCallback, useMemo, useState } from "react";
import { useDropzone } from "react-dropzone";
import ExportProgress from "./components/features/export.component";
import Overlay from "./components/shared/overlay.component";
import { Button } from "./components/ui/button.component";
import { useCanvasState } from "./context/canvas.context";
import { useTextState } from "./context/text.context";
import { useDotState } from "./context/dot.context";
import {
  createImageArchive,
  downloadArchive,
  processImageWithDots,
} from "./lib/export.utils";

const Canvas = lazy(() => import("./components/features/canvas.component"));
const Toolbox = lazy(() => import("@/components/shared/toolbox.component"));

function App() {
  const {
    imageHistory,
    activeImageId,
    setActiveImageId,
    setImageHistory,
    side,
    handleImagesUpload,
    setSide,
    dotMode,
    setDotMode,
    textMode,
    setTextMode,
    setArea,
  } = useCanvasState();

  const { texts } = useTextState();
  const { standaloneDots } = useDotState();
  const { clearTexts } = useTextState();
  const { clearDots } = useDotState();

  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<boolean>(false);

  const onDrop = useCallback(
    async (files: File[]) => {
      if (!files?.length) return;

      const imageFiles = files.filter((file) => file.type.startsWith("image/"));

      if (imageFiles.length === 0) return;

      setLoading(true);
      try {
        const reader = new FileReader();
        reader.onload = (event) => {
          const src = event.target?.result as string;
          const img = new Image();

          img.src = src;
        };
        reader.readAsDataURL(imageFiles[0]);

        handleImagesUpload(imageFiles);
      } catch (e) {
        setError(true);
        console.error(e);
      } finally {
        setLoading(false);
      }
    },
    [handleImagesUpload],
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "image/*": [".jpeg", ".jpg", ".png", ".webp"],
    },
    multiple: true,
    noClick: false,
    onError: () => setError(true),
  });

  const [exportState, setExportState] = useState<{
    isOpen: boolean;
    currentImage: string;
    currentIndex: number;
    total: number;
    status:
      | "processing"
      | "compressing"
      | "downloading"
      | "completed"
      | "error";
    error?: string;
  }>({
    isOpen: false,
    currentImage: "",
    currentIndex: 0,
    total: 0,
    status: "processing",
  });

  const activeImage = useMemo(() => {
    return imageHistory.find((img) => img.id === activeImageId) || null;
  }, [imageHistory, activeImageId]);

  const image = activeImage?.file || null;

  const handlePaste = async (e: React.ClipboardEvent) => {
    const items = e.clipboardData?.items;
    if (!items) return;

    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      if (item.type.startsWith("image/")) {
        const file = item.getAsFile();
        if (file) {
          await handleImagesUpload([file]);
          break;
        }
      }
    }
  };

  const handleDownload = async () => {
    if (imageHistory.length === 0) return;

    try {
      setExportState({
        isOpen: true,
        currentImage: "",
        currentIndex: 1,
        total: imageHistory.length,
        status: "processing",
      });

      const processedImages = [];

      for (let i = 0; i < imageHistory.length; i++) {
        const image = imageHistory[i];
        setExportState((prev) => ({
          ...prev,
          currentImage: image.name,
          currentIndex: i + 1,
        }));

        const processedImage = await processImageWithDots(
          image,
          texts,
          standaloneDots,
        );
        processedImages.push(processedImage);
      }

      setExportState((prev) => ({ ...prev, status: "compressing" }));
      const archiveBlob = await createImageArchive(processedImages);

      setExportState((prev) => ({ ...prev, status: "downloading" }));
      await downloadArchive(archiveBlob);

      setExportState((prev) => ({ ...prev, status: "completed" }));
    } catch (error) {
      console.error("Ошибка при эскпорте:", error);
      setExportState((prev) => ({
        ...prev,
        status: "error",
        error: error instanceof Error ? error.message : "Неизвестная ошибка",
      }));
    }
  };

  const closeExportModal = () => {
    setExportState((prev) => ({ ...prev, isOpen: false }));
  };

  return (
    <main
      className="flex flex-col max-w-screen h-screen gap-2 bg-background text-text p-2"
      onPaste={handlePaste}
      onContextMenu={(e) => e.preventDefault()}
    >
      {/* top toolbar */}
      <section className="flex flex-row w-full min-h-20 gap-2 border rounded justify-between items-center px-2">
        <div className="flex flex-row gap-2">
          {activeImageId ? (
            <Button
              className="w-16 h-16"
              onClick={() => {
                if (!activeImageId) return;
                setImageHistory([]);
                setActiveImageId(null);
                clearDots();
                clearTexts();
              }}
            >
              <ImageMinus className="size-10" />
            </Button>
          ) : (
            <Button className="w-16 h-16" {...getRootProps()}>
              <ImagePlus className="size-10" />
            </Button>
          )}
          <Button
            className="w-16 h-16 bg-green-500/20 border-green-500 hover:bg-green-500/60"
            disabled={!image || (!textMode && !dotMode)}
            onClick={() => {
              setTextMode(false);
              setDotMode(false);
              setArea(false);
            }}
          >
            <LassoSelect className="size-10" />
          </Button>
          <Button
            className="w-16 h-16 bg-green-500/20 border-green-500 hover:bg-green-500/60"
            disabled={!image || textMode}
            onClick={() => {
              setTextMode(true);
              setDotMode(false);
              setArea(false);
            }}
          >
            <Type className="size-10" />
          </Button>
          <Button
            className="w-16 h-16 bg-green-500/20 border-green-500 hover:bg-green-500/60"
            disabled={!image || dotMode}
            onClick={() => {
              setDotMode(true);
              setTextMode(false);
              setArea(false);
            }}
          >
            <Dot className="size-10" />
          </Button>
        </div>
        <div>
          <Button
            className="w-16 h-16"
            onClick={handleDownload}
            disabled={!image}
          >
            <Download className="size-10" />
          </Button>
        </div>
      </section>

      {/* app area */}
      <section
        className="flex w-full h-full gap-2 overflow-hidden"
        style={{
          flexDirection: side === "left" ? "row" : "row-reverse",
        }}
      >
        {/* left toolbar */}
        <div className="flex flex-col w-100 h-full border rounded p-2">
          <div className="flex flex-row w-full items-center justify-center">
            <span className="font-bold text-2xl">Параметры</span>

            <div className="flex flex-row w-full p-1 items-center justify-end -space-x-4">
              <Button
                size="icon"
                variant="ghost"
                disabled={side === "left"}
                onClick={() => setSide("left")}
              >
                <ArrowLeft />
              </Button>
              <Button
                size="icon"
                variant="ghost"
                disabled={side === "right"}
                onClick={() => setSide("right")}
              >
                <ArrowRight />
              </Button>
            </div>
          </div>
          <Toolbox />
        </div>

        {/* canvas */}
        <div className="flex w-full h-full">
          {image ? (
            <Suspense
              fallback={
                <div className="flex h-full w-full bg-white/20 animate-pulse" />
              }
            >
              <Canvas />
            </Suspense>
          ) : (
            <Overlay
              image={image}
              loading={loading}
              error={error}
              isDragActive={isDragActive}
              getRootProps={getRootProps}
              getInputProps={getInputProps}
            />
          )}
        </div>
      </section>

      {/* Export Progress Modal */}
      <ExportProgress
        isOpen={exportState.isOpen}
        currentImage={exportState.currentImage}
        currentIndex={exportState.currentIndex}
        total={exportState.total}
        onCancel={closeExportModal}
        status={exportState.status}
        error={exportState.error}
      />
    </main>
  );
}

export default App;
