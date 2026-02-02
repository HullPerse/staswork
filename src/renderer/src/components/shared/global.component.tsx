import { calculateProportions, getPolygonArea } from '@renderer/lib/utils'

import { Eye, EyeOff } from 'lucide-react'
import { Image } from './image.component'
import { useCanvasState } from '@renderer/context/canvas.context'

export default function globalHistory() {
  const { imageHistory, activeImageId, amount, handleImageSelect } = useCanvasState()
  if (imageHistory.length === 0) {
    return <span className="text-2xl text-center">Пока нет данных</span>
  }

  return imageHistory.map((image, index) => (
    <section
      key={image.id}
      className={`flex flex-col border rounded p-2 cursor-pointer transition-colors  ${
        activeImageId === image.id ? 'bg-accent border-primary' : 'hover:bg-accent/50'
      }`}
      onClick={() => handleImageSelect(image.id)}
    >
      <div className="flex items-center gap-2 mb-2">
        <Image
          src={image.BlobUrl}
          alt={image.name}
          className="w-14 h-14 object-cover rounded border"
        />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium truncate">{image.name}</p>
          <p className="text-xs text-white">
            {(() => {
              const allImageAreas = imageHistory.map((img) =>
                img.editHistory.reduce((sum, item) => sum + getPolygonArea(item.settings.points), 0)
              )
              const totalAllAreas = allImageAreas.reduce((sum, area) => sum + area, 0)

              const percentages = imageHistory.map((img) => {
                const imgTotalArea = img.editHistory.reduce(
                  (sum, item) => sum + getPolygonArea(item.settings.points),
                  0
                )
                return totalAllAreas > 0 ? Math.round((imgTotalArea / totalAllAreas) * 100) : 0
              })

              const currentImagePercentage = percentages[imageHistory.indexOf(image)]

              const proportions = calculateProportions(Number(amount) || 0, percentages)
              const currentImageProportion = proportions[imageHistory.indexOf(image)]

              return `Область ${index + 1}: ${currentImageProportion} (${currentImagePercentage}%)`
            })()}
          </p>
        </div>
      </div>

      {image.editHistory.length !== 0 && (
        <div className="space-y-1">
          {image.editHistory.map((historyItem, historyIndex) => (
            <div key={historyIndex} className="flex items-center gap-2 text-xs p-1 rounded">
              <span className="font-medium">Область {historyIndex + 1}:</span>
              <span className="text-muted-foreground">{historyItem.dots.length} точек</span>
              <span className="ml-auto">
                {historyItem.visible ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
              </span>
            </div>
          ))}
        </div>
      )}
    </section>
  ))
}
