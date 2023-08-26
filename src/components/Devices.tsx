import { useEffect, useRef, useState } from 'react'
import { useCursor, useGLTF } from '@react-three/drei'
import * as THREE from 'three'
import { useStore } from '@/store'
import { Device } from '@/components/Device'
import type { DeviceData } from '@/store'
import { DEVICE_SCALE } from '@/constants'
import { useGesture } from '@use-gesture/react'
import { useThree } from '@react-three/fiber'
import type { CameraControls } from '@react-three/drei'

export function DeviceInstance({
  data,
  interactable = false,
}: {
  data: DeviceData
  interactable?: boolean
  onClick?: () => void
}) {
  const ref = useRef<THREE.Group>(null)
  const [hovered, setHovered] = useState(false)

  const updateDevice = useStore((state) => state.updateDevice)
  const getThree = useThree((state) => state.get)
  const setActiveDevice = useStore((state) => state.setActiveDevice)
  const activeDevice = useStore((state) => state.activeDevice)
  const setIsDraggingToolActive = useStore((state) => state.setIsDraggingToolActive)

  const isActive = activeDevice?.id === data.id

  useCursor(hovered && interactable)

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
      updateDevice(data.id, {
        position: ref.current.getWorldPosition(new THREE.Vector3()),
      })
    },
    onDrag: ({ event, movement: [x, y] }) => {
      event?.stopPropagation()
      const currentViewport = getThree().viewport.getCurrentViewport(
        undefined,
        new THREE.Vector3(0, 0, data.position.z)
      )
      const aspect = getThree().size.width / currentViewport.width
      console.log('aspect x', x, x / aspect)
      ref.current!.position.x = data.position.x + (x / aspect) * 0.3
      ref.current!.position.y = data.position.y - (y / aspect) * 0.3
      // console.log('dragging', x, y, getThree().size.width, viewport.width)
    },
  })

  return (
    <group
      ref={ref}
      name={data.id}
      {...(bind() as any)}
      onPointerOver={(e) => setHovered(true)}
      onPointerOut={(e) => setHovered(false)}
      onPointerMissed={(e) => {
        console.log('missed')
        console.log(interactable)
        if (!interactable) return
        if (isActive) {
          setActiveDevice(null)
        }
      }}
      onClick={(e) => {
        e.stopPropagation()
        setActiveDevice(data)
      }}
    >
      <Device />
    </group>
  )
}

export function Devices({ data }: { data: DeviceData[] }) {
  // @ts-ignore
  const { nodes, materials } = useGLTF('/device.glb')
  const removeDevice = useStore((state) => state.removeDevice)
  const isPlacementToolActive = useStore((state) => state.isPlacementToolActive)

  return (
    // <Instances range={data.length} material={materials.base} geometry={nodes.Scene}>
    <group position={[0, 0, 0]}>
      {data.map((device, i) => (
        <DeviceInstance
          key={device.id}
          data={device}
          interactable={!isPlacementToolActive}
          onClick={() => {
            removeDevice(device.id)
          }}
        />
        // <group key={device.id} matrixWorld={device.matrix} matrixAutoUpdate={false}>
        //   {/* <Instance /> */}
        //   <Device />
        //   {/* <mesh>
        //     <boxGeometry args={[0.3, 0.3, 0.3]} />
        //   </mesh> */}
        // </group>
      ))}
    </group>
    // </Instances>
  )
}
