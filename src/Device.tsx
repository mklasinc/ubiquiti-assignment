import React from 'react'
import { useGLTF, Clone } from '@react-three/drei'

export const Device = React.forwardRef((props: any, ref) => {
  const { scene } = useGLTF('device.glb')

  // console.log('materials', materials)

  return <Clone ref={ref} object={scene} {...props} />
  // return <primitive object={scene} {...props} />
})
