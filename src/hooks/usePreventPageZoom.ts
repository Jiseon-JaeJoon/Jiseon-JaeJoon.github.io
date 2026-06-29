import { useEffect } from 'react'

export function usePreventPageZoom() {
  useEffect(() => {
    let lastTouchEnd = 0
    const nonPassiveOptions: AddEventListenerOptions = { passive: false }

    const preventPinchZoom = (event: TouchEvent) => {
      if (event.touches.length > 1) {
        event.preventDefault()
      }
    }

    const preventDoubleTapZoom = (event: TouchEvent) => {
      const now = Date.now()
      if (now - lastTouchEnd <= 300) {
        event.preventDefault()
      }
      lastTouchEnd = now
    }

    const preventGesture = (event: Event) => {
      event.preventDefault()
    }

    document.addEventListener('touchmove', preventPinchZoom, nonPassiveOptions)
    document.addEventListener('touchend', preventDoubleTapZoom, nonPassiveOptions)
    document.addEventListener('gesturestart', preventGesture, nonPassiveOptions)
    document.addEventListener('gesturechange', preventGesture, nonPassiveOptions)
    document.addEventListener('gestureend', preventGesture, nonPassiveOptions)

    return () => {
      document.removeEventListener('touchmove', preventPinchZoom, nonPassiveOptions)
      document.removeEventListener('touchend', preventDoubleTapZoom, nonPassiveOptions)
      document.removeEventListener('gesturestart', preventGesture, nonPassiveOptions)
      document.removeEventListener('gesturechange', preventGesture, nonPassiveOptions)
      document.removeEventListener('gestureend', preventGesture, nonPassiveOptions)
    }
  }, [])
}
