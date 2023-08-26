import { useEffect } from 'react'
import { useGLTF } from '@react-three/drei'
import * as THREE from 'three'
import { useStore } from '../store'
import { v4 as uuidv4 } from 'uuid'
import { ENV_MAP_DEFAULT_INTENSITY } from '@/constants'

export function FloorPlan() {
  let model = useGLTF('floorplan.glb')

  const addDevice = useStore((state) => state.addDevice)
  const storeSet = useStore((state) => state.set)
  const isPlacementToolActive = useStore((state) => state.isPlacementToolActive)

  useEffect(() => {
    if (!model) return

    const meshesToRemove: THREE.Object3D[] = []

    model.scene.name = 'Floorplan'

    model.scene.traverse((child) => {
      if (child.name.includes('Ceiling')) meshesToRemove.push(child)
      if (child instanceof THREE.Mesh) {
        child.material.envMapIntensity = ENV_MAP_DEFAULT_INTENSITY
        child.material.needsUpdate = true
      }

      if (child.name.toLowerCase().includes('wall') && child instanceof THREE.Mesh) {
        child.userData = { type: 'wall' }
      }

      // if (child instanceof THREE.Mesh) {
      //   const vertexNormalsHelper = new VertexNormalsHelper(child, 0.1, 0x00ff00)
      //   scene.add(vertexNormalsHelper)
      // }
    })

    for (let i = 0; i < meshesToRemove.length; i++) {
      let obj = meshesToRemove[i]

      obj.parent?.remove(obj)
    }
  }, [model])

  return (
    <primitive
      object={model.scene}
      onPointerOver={(e: any) => {
        e.stopPropagation()

        storeSet({
          hovered: e.object,
          hoveredNormal: e.face.normal,
          hoveredPosition: e.point,
        })
      }}
      onPointerMove={(e: any) => {
        e.stopPropagation()
        const directionVector = new THREE.Vector3().copy(e.unprojectedPoint).sub(e.point).normalize()
        storeSet({ hoveredPosition: e.point.addScaledVector(directionVector, 0.2), hoveredNormal: e.normal })
      }}
      onClick={(e: any) => {
        e.stopPropagation()
        if (e.object.userData.type === 'wall' && isPlacementToolActive) {
          addDevice({
            id: uuidv4(),
            name: 'Device',
            position: e.point,
            parentWorldMatrix: e.object.matrixWorld,
          })
          storeSet({ isPlacementToolActive: false })
        }
      }}
    />
  )
}
