import { useEffect } from 'react'
import { useGLTF } from '@react-three/drei'
import * as THREE from 'three'
import { ENV_MAP_DEFAULT_INTENSITY, LAYERS } from '@/constants'

export function FloorPlan(props: JSX.IntrinsicElements['group']) {
  let model = useGLTF('floorplan.glb')

  useEffect(() => {
    if (!model) return

    const meshesToRemove: THREE.Object3D[] = []

    model.scene.name = LAYERS.FLOOORPLAN

    model.scene.traverse((child) => {
      if (child.name.includes('Ceiling')) meshesToRemove.push(child)
      if (child instanceof THREE.Mesh) {
        child.material.envMapIntensity = ENV_MAP_DEFAULT_INTENSITY
        child.material.needsUpdate = true
      }

      if (child.name.toLowerCase().includes('wall') && child instanceof THREE.Mesh) {
        child.userData = { type: LAYERS.WALL }
      }
    })

    for (let i = 0; i < meshesToRemove.length; i++) {
      let obj = meshesToRemove[i]
      obj.parent?.remove(obj)
    }
  }, [model])

  return <primitive object={model.scene} {...props} />
}
