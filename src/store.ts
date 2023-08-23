import type { Object3D, Vector3 } from 'three'
import { create } from 'zustand'
import { subscribeWithSelector } from 'zustand/middleware'

interface State {
  get: () => State
  set: (state: Partial<State>) => void
  hovered: Object3D | null
  hoveredNormal: Vector3 | null
  hoveredPosition: Vector3 | null
}

export const useStore = create<State>()(
  subscribeWithSelector((set, get) => ({
    hovered: null,
    hoveredNormal: null,
    hoveredPosition: null,
    get,
    set,
  }))
)
