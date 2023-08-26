import { useEffect, useRef } from 'react'
import * as THREE from 'three'
import { useStore } from '@/store'
import { Device } from './Device'
import { DEVICE_SCALE } from '@/constants'
import { useTexture } from '@react-three/drei'
import { useThree } from '@react-three/fiber'

export function PlacementTool({ debug = false }) {
  const pointerRef = useRef<any>()
  const debugPointerRef = useRef<any>()
  const deviceRef = useRef<any>()

  const isPlacementToolActive = useStore((state) => state.isPlacementToolActive)
  const isDraggingToolActive = useStore((state) => state.isDraggingToolActive)
  const hovered = useStore((state) => state.hovered)
  const camera = useThree((state) => state.camera)

  const canPlaceDevice = hovered?.userData?.type === 'wall'

  const markerTexture = useTexture('/selection-area-marker.png')

  useEffect(() => {
    const unsub1 = useStore.subscribe(
      (state) => [state.hovered, state.hoveredNormal],
      ([hovered]) => {
        const hoveredObject = hovered as THREE.Object3D
        if (!hoveredObject) return
        // Create a Quaternion representing the rotation
        const worldQuaternion = hoveredObject.getWorldQuaternion(new THREE.Quaternion())

        // Apply the rotation to the object
        pointerRef.current.setRotationFromQuaternion(worldQuaternion)

        const hoveredObjectWorldDirection = hoveredObject.getWorldDirection(new THREE.Vector3())
        const cameraDirection = camera.getWorldDirection(new THREE.Vector3())

        // Calculate the dot product between the camera direction and the test vector
        const dotProduct = cameraDirection.dot(hoveredObjectWorldDirection)
        const isObjectFacingCamera = dotProduct <= 0
        if (!isObjectFacingCamera) {
          const adjustedQuaternion = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 1, 0), Math.PI)
          pointerRef.current.quaternion.multiply(adjustedQuaternion)
        }
      }
    )

    const unsub2 = useStore.subscribe(
      (state) => [state.hoveredPosition, state.hoveredNormal],
      ([position, normal]) => {
        if (!pointerRef.current || !position) return
        pointerRef.current.position.copy(position).addScaledVector(normal, 0.1)
        pointerRef.current.position.y += 0.01

        if (!debugPointerRef.current) return
        debugPointerRef.current.position.copy(position).addScaledVector(normal, 0.1)
        debugPointerRef.current.position.y += 0.01
      }
    )

    return () => {
      unsub1()
      unsub2()
    }
  }, [])

  useEffect(() => {
    if (isPlacementToolActive) {
      document.body.style.cursor = 'none'
    } else {
      document.body.style.cursor = 'auto'
    }
  }, [isPlacementToolActive])

  return (
    <>
      <group ref={pointerRef} visible={isPlacementToolActive}>
        <mesh scale={1}>
          <planeGeometry args={[1, 1]} />
          <meshStandardMaterial
            color={canPlaceDevice ? 'blue' : 'red'}
            map={markerTexture}
            transparent
            opacity={0.8}
            side={THREE.DoubleSide}
          />
        </mesh>
        <Device ref={deviceRef} scale={DEVICE_SCALE} />
      </group>
      {debug && (
        <mesh ref={debugPointerRef}>
          <boxGeometry args={[0.1, 0.1, 0.01]} />
          <meshStandardMaterial color={'red'} />
        </mesh>
      )}
    </>
  )
}
