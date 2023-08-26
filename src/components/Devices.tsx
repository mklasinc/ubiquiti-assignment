import { Suspense, useEffect, useRef, useState } from 'react'
import { useCursor, useTexture, Html } from '@react-three/drei'
import * as THREE from 'three'
import { useStore } from '@/store'
import { Device } from '@/components/Device'
import type { DeviceData } from '@/store'
import { DEVICE_SCALE, COLORS } from '@/constants'
import { useGesture } from '@use-gesture/react'
import { ThreeEvent, useThree } from '@react-three/fiber'
import { DeviceItem } from './UI'
import { noop } from '@/utils/noop'
import cx from 'clsx'

export function DeviceInstance({ data }: { data: DeviceData }) {
  const ref = useRef<THREE.Group>(null)

  const getThree = useThree((state) => state.get)
  const activeDevice = useStore((state) => state.activeDevice)
  const removeDevice = useStore((state) => state.removeDevice)
  const updateDevice = useStore((state) => state.updateDevice)
  const setActiveDevice = useStore((state) => state.setActiveDevice)
  const isPlacementToolActive = useStore((state) => state.isPlacementToolActive)
  const setIsDraggingToolActive = useStore((state) => state.setIsDraggingToolActive)

  const isActive = activeDevice?.id === data.id
  const isInteractable = !isPlacementToolActive

  const [hovered, setHovered] = useState(false)
  useCursor(hovered && isInteractable)

  useEffect(() => {
    if (!ref.current) return

    ref.current.position.copy(data.position)
    ref.current.quaternion.setFromRotationMatrix(data.parentWorldMatrix)
    ref.current.scale.setScalar(DEVICE_SCALE)
  }, [data])

  const bind = useGesture({
    onDragStart: ({ event }) => {
      event.stopPropagation()
      setIsDraggingToolActive(true)
    },
    onDragEnd: ({ event }) => {
      event.stopPropagation()
      setIsDraggingToolActive(false)

      if (!ref.current) return
      updateDevice(data.id, { position: ref.current.getWorldPosition(new THREE.Vector3()) })
    },
    onDrag: ({ event, movement: [x, y] }) => {
      event?.stopPropagation()
      const currentViewport = getThree().viewport.getCurrentViewport(
        undefined,
        new THREE.Vector3(0, 0, data.position.z)
      )
      const aspect = getThree().size.width / currentViewport.width
      // TODO: Fix DOM/3D offset sync
      ref.current!.position.x = data.position.x + (x / aspect) * 0.3
      ref.current!.position.y = data.position.y - (y / aspect) * 0.3
    },
  })

  const glowTexture = useTexture('/glow.png')
  const color = new THREE.Color(COLORS.ACTIVE).multiplyScalar(30)

  const handlePointerOver = () => setHovered(true)
  const handlePointerOut = () => setHovered(false)
  const handlePointerMissed = () => {
    if (isActive) setActiveDevice(null)
  }
  const handleClick = (e: ThreeEvent<MouseEvent>) => {
    e.stopPropagation()
    setActiveDevice(data)
  }

  const pointerEvents = isInteractable
    ? {
        ...(bind() as any),
        onPointerOver: handlePointerOver,
        onPointerOut: handlePointerOut,
        onPointerMissed: handlePointerMissed,
        onClick: handleClick,
      }
    : {}

  return (
    <group ref={ref} name={data.id} {...pointerEvents}>
      <Html position-y={25} center>
        <DeviceItem
          data={data}
          isActive={false}
          onClick={noop}
          onRemove={(e) => {
            e.stopPropagation()
            removeDevice(data.id)
          }}
          className={cx(
            'max-w-[250px] bg-white transition-opacity opacity-0 pointer-events-none',
            isActive && 'opacity-100 pointer-events-auto'
          )}
          style={{
            boxShadow: '0px 4px 30px 0px rgba(170, 166, 166, 0.25)',
          }}
        />
      </Html>
      <Device />
      <mesh position-z={0.1} scale={60}>
        <planeGeometry args={[1, 1]} />
        <meshStandardMaterial transparent map={glowTexture} toneMapped={false} color={color} depthWrite={false} />
      </mesh>
    </group>
  )
}

export function Devices({ data }: { data: DeviceData[] }) {
  return (
    <Suspense fallback={null}>
      <group position={[0, 0, 0]}>
        {data.map((device) => (
          <DeviceInstance key={device.id} data={device} />
        ))}
      </group>
    </Suspense>
  )
}
