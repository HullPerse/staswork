import { useCallback, useRef } from 'react'
import { TextElement, DotElement } from '@renderer/types'
import type { MouseEvent } from 'react'

interface UseElementDragParams {
  updateElement: (id: string, updates: { x: number; y: number }) => void
  setSelectedId: (id: string) => void
}

export function useTextDrag(
  { updateElement, setSelectedId }: UseElementDragParams,
  texts: TextElement[]
) {
  const handleTextMouseDown = useCallback(
    (e: MouseEvent, textId: string) => {
      e.stopPropagation()
      setSelectedId(textId)

      const svg = (e.currentTarget as HTMLElement)?.closest('svg')
      if (!svg) return

      const rect = svg.getBoundingClientRect()
      const viewBox = svg.viewBox.baseVal

      const textElement = texts.find((t) => t.id === textId)
      if (!textElement) return

      const initialClientX = e.clientX
      const initialClientY = e.clientY
      const initialTextX = textElement.x
      const initialTextY = textElement.y

      let animationFrameId: number | null = null

      const handleMouseMove = (moveEvent: MouseEvent) => {
        if (animationFrameId) {
          cancelAnimationFrame(animationFrameId)
        }

        animationFrameId = requestAnimationFrame(() => {
          const deltaX = moveEvent.clientX - initialClientX
          const deltaY = moveEvent.clientY - initialClientY

          const svgDeltaX = (deltaX / rect.width) * viewBox.width
          const svgDeltaY = (deltaY / rect.height) * viewBox.height

          const newX = initialTextX + svgDeltaX
          const newY = initialTextY + svgDeltaY

          updateElement(textId, { x: newX, y: newY })
        })
      }

      const handleMouseUp = () => {
        if (animationFrameId) {
          cancelAnimationFrame(animationFrameId)
        }

        document.removeEventListener('mousemove', handleMouseMove as any)
        document.removeEventListener('mouseup', handleMouseUp)
        document.body.style.cursor = ''
        document.body.style.userSelect = ''
      }

      document.body.style.cursor = 'grabbing'
      document.body.style.userSelect = 'none'

      document.addEventListener('mousemove', handleMouseMove as any)
      document.addEventListener('mouseup', handleMouseUp)
    },
    [setSelectedId, updateElement, texts]
  )

  return handleTextMouseDown
}

export function useDotDrag(
  { updateElement, setSelectedId }: UseElementDragParams,
  dots: DotElement[]
) {
  const handleDotMouseDown = useCallback(
    (e: MouseEvent, dotId: string) => {
      e.stopPropagation()
      setSelectedId(dotId)

      const svg = (e.currentTarget as HTMLElement)?.closest('svg')
      if (!svg) return

      const rect = svg.getBoundingClientRect()
      const viewBox = svg.viewBox.baseVal

      const dotElement = dots.find((d) => d.id === dotId)
      if (!dotElement) return

      const initialClientX = e.clientX
      const initialClientY = e.clientY
      const initialDotX = dotElement.x
      const initialDotY = dotElement.y

      let animationFrameId: number | null = null

      const handleMouseMove = (moveEvent: MouseEvent) => {
        if (animationFrameId) {
          cancelAnimationFrame(animationFrameId)
        }

        animationFrameId = requestAnimationFrame(() => {
          const deltaX = moveEvent.clientX - initialClientX
          const deltaY = moveEvent.clientY - initialClientY

          const svgDeltaX = (deltaX / rect.width) * viewBox.width
          const svgDeltaY = (deltaY / rect.height) * viewBox.height

          const newX = initialDotX + svgDeltaX
          const newY = initialDotY + svgDeltaY

          updateElement(dotId, { x: newX, y: newY })
        })
      }

      const handleMouseUp = () => {
        if (animationFrameId) {
          cancelAnimationFrame(animationFrameId)
        }

        document.removeEventListener('mousemove', handleMouseMove as any)
        document.removeEventListener('mouseup', handleMouseUp)
        document.body.style.cursor = ''
        document.body.style.userSelect = ''
      }

      document.body.style.cursor = 'grabbing'
      document.body.style.userSelect = 'none'

      document.addEventListener('mousemove', handleMouseMove as any)
      document.addEventListener('mouseup', handleMouseUp)
    },
    [setSelectedId, updateElement, dots]
  )

  return handleDotMouseDown
}

export function useDotsCalculation() {
  const resultsRef = useRef<{ cx: number; cy: number }[]>([])
  return resultsRef
}
