import type { Object3D, Vector3 } from 'three'
import { create } from 'zustand'

interface State {
  get: () => State
  set: (state: Partial<State>) => void
  hovered: Object3D | null
  hoveredPosition: Vector3 | null
}

export const useStore = create<State>()((set, get) => ({
  hovered: null,
  hoveredPosition: null,
  get,
  set,
}))
