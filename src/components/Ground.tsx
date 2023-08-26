export function Ground(props: JSX.IntrinsicElements['mesh']) {
  return (
    <>
      <gridHelper args={[200, 200, '#C5D6DB', '#C5D6DB']} position={[0, 0.01, 0]} />
      <mesh name="Floor" rotation-x={-Math.PI * 0.5} {...props}>
        <planeGeometry args={[200, 200]} />
        <meshStandardMaterial color={'#d3e6f0'} />
      </mesh>
    </>
  )
}
