import { useEffect, useRef } from 'react'
import * as THREE from 'three'
import { useStore } from '@/store'
import { Device } from './Device'
import { DEVICE_SCALE, LAYERS } from '@/constants'
import { useTexture } from '@react-three/drei'
import { ThreeEvent, useThree } from '@react-three/fiber'
import { v4 as uuidv4 } from 'uuid'

const COLORS = {
  ACTIVE: new THREE.Color('#82d3f5').multiplyScalar(10),
  ERROR: new THREE.Color('#FF0000'),
}

export function PlacementTool({ debug = false, render }: { debug?: boolean; render?: (props: any) => JSX.Element }) {
  const pointerRef = useRef<any>()
  const debugPointerRef = useRef<any>()
  const deviceRef = useRef<any>()

  const isPlacementToolActive = useStore((state) => state.isPlacementToolActive)
  const setIsPlacementToolActive = useStore((state) => state.setIsPlacementToolActive)
  const setRaycasterTarget = useStore((state) => state.setRaycasterTarget)
  const setRaycasterEvent = useStore((state) => state.setRaycasterEvent)
  const raycasterTarget = useStore((state) => state.raycasterTarget)
  const addDevice = useStore((state) => state.addDevice)
  const camera = useThree((state) => state.camera)

  const canPlaceDevice = raycasterTarget?.userData?.type === 'wall'

  const markerTexture = useTexture('/selection-area-marker.png')

  useEffect(() => {
    const unsub1 = useStore.subscribe(
      (state) => state.raycasterTarget,
      (raycasterTarget) => {
        if (!raycasterTarget) return

        const raycasterTargetWorldQuaternion = raycasterTarget.getWorldQuaternion(new THREE.Quaternion())
        pointerRef.current.setRotationFromQuaternion(raycasterTargetWorldQuaternion)

        const raycasterTargetWorldDirection = raycasterTarget.getWorldDirection(new THREE.Vector3())
        const cameraDirection = camera.getWorldDirection(new THREE.Vector3())
        const dotProduct = cameraDirection.dot(raycasterTargetWorldDirection)

        const isObjectFacingCamera = dotProduct <= 0

        if (!isObjectFacingCamera) {
          const adjustedQuaternion = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 1, 0), Math.PI)
          pointerRef.current.quaternion.multiply(adjustedQuaternion)
        }
      }
    )

    const unsub2 = useStore.subscribe(
      (state) => state.raycasterEvent,
      (raycasterEvent) => {
        const { normal, position } = raycasterEvent ?? {}
        if (!pointerRef.current || !position || !normal) return
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

  const handlePointerOver = (e: ThreeEvent<MouseEvent>) => {
    e.stopPropagation()

    setRaycasterTarget(e.object)
    setRaycasterEvent({ normal: e.face!.normal, position: e.point })
  }

  const handlePointerMove = (e: ThreeEvent<MouseEvent>) => {
    e.stopPropagation()

    const directionVector = new THREE.Vector3().copy(e.unprojectedPoint).sub(e.point).normalize()
    setRaycasterEvent({ normal: e.normal!, position: e.point.addScaledVector(directionVector, 0.2) })
  }

  const handleClick = (e: ThreeEvent<MouseEvent>) => {
    e.stopPropagation()

    const canPlaceNewDevice = e.object.userData.type === LAYERS.WALL && isPlacementToolActive

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
        name: LAYERS.DEVICE,
        position: e.point,
        parentWorldMatrix: worldMatrix,
      })
      setIsPlacementToolActive(false)
      // storeSet({ isPlacementToolActive: false })
    }
  }

  return (
    <>
      <group ref={pointerRef} visible={isPlacementToolActive}>
        <mesh scale={1}>
          <planeGeometry args={[1, 1]} />
          <meshStandardMaterial
            color={canPlaceDevice ? COLORS.ACTIVE : COLORS.ERROR}
            map={markerTexture}
            transparent
            opacity={0.8}
            side={THREE.DoubleSide}
            toneMapped={false}
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

      {render &&
        render({
          onPointerOver: handlePointerOver,
          onPointerMove: handlePointerMove,
          onClick: handleClick,
        })}
    </>
  )
}
