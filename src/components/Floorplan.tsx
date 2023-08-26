import { useEffect } from 'react'
import { useGLTF } from '@react-three/drei'
import * as THREE from 'three'
import { useStore } from '../store'
import { v4 as uuidv4 } from 'uuid'
import { ENV_MAP_DEFAULT_INTENSITY } from '@/constants'
import { useThree } from '@react-three/fiber'

export function FloorPlan() {
  let model = useGLTF('floorplan.glb')

  const addDevice = useStore((state) => state.addDevice)
  const storeSet = useStore((state) => state.set)
  const camera = useThree((state) => state.camera)
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
        const canPlaceNewDevice = e.object.userData.type === 'wall' && isPlacementToolActive

        if (canPlaceNewDevice) {
          const hoveredObjectWorldDirection = e.object.getWorldDirection(new THREE.Vector3())
          const cameraDirection = camera.getWorldDirection(new THREE.Vector3())
          const hoveredObjectQuaternion = e.object.getWorldQuaternion(new THREE.Quaternion())
          const worldMatrix = e.object.matrixWorld.clone()

          // Calculate the dot product between the camera direction and the test vector
          const dotProduct = cameraDirection.dot(hoveredObjectWorldDirection)
          const isObjectFacingCamera = dotProduct <= 0
          if (!isObjectFacingCamera) {
            const adjustedQuaternion = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 1, 0), Math.PI)
            hoveredObjectQuaternion.multiply(adjustedQuaternion)
          }

          worldMatrix.makeRotationFromQuaternion(hoveredObjectQuaternion)

          addDevice({
            id: uuidv4(),
            name: 'Device',
            position: e.point,
            parentWorldMatrix: worldMatrix,
          })
          storeSet({ isPlacementToolActive: false })
        }
      }}
    />
  )
}
