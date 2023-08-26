import type { Object3D, Vector3, Matrix4 } from 'three'
import { create } from 'zustand'
import { subscribeWithSelector } from 'zustand/middleware'

interface State {
  get: () => State
  set: (state: Partial<State>) => void

  hovered: Object3D | null
  hoveredNormal: Vector3 | null
  hoveredPosition: Vector3 | null

  isPlacementToolActive: boolean
  setIsPlacementToolActive: (value: boolean) => void
  isDraggingToolActive: boolean
  setIsDraggingToolActive: (value: boolean) => void
  isUpdatingSettings: boolean
  setIsUpdatingSettings: (value: boolean) => void
  devices: Array<DeviceData>
  setDevices: (devices: Array<DeviceData>) => void
  addDevice: (device: DeviceData) => void
  removeDevice: (id: string) => void
  updateDevice: (id: string, data: Partial<DeviceData>) => void
  activeDevice: DeviceData | null
  setActiveDevice: (device: DeviceData | null) => void
}

export interface DeviceData {
  id: string
  name: string
  position: Vector3
  parentWorldMatrix: Matrix4
}

export const useStore = create<State>()(
  subscribeWithSelector((set, get) => ({
    get,
    set,

    isPlacementToolActive: false,
    setIsPlacementToolActive: (value: boolean) => set({ isPlacementToolActive: value, activeDevice: null }),

    isDraggingToolActive: false,
    setIsDraggingToolActive: (value: boolean) => set({ isDraggingToolActive: value }),

    isUpdatingSettings: false,
    setIsUpdatingSettings: (value: boolean) => set({ isUpdatingSettings: value }),

    devices: [],
    setDevices: (devices: Array<DeviceData>) => set({ devices }),

    activeDevice: null,
    setActiveDevice: (device: DeviceData | null) => set({ activeDevice: device }),

    hovered: null,
    hoveredNormal: null,
    hoveredPosition: null,

    addDevice: (device: DeviceData) => {
      const { devices } = get()
      set({ devices: [...devices, device] })
    },
    removeDevice: (id: string) => {
      console.log('removeDevice', id)
      const deviceIndex = get().devices.findIndex((device) => device.id === id)
      if (deviceIndex === -1) return
      const oldList = get().devices
      const newList = [...oldList.slice(0, deviceIndex), ...oldList.slice(deviceIndex + 1)]
      set({ devices: newList, activeDevice: null })
    },
    updateDevice: (id: string, data: Partial<DeviceData>) => {
      const deviceIndex = get().devices.findIndex((device) => device.id === id)
      if (deviceIndex === -1) return
      const oldList = get().devices
      const newList = [
        ...oldList.slice(0, deviceIndex),
        { ...oldList[deviceIndex], ...data },
        ...oldList.slice(deviceIndex + 1),
      ]
      set({ devices: newList })
    },
  }))
)
