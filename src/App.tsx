import { Suspense, useEffect, useState } from 'react'
import { Canvas, useLoader } from '@react-three/fiber'
import { PerspectiveCamera, Bounds, useGLTF, OrbitControls, Environment } from '@react-three/drei'
import { USDZLoader } from 'three/examples/jsm/loaders/USDZLoader.js'
import * as THREE from 'three'

function FloorPlan() {
  let model = useGLTF('floorplan.glb')

  useEffect(() => {
    if (!model) return
    model.scene.traverse((child) => {
      console.log(child.name)
      if (child.name.includes('Ceiling')) child.visible = false
      if (child instanceof THREE.Mesh) {
        child.material.envMapIntensity = 0.7
        child.material.needsUpdate = true
      }
      // if(instaceof THREE.Mesh) child.material = new THREE.MeshStandardMaterial({color: 'white'}
    })
  }, [model])
  return (
    <primitive object={model.scene}>
      <meshStandardMaterial color="red" />
    </primitive>
  )
}

function App() {
  return (
    <Canvas camera={{ position: [5, 15, 40], zoom: 2 }}>
      {/* <PerspectiveCamera position={} /> */}
      <ambientLight intensity={0.3} color={'blue'} />
      <color attach="background" args={['#E2EDF3']} />

      <OrbitControls
        makeDefault
        autoRotate={false}
        zoomSpeed={0.25}
        minZoom={40}
        maxZoom={140}
        enablePan={false}
        dampingFactor={0.05}
        minPolarAngle={Math.PI / 3}
        maxPolarAngle={Math.PI / 3}
      />

      <Environment preset="city" />

      {/* <mesh>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial color="hotpink" />
      </mesh> */}

      <Suspense fallback={null}>
        <Bounds fit clip observe margin={1.1}>
          <FloorPlan />
        </Bounds>
      </Suspense>
    </Canvas>
  )
}

export default App
