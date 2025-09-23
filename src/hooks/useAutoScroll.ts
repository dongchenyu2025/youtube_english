import { useEffect, useRef } from 'react'

interface UseAutoScrollOptions {
  enabled: boolean
  offset?: number
  behavior?: ScrollBehavior
}

export const useAutoScroll = (
  activeElementId: string | number | null,
  options: UseAutoScrollOptions = { enabled: true }
) => {
  const containerRef = useRef<HTMLDivElement>(null)
  const { enabled, offset = 100, behavior = 'smooth' } = options

  useEffect(() => {
    if (!enabled || !activeElementId || !containerRef.current) return

    const container = containerRef.current
    const activeElement = container.querySelector(`[data-subtitle-id="${activeElementId}"]`) as HTMLElement

    if (!activeElement) return

    const containerRect = container.getBoundingClientRect()
    const elementRect = activeElement.getBoundingClientRect()

    const isElementVisible =
      elementRect.top >= containerRect.top &&
      elementRect.bottom <= containerRect.bottom

    if (!isElementVisible) {
      const elementTop = activeElement.offsetTop
      const containerHeight = container.clientHeight
      const elementHeight = activeElement.clientHeight

      let scrollTo = elementTop - offset

      if (elementTop + elementHeight > container.scrollTop + containerHeight) {
        scrollTo = elementTop - containerHeight + elementHeight + offset
      }

      container.scrollTo({
        top: Math.max(0, scrollTo),
        behavior
      })
    }
  }, [activeElementId, enabled, offset, behavior])

  return containerRef
}