import React, { useEffect } from 'react'

/**
 * Hook that handles clicks outside of the passed ref
 * @param handler - callback function
 * @param refs  - list of refs to check for clicks
 */
export function useOnClickOutside(
  handler: (event: MouseEvent | TouchEvent) => void,
  ...refs: Array<React.RefObject<HTMLElement>>
) {
  useEffect(() => {
    const listener = (event: MouseEvent | TouchEvent) => {
      // Do nothing if clicking ref's element or descendent elements
      if ([...refs].some((ref) => ref.current?.contains(event.target as Node))) {
        return
      }
      handler(event)
    }
    document.addEventListener('click', listener)
    document.addEventListener('mousedown', listener)
    document.addEventListener('touchstart', listener)
    return () => {
      document.removeEventListener('click', listener)
      document.removeEventListener('mousedown', listener)
      document.removeEventListener('touchstart', listener)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [...refs])
}
