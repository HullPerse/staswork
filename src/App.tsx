import {
  ArrowLeft,
  ArrowRight,
  Dot,
  FileText,
  FolderArchive,
  Hash,
  ImageMinus,
  ImagePlus,
  LassoSelect,
  Type,
} from "lucide-react";
import {
  lazy,
  Suspense,
  useCallback,
  useMemo,
  useState,
  useRef,
  useEffect,
} from "react";
import { useDropzone } from "react-dropzone";
import ExportProgress from "./components/features/export.component";
import PDFPageSelectionDialog from "./components/features/selection.component";
import Overlay from "./components/shared/overlay.component";
import { Button } from "./components/ui/button.component";
import { useCanvasState } from "./context/canvas.context";
import { useTextState } from "./context/text.context";
import { useDotState } from "./context/dot.context";
import {
  createImageArchive,
  downloadArchive,
  processImageWithDots,
  type ProcessedImage,
} from "./lib/export.utils";
import { pdf, Document, Page, Image as PDFImage } from "@react-pdf/renderer";
import { isPDFFile } from "./lib/pdf.utils";

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
    updateActiveImageTexts,
    updateActiveImageDots,
    hashMode,
    setHashMode,
    hashStandaloneDotsEnabled,
    hashStandaloneDotsSettings,
  } = useCanvasState();

  const { texts, setTexts, clearTexts } = useTextState();
  const { standaloneDots, setStandaloneDots, clearDots } = useDotState();

  const isInitializingRef = useRef(false);

  useEffect(() => {
    if (!activeImageId) return;

    const activeImage = imageHistory.find((img) => img.id === activeImageId);
    if (!activeImage) return;

    isInitializingRef.current = true;
    setTexts(activeImage.currentTexts || []);
    setStandaloneDots(activeImage.currentStandaloneDots || []);

    setTimeout(() => {
      isInitializingRef.current = false;
    }, 100);
  }, [activeImageId, imageHistory, setTexts, setStandaloneDots]);

  useEffect(() => {
    if (isInitializingRef.current || !activeImageId) return;

    updateActiveImageTexts(texts);
  }, [texts, updateActiveImageTexts, activeImageId]);

  useEffect(() => {
    if (isInitializingRef.current || !activeImageId) return;

    updateActiveImageDots(standaloneDots);
  }, [standaloneDots, updateActiveImageDots, activeImageId]);

  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<boolean>(false);

  const [pdfDialog, setPdfDialog] = useState<{
    isOpen: boolean;
    file: File | null;
  }>({
    isOpen: false,
    file: null,
  });

  const onDrop = useCallback(
    async (files: File[]) => {
      if (!files?.length) return;

      setLoading(true);
      try {
        const imageFiles = files.filter((file) =>
          file.type.startsWith("image/"),
        );
        const pdfFiles = files.filter((file) => isPDFFile(file));

        if (imageFiles.length === 0 && pdfFiles.length === 0) return;

        if (imageFiles.length > 0) {
          await handleImagesUpload(imageFiles);
        }

        if (pdfFiles.length > 0) {
          setPdfDialog({
            isOpen: true,
            file: pdfFiles[0],
          });
        }
      } catch (e) {
        setError(true);
        console.error(e);
      } finally {
        setLoading(false);
      }
    },
    [handleImagesUpload],
  );

  const handlePDFPageSelection = useCallback(
    async (selectedPages: any[]) => {
      try {
        const files = selectedPages.map((page) => page.file);
        await handleImagesUpload(files);
      } catch (error) {
        console.error("Error processing selected PDF pages:", error);
        setError(true);
      }
    },
    [handleImagesUpload],
  );

  const closePDFDialog = useCallback(() => {
    setPdfDialog({ isOpen: false, file: null });
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "image/*": [".jpeg", ".jpg", ".png", ".webp"],
      "application/pdf": [".pdf"],
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

      const processedImages: ProcessedImage[] = [];

      for (let i = 0; i < imageHistory.length; i++) {
        const image = imageHistory[i];
        setExportState((prev) => ({
          ...prev,
          currentImage: image.name,
          currentIndex: i + 1,
        }));

        const processedImage = await processImageWithDots(
          image,
          undefined,
          undefined,
          hashStandaloneDotsEnabled,
          hashStandaloneDotsSettings,
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

  const handleDownloadPdf = async () => {
    if (imageHistory.length === 0) return;

    try {
      setExportState({
        isOpen: true,
        currentImage: "",
        currentIndex: 1,
        total: imageHistory.length,
        status: "processing",
      });

      const processedImages: ProcessedImage[] = [];

      for (let i = 0; i < imageHistory.length; i++) {
        const image = imageHistory[i];
        setExportState((prev) => ({
          ...prev,
          currentImage: image.name,
          currentIndex: i + 1,
        }));

        const processedImage = await processImageWithDots(
          image,
          undefined,
          undefined,
          hashStandaloneDotsEnabled,
          hashStandaloneDotsSettings,
        );
        processedImages.push(processedImage);
      }

      setExportState((prev) => ({ ...prev, status: "compressing" }));

      const MyDocument = () => (
        <Document>
          {processedImages.map((processedImage, index) => (
            <Page
              key={index}
              size={{
                width: processedImage.dimensions.width,
                height: processedImage.dimensions.height,
              }}
              style={{ padding: 0 }}
            >
              <PDFImage
                src={processedImage.blob}
                style={{ width: "100%", height: "100%" }}
              />
            </Page>
          ))}
        </Document>
      );

      setExportState((prev) => ({ ...prev, status: "downloading" }));
      const blob = await pdf(<MyDocument />).toBlob();

      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "Результат.pdf";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      setExportState((prev) => ({ ...prev, status: "completed" }));
    } catch (error) {
      console.error("Ошибка при экспорте PDF:", error);
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
            disabled={!image || (!textMode && !dotMode && !hashMode)}
            onClick={() => {
              setTextMode(false);
              setDotMode(false);
              setHashMode(false);
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
              setHashMode(false);
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
              setHashMode(false);
              setTextMode(false);
              setArea(false);
            }}
          >
            <Dot className="size-10" />
          </Button>
          <Button
            className="w-16 h-16 bg-green-500/20 border-green-500 hover:bg-green-500/60"
            disabled={!image || hashMode}
            onClick={() => {
              setHashMode(true);
              setDotMode(false);
              setTextMode(false);
              setArea(false);
            }}
          >
            <Hash className="size-10" />
          </Button>
        </div>
        <div className="flex flex-row gap-2">
          <Button
            className="w-16 h-16"
            title="Сохранить в PDF"
            disabled={!image}
            onClick={handleDownloadPdf}
          >
            <FileText className="size-10" />
          </Button>
          <Button
            className="w-16 h-16"
            title="Сохранить в архиве"
            onClick={handleDownload}
            disabled={!image}
          >
            <FolderArchive className="size-10" />
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

      {/* PDF Page Selection Dialog */}
      {pdfDialog.file && (
        <PDFPageSelectionDialog
          file={pdfDialog.file}
          isOpen={pdfDialog.isOpen}
          onClose={closePDFDialog}
          onConfirm={handlePDFPageSelection}
        />
      )}
    </main>
  );
}

export default App;
