import { memo } from 'react'
import { ImageUp, LoaderCircle } from 'lucide-react'
import { cn } from '@renderer/lib/utils'
import { type DropzoneState } from 'react-dropzone'

interface OverlayProps {
  image: File | null
  loading: boolean
  error: boolean
  isDragActive: boolean
  getRootProps: DropzoneState['getRootProps']
  getInputProps: DropzoneState['getInputProps']
}

function Overlay({
  image,
  loading,
  error,
  isDragActive,
  getRootProps,
  getInputProps
}: OverlayProps) {
  if (error) return <main>Ошибка загрузки изображения</main>

  return (
    <main
      tabIndex={0}
      className={cn(
        'flex w-full border-2 border-dashed rounded p-1 border-white hover:border-primary transition-colors cursor-pointer',
        isDragActive && 'border-primary'
      )}
      {...getRootProps()}
    >
      <input {...getInputProps()} />

      <div className="flex w-full h-full items-center justify-center ">
        {loading && <LoaderCircle className="animate-spin size-20" />}
        {!image && !loading && (
          <div className="flex flex-col w-full items-center justify-center gap-2">
            <ImageUp className="size-20" />
            <span className="text-2xl">Загрузите изображения</span>
            <span className="text-sm text-muted-foreground">
              Вы можете загрузить несколько изображений одновременно
            </span>
          </div>
        )}
      </div>
    </main>
  )
}

export default memo(Overlay)
