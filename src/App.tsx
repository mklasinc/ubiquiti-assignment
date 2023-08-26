import { Suspense, useRef } from 'react'
import { Canvas } from '@react-three/fiber'
import { Environment } from '@react-three/drei'
import { useStore } from './store'
import { FloorPlan } from './components/Floorplan'
import { Ground } from './components/Ground'
import { PlacementTool } from './components/PlacementTool'
import { UI } from './components/UI'
import { Devices } from './components/Devices'
import { CAMERA_DEFAULT_POSITION, AMBIENT_LIGHT_DEFAULT_COLOR, AMBIENT_LIGHT_DEFAULT_INTENSITY } from './constants'
import { Controls } from './components/Controls'
import { LightSettings } from './components/LightSettings'

function App() {
  const wrapperRef = useRef<any>()
  const devices = useStore((state) => state.devices)

  return (
    <div ref={wrapperRef} className="wrapper">
      <Canvas
        className="pointer-events-none"
        eventSource={wrapperRef}
        eventPrefix="client"
        camera={{ position: [...(CAMERA_DEFAULT_POSITION as [number, number, number])], zoom: 2 }}
      >
        <ambientLight name="Ambient" intensity={AMBIENT_LIGHT_DEFAULT_INTENSITY} color={AMBIENT_LIGHT_DEFAULT_COLOR} />
        <fog attach="fog" args={['#E2EDF3', 60, 100]} />
        <color attach="background" args={['#E2EDF3']} />
        <Environment preset="city" />
        <LightSettings />
        <Devices data={devices} />
        <Controls />
        <PlacementTool
          render={(props) => (
            <Suspense fallback={null}>
              <Ground {...props} />
              <FloorPlan {...props} />
            </Suspense>
          )}
        />
      </Canvas>

      <UI />
    </div>
  )
}

export default App
