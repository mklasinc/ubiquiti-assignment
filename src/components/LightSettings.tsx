import {
  AMBIENT_LIGHT_DEFAULT_COLOR,
  AMBIENT_LIGHT_DEFAULT_INTENSITY,
  ENV_MAP_DEFAULT_INTENSITY,
  LAYERS,
} from '@/constants'
import { useStore } from '@/store'
import { useThree } from '@react-three/fiber'
import { useControls } from 'leva'
import * as THREE from 'three'
import { useDebouncedCallback } from 'use-debounce'

export const LightSettings = () => {
  const get = useThree((state) => state.get)
  const setIsUpdatingSettings = useStore((state) => state.setIsUpdatingSettings)

  /*
   * Debounce the setIsUpdatingSettings call to prevent the UI slider dragging from orbiting the camera
   * Normally you would prevent the event from bubbling up to the canvas, but the Leva GUI onChange DOM events are not exposed
   */
  const debouncedSetIsUpdatingSettings = useDebouncedCallback((value: boolean) => {
    setIsUpdatingSettings(value)
  }, 200)

  useControls('Env map', {
    intensity: {
      value: ENV_MAP_DEFAULT_INTENSITY,
      min: 0,
      max: 1,
      onChange: (value) => {
        if (value === ENV_MAP_DEFAULT_INTENSITY) return

        setIsUpdatingSettings(true)
        debouncedSetIsUpdatingSettings(false)

        const scene = get().scene
        const floorplan = scene.getObjectByName(LAYERS.FLOOORPLAN) as THREE.Group

        if (!floorplan) return

        floorplan.traverse((child) => {
          if (child instanceof THREE.Mesh) {
            child.material.envMapIntensity = value
            child.material.needsUpdate = true
          }
        })
      },
    },
  })

  useControls('Lighting', {
    intensity: {
      value: AMBIENT_LIGHT_DEFAULT_INTENSITY,
      min: 0,
      max: 1,
      onChange: (value) => {
        if (value === AMBIENT_LIGHT_DEFAULT_INTENSITY) return

        setIsUpdatingSettings(true)
        debouncedSetIsUpdatingSettings(false)

        const scene = get().scene
        const ambientLight = scene.getObjectByName(LAYERS.AMBIENT_LIGHT) as THREE.AmbientLight

        if (!ambientLight) return

        ambientLight.intensity = value
      },
    },
    color: {
      value: AMBIENT_LIGHT_DEFAULT_COLOR,
      onChange: (value) => {
        const scene = get().scene
        const ambientLight = scene.getObjectByName(LAYERS.AMBIENT_LIGHT) as THREE.AmbientLight

        if (!ambientLight) return

        ambientLight.color.setStyle(value)
      },
    },
  })

  return <></>
}
