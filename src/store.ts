import type { Object3D, Vector3, Matrix4 } from 'three'
import { create } from 'zustand'
import { subscribeWithSelector } from 'zustand/middleware'

interface State {
  get: () => State
  set: (state: Partial<State>) => void

  raycasterTarget: Object3D | null
  setRaycasterTarget: (value: Object3D | null) => void

  raycasterEvent: {
    normal: Vector3
    position: Vector3
  } | null
  setRaycasterEvent: (event: { normal: Vector3; position: Vector3 } | null) => void

  isPlacementToolActive: boolean
  setIsPlacementToolActive: (value: boolean) => void
  hasInteractedWithPlacementTool: boolean

  isDraggingToolActive: boolean
  setIsDraggingToolActive: (value: boolean) => void
  isMovingCamera: boolean
  setIsMovingCamera: (value: boolean) => void
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
    hasInteractedWithPlacementTool: false,
    setIsPlacementToolActive: (value: boolean) =>
      set({ isPlacementToolActive: value, activeDevice: null, hasInteractedWithPlacementTool: true }),

    isDraggingToolActive: false,
    setIsDraggingToolActive: (value: boolean) => set({ isDraggingToolActive: value }),

    isMovingCamera: false,
    setIsMovingCamera: (value: boolean) => set({ isMovingCamera: value }),

    isUpdatingSettings: false,
    setIsUpdatingSettings: (value: boolean) => set({ isUpdatingSettings: value }),

    devices: [],
    setDevices: (devices: Array<DeviceData>) => set({ devices }),

    activeDevice: null,
    setActiveDevice: (device: DeviceData | null) => set({ activeDevice: device }),

    raycasterTarget: null,
    setRaycasterTarget: (value: Object3D | null) => set({ raycasterTarget: value }),

    raycasterEvent: null,
    setRaycasterEvent: (event: { normal: Vector3; position: Vector3 } | null) => set({ raycasterEvent: event }),

    addDevice: (device: DeviceData) => {
      const { devices } = get()
      set({ devices: [...devices, device] })
    },
    removeDevice: (id: string) => {
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
