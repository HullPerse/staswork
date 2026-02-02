import { useState, useEffect, memo, useCallback } from 'react'
import { PDFService, type ProcessedFile } from '@renderer/service/pdf.service'
import { Image } from '@renderer/components/shared/image.component'
import { Button } from '@renderer/components/ui/button.component'
import { cn } from '@renderer/lib/utils'

interface PDFPageSelectionDialogProps {
  file: File
  isOpen: boolean
  onClose: () => void
  onConfirm: (selectedPages: ProcessedFile[]) => void
}

interface PDFPageItemProps {
  page: ProcessedFile
  index: number
  isSelected: boolean
  onToggle: (index: number) => void
}

const PDFPageItem = memo(({ page, index, isSelected, onToggle }: PDFPageItemProps) => {
  const handleClick = useCallback(() => {
    onToggle(index)
  }, [index, onToggle])

  return (
    <div
      className={cn(
        'relative cursor-pointer border-2 rounded-lg overflow-hidden transition-all',
        isSelected ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50'
      )}
      onClick={handleClick}
    >
      <div className="absolute top-2 right-2 z-10">
        <div
          className={cn(
            'w-6 h-6 rounded border-2 flex items-center justify-center',
            isSelected ? 'bg-primary border-primary' : 'bg-background border-border'
          )}
        >
          {isSelected && (
            <svg
              className="w-4 h-4 text-primary-foreground"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                clipRule="evenodd"
              />
            </svg>
          )}
        </div>
      </div>

      <div className="aspect-3/4 bg-muted/50">
        <Image
          src={URL.createObjectURL(page.file)}
          alt={`Page ${index + 1}`}
          className="w-full h-full object-contain"
        />
      </div>

      <div className="p-2 bg-background">
        <p className="text-sm font-medium text-center">Страница {index + 1}</p>
        <p className="text-xs text-muted-foreground text-center">
          {page.dimensions.width} × {page.dimensions.height}
        </p>
      </div>
    </div>
  )
})

function PDFPageSelectionDialog({ file, isOpen, onClose, onConfirm }: PDFPageSelectionDialogProps) {
  const [pages, setPages] = useState<ProcessedFile[]>([])
  const [selectedPages, setSelectedPages] = useState<Set<number>>(new Set())
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (isOpen && file) {
      loadPDFPages()
    }
  }, [isOpen, file])

  const loadPDFPages = async () => {
    setLoading(true)
    setError(null)

    try {
      const pdfService = PDFService.getInstance()
      const convertedPages = await pdfService.convertPDFToImages(file)
      setPages(convertedPages)

      const allPageNumbers = convertedPages.map((_, index) => index)
      setSelectedPages(new Set(allPageNumbers))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load PDF pages')
    } finally {
      setLoading(false)
    }
  }

  const togglePageSelection = useCallback((pageIndex: number) => {
    setSelectedPages((prev) => {
      const newSet = new Set(prev)
      if (newSet.has(pageIndex)) {
        newSet.delete(pageIndex)
      } else {
        newSet.add(pageIndex)
      }
      return newSet
    })
  }, [])

  const selectAllPages = useCallback(() => {
    const allPageNumbers = pages.map((_, index) => index)
    setSelectedPages(new Set(allPageNumbers))
  }, [pages])

  const deselectAllPages = useCallback(() => {
    setSelectedPages(new Set())
  }, [])

  const handleConfirm = useCallback(() => {
    const selectedPagesData = pages.filter((_, index) => selectedPages.has(index))
    onConfirm(selectedPagesData)
    onClose()
  }, [pages, selectedPages, onConfirm, onClose])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-background border rounded-lg p-6 max-w-4xl w-full mx-4 max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-semibold text-foreground">Выбор страниц</h2>
            <p className="text-sm text-muted-foreground">
              {file.name} • {pages.length} страниц
            </p>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose} className="h-8 w-8">
            ×
          </Button>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-2 mb-4">
          <Button variant="ghost" size="sm" onClick={selectAllPages} disabled={loading}>
            Выделить все
          </Button>
          <Button variant="ghost" size="sm" onClick={deselectAllPages} disabled={loading}>
            Отменить все
          </Button>
          <div className="ml-auto text-sm text-muted-foreground">
            {selectedPages.size} из {pages.length} страниц выбрано
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
                <p className="text-sm text-muted-foreground">Загрузка файла...</p>
              </div>
            </div>
          ) : error ? (
            <div className="flex items-center justify-center h-64">
              <div className="text-center">
                <p className="text-red-500 mb-2">Ошибка: {error}</p>
                <Button size="sm" onClick={loadPDFPages}>
                  Повтор
                </Button>
              </div>
            </div>
          ) : pages.length === 0 ? (
            <div className="flex items-center justify-center h-64">
              <p className="text-muted-foreground">Файл пуст</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {pages.map((page, index) => (
                <PDFPageItem
                  key={index}
                  page={page}
                  index={index}
                  isSelected={selectedPages.has(index)}
                  onToggle={togglePageSelection}
                />
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-4 border-t mt-4">
          <Button variant="ghost" onClick={onClose}>
            Отмена
          </Button>
          <Button onClick={handleConfirm} disabled={selectedPages.size === 0 || loading}>
            Загрузить {selectedPages.size}
          </Button>
        </div>
      </div>
    </div>
  )
}

export default memo(PDFPageSelectionDialog)
