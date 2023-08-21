import { Suspense, useEffect, useState } from 'react'
import { Canvas, useLoader } from '@react-three/fiber'
import { PerspectiveCamera, Bounds, useGLTF, OrbitControls, Environment } from '@react-three/drei'
import { USDZLoader } from 'three/examples/jsm/loaders/USDZLoader.js'
import * as THREE from 'three'
import { useStore } from './store'

function FloorPlan() {
  let model = useGLTF('floorplan.glb')

  const get = useStore((state) => state.get)
  const set = useStore((state) => state.set)

  useEffect(() => {
    if (!model) return

    const meshesToRemove: THREE.Object3D[] = []

    model.scene.traverse((child) => {
      if (child.name.includes('Ceiling')) meshesToRemove.push(child)
      if (child instanceof THREE.Mesh) {
        child.material.envMapIntensity = 0.7
        child.material.needsUpdate = true
      }

      if (child.name.toLowerCase().includes('wall')) {
        child.layers.set(2)
      }
    })

    for (let i = 0; i < meshesToRemove.length; i++) {
      let obj = meshesToRemove[i]

      obj.parent?.remove(obj)
    }
  }, [model])

  return (
    <primitive
      object={model.scene}
      onPointerOver={(e: any) => {
        e.stopPropagation()
        console.log(e)
        set({ hovered: e.object, hoveredPosition: e.point })
        // e.object.material.color.set('red')
      }}
      onPointerMove={(e: any) => {
        set({ hoveredPosition: e.point })
      }}
      onPointerOut={(e: any) => {
        // console.log('ON POINTER OUT', e)
        // e.object.color.set('white')
        e.stopPropagation()
        // if (e.object.name.includes('Wall')) return
        set({ hovered: null })
      }}
    />
  )
}

function Tracker() {
  const hovered = useStore((state) => state.hovered)
  const hoveredPosition = useStore((state) => state.hoveredPosition)

  if (!hoveredPosition) return null

  return (
    <mesh position={hoveredPosition}>
      <boxGeometry args={[0.3, 0.3, 0.3]} />
      <meshStandardMaterial color={hovered ? 'hotpink' : 'gray'} transparent />
    </mesh>
  )
}

function App() {
  const hovered = useStore((state) => state.hovered)

  return (
    <>
      <Canvas
        camera={{ position: [5, 15, 40], zoom: 2 }}
        onCreated={({ camera, raycaster }) => {
          camera.layers.enableAll()
          raycaster.layers.set(2)
        }}
      >
        {/* <PerspectiveCamera position={} /> */}
        <ambientLight intensity={0.3} color={'blue'} />
        <fog attach="fog" args={['#E2EDF3', 50, 100]} />
        <color attach="background" args={['#E2EDF3']} />

        <Tracker />

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
        <gridHelper args={[200, 200, '#C5D6DB', '#C5D6DB']} position={[0, 0, 0]} />

        <Suspense fallback={null}>
          <Bounds fit clip observe margin={1.1}>
            <FloorPlan />
          </Bounds>
        </Suspense>
      </Canvas>
      <div
        className="text-3xl font-bold underline"
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
        }}
      >
        {hovered ? hovered?.name : 'Nothing hovered'}
      </div>
    </>
  )
}

export default App
