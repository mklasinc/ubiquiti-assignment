import { CameraControls } from '@react-three/drei'
import { useStore } from '@/store'
import { useEffect, useRef } from 'react'
import { useThree } from '@react-three/fiber'
import { useControls, button } from 'leva'

export const Controls = () => {
  const get = useThree((state) => state.get)

  const isDraggingToolActive = useStore((state) => state.isDraggingToolActive)
  const isUpdatingSettings = useStore((state) => state.isUpdatingSettings)
  const activeDevice = useStore((state) => state.activeDevice)
  const ref = useRef<CameraControls>(null)
  const scene = useThree((state) => state.scene)

  useEffect(() => {
    if (!ref.current) return

    if (activeDevice) {
      const activeDeviceMesh = scene.getObjectByName(activeDevice.id)
      if (!activeDeviceMesh) return
      ref.current.fitToBox(activeDeviceMesh, true, {
        paddingTop: 3,
        paddingBottom: 3,
        paddingLeft: 3,
        paddingRight: 3,
      })
      ref.current.setTarget(...activeDevice.position.toArray(), true)
    } else {
      ref.current.reset(true)
    }
  }, [activeDevice, scene])

  useControls('Camera', {
    'zoom in': button(() => {
      const cameraControls = get().controls as unknown as CameraControls
      const camera = get().camera
      cameraControls.zoom(camera.zoom / 2, true)
    }),
    'zoom out': button(() => {
      const cameraControls = get().controls as unknown as CameraControls
      const camera = get().camera
      cameraControls.zoom(-camera.zoom / 2, true)
    }),
    reset: button(() => {
      {
        const cameraControls = get().controls as unknown as CameraControls
        cameraControls.reset(true)
      }
    }),
  })

  return (
    <CameraControls
      ref={ref}
      makeDefault
      maxDistance={40}
      enabled={!isDraggingToolActive && !isUpdatingSettings}
      polarAngle={Math.PI / 3}
      minPolarAngle={Math.PI * 0.1}
      maxPolarAngle={Math.PI * 0.4}
      maxZoom={5}
      minZoom={1.5}
    />
  )
}
