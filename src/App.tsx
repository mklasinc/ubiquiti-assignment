import { Suspense, useRef } from 'react'
import { Canvas } from '@react-three/fiber'
import { Bounds, OrbitControls, Environment } from '@react-three/drei'
import { useStore } from './store'
import { FloorPlan } from './components/Floorplan'
import { Ground } from './components/Ground'
import { PlacementTool } from './components/PlacementTool'
import { UI } from './components/UI'
import { Devices } from './components/Devices'

function App() {
  const wrapperRef = useRef<any>()
  const devices = useStore((state) => state.devices)
  const isDraggingToolActive = useStore((state) => state.isDraggingToolActive)

  return (
    <div ref={wrapperRef} className="wrapper">
      <Canvas
        className="pointer-events-none"
        eventSource={wrapperRef}
        eventPrefix="client"
        camera={{ position: [0, 15, 40], zoom: 2 }}
      >
        <ambientLight intensity={0.4} color={'blue'} />
        <fog attach="fog" args={['#E2EDF3', 50, 100]} />
        <color attach="background" args={['#E2EDF3']} />
        <Environment preset="city" />

        <PlacementTool />

        <Devices data={devices} />

        <OrbitControls
          makeDefault
          enabled={!isDraggingToolActive}
          autoRotate={false}
          zoomSpeed={0.25}
          minZoom={40}
          maxZoom={140}
          enablePan={false}
          dampingFactor={0.05}
          minPolarAngle={Math.PI / 3}
          maxPolarAngle={Math.PI / 3}
        />

        <Ground />

        <Suspense fallback={null}>
          <Bounds fit clip observe margin={1.1}>
            <FloorPlan />
          </Bounds>
        </Suspense>
      </Canvas>

      <UI />
    </div>
  )
}

export default App
