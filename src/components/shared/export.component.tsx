import { X } from "lucide-react";
import { Button } from "../ui/button.component";

interface ExportProgressProps {
  isOpen: boolean;
  currentImage: string;
  currentIndex: number;
  total: number;
  onCancel: () => void;
  status: "processing" | "compressing" | "downloading" | "completed" | "error";
  error?: string;
}

export default function ExportProgress({
  isOpen,
  currentImage,
  currentIndex,
  total,
  onCancel,
  status,
  error,
}: ExportProgressProps) {
  if (!isOpen) return null;

  const getStatusText = () => {
    switch (status) {
      case "processing":
        return `Подготовка изображения ${currentIndex} из ${total}`;
      case "compressing":
        return "Создание архива...";
      case "downloading":
        return "Скачивание архива...";
      case "completed":
        return "Скачивание завершено";
      case "error":
        return "Произошла ошибка";
      default:
        return "Обработка...";
    }
  };

  const getProgressPercentage = () => {
    if (status === "compressing") return 90;
    if (status === "downloading") return 95;
    if (status === "completed") return 100;
    return (currentIndex / total) * 80;
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-background border rounded-lg p-6 max-w-md w-full mx-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Экспорт изображений</h2>
          <Button
            size="icon"
            variant="ghost"
            onClick={onCancel}
            disabled={status !== "processing"}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Status */}
        <div className="mb-2">
          <p className="text-sm text-muted-foreground">{getStatusText()}</p>
          {currentImage && status === "processing" && (
            <p className="text-xs text-muted-foreground truncate mt-1">
              {currentImage}
            </p>
          )}
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-secondary rounded-full h-2 mb-4">
          <div
            className="bg-primary h-2 rounded-full transition-all duration-300"
            style={{ width: `${getProgressPercentage()}%` }}
          />
        </div>

        {/* Error Message */}
        {status === "error" && (
          <div className="bg-destructive/10 border border-destructive/20 rounded p-3 mb-4">
            <p className="text-sm text-destructive">
              {error || "Неизвестная ошибка"}
            </p>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex justify-end gap-2">
          {status === "processing" && (
            <Button variant="ghost" onClick={onCancel}>
              Отмена
            </Button>
          )}
          {status === "completed" && (
            <Button onClick={onCancel}>Завершить</Button>
          )}
          {status === "error" && <Button onClick={onCancel}>Закрыть</Button>}
        </div>
      </div>
    </div>
  );
}
