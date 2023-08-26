import { useEffect, useRef } from 'react'
import * as THREE from 'three'

export const Test = () => {
  const ref = useRef<any>(null)

  useEffect(() => {
    if (!ref.current) return

    const worldDirection = ref.current.getWorldDirection(new THREE.Vector3())
    const worldQuaternion = ref.current.getWorldQuaternion(new THREE.Quaternion())
    const worldPosition = ref.current.getWorldPosition(new THREE.Vector3())

    console.log({
      worldDirection: worldDirection,
      worldQuaternion,
      worldPosition,
    })
  }, [])

  return (
    <mesh ref={ref} scale={1} rotation-y={THREE.MathUtils.degToRad(110)}>
      <boxGeometry args={[2, 10, 1]} />
      <meshStandardMaterial color={'red'} />
    </mesh>
  )
}
