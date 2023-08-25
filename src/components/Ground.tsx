import { useStore } from '../store'

export function Ground() {
  const storeSet = useStore((state) => state.set)

  return (
    <>
      <gridHelper args={[200, 200, '#C5D6DB', '#C5D6DB']} position={[0, 0.01, 0]} />
      <mesh
        name="Floor"
        rotation-x={-Math.PI * 0.5}
        onPointerOver={(e: any) => {
          e.stopPropagation()
          console.log('on pointer over', e)
          storeSet({
            hovered: e.object,
            hoveredNormal: e.normal,
            hoveredPosition: e.point.addScaledVector(e.normal, 0.1),
          })
        }}
        onPointerMove={(e: any) => {
          e.stopPropagation()
          storeSet({ hoveredPosition: e.point.addScaledVector(e.normal, 0.1), hoveredNormal: e.normal })
        }}
      >
        <planeGeometry args={[200, 200]} />
        <meshStandardMaterial color={'#d3e6f0'} />
      </mesh>
    </>
  )
}
