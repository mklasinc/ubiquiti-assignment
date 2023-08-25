import { useEffect, useRef } from 'react'
import * as THREE from 'three'
import { useStore } from '@/store'
import { Device } from './Device'
import { DEVICE_SCALE } from '@/constants'

export function PlacementTool() {
  const pointerRef = useRef<any>()
  const debugPointerRef = useRef<any>()
  const deviceRef = useRef<any>()

  const isPlacementToolActive = useStore((state) => state.isPlacementToolActive)
  const hovered = useStore((state) => state.hovered)

  const canPlaceDevice = hovered?.userData?.type === 'wall'

  useEffect(() => {
    const unsub1 = useStore.subscribe(
      (state) => [state.hovered, state.hoveredNormal],
      ([hovered]) => {
        const hoveredObject = hovered as THREE.Object3D
        // Create a Quaternion representing the rotation
        const worldQuaternion = hoveredObject.getWorldQuaternion(new THREE.Quaternion())

        // Apply the rotation to the object
        pointerRef.current.setRotationFromQuaternion(worldQuaternion)

        // Rotate the tracker to be flat on the floor
        if (hoveredObject.name.includes('Floor')) {
          pointerRef.current.setRotationFromAxisAngle(new THREE.Vector3(1, 0, 0), -Math.PI * 0.5)
        }
      }
    )

    const unsub2 = useStore.subscribe(
      (state) => [state.hoveredPosition, state.hoveredNormal],
      ([position, normal]) => {
        if (!pointerRef.current) return
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

  return (
    <>
      <group ref={pointerRef} visible={isPlacementToolActive}>
        <mesh>
          <planeGeometry args={[1, 1]} />
          <meshStandardMaterial
            color={canPlaceDevice ? 'blue' : 'red'}
            transparent
            opacity={0.4}
            side={THREE.DoubleSide}
          />
        </mesh>
        <Device ref={deviceRef} scale={DEVICE_SCALE} />
      </group>
      <mesh ref={debugPointerRef}>
        <boxGeometry args={[0.1, 0.1, 0.01]} />
        <meshStandardMaterial color={'red'} />
      </mesh>
    </>
  )
}
