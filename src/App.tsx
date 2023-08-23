import { Suspense, useEffect, useRef, useState } from 'react'
import { Canvas, useLoader, useThree } from '@react-three/fiber'
import { PerspectiveCamera, Bounds, useGLTF, OrbitControls, Environment } from '@react-three/drei'
import { USDZLoader } from 'three/examples/jsm/loaders/USDZLoader.js'
import * as THREE from 'three'
import { useStore } from './store'
import { Device } from './Device'
import { VertexNormalsHelper } from 'three/addons/helpers/VertexNormalsHelper.js'

function FloorPlan() {
  let model = useGLTF('floorplan.glb')

  const scene = useThree((state) => state.scene)

  const get = useStore((state) => state.get)
  const set = useStore((state) => state.set)

  useEffect(() => {
    if (!model) return

    const meshesToRemove: THREE.Object3D[] = []

    model.scene.traverse((child) => {
      if (child.name.includes('Ceiling')) meshesToRemove.push(child)
      if (child instanceof THREE.Mesh) {
        child.material.envMapIntensity = 0.6
        child.material.needsUpdate = true
      }

      if (child.name.toLowerCase().includes('wall') && child instanceof THREE.Mesh) {
        // child.material = new THREE.MeshStandardMaterial({
        //   color: Math.random() * 0xffffff,
        // })
      }

      // if (child instanceof THREE.Mesh) {
      //   const vertexNormalsHelper = new VertexNormalsHelper(child, 0.1, 0x00ff00)
      //   scene.add(vertexNormalsHelper)
      // }
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
        console.log('on pointer over', e)
        console.log('unprojected point', e.unprojectedPoint)
        const directionVector = new THREE.Vector3().copy(e.unprojectedPoint).sub(e.point).normalize()

        set({
          hovered: e.object,
          hoveredNormal: e.face.normal,
          hoveredPosition: e.point,
        })
        // e.object.material.color.set('red')
      }}
      onPointerMove={(e: any) => {
        e.stopPropagation()
        const directionVector = new THREE.Vector3().copy(e.unprojectedPoint).sub(e.point).normalize()

        set({ hoveredPosition: e.point.addScaledVector(directionVector, 0.2), hoveredNormal: e.normal })
      }}
    />
  )
}

function Floor() {
  const set = useStore((state) => state.set)

  return (
    <mesh
      name="Floor"
      rotation-x={-Math.PI * 0.5}
      onPointerOver={(e: any) => {
        e.stopPropagation()
        console.log('on pointer over', e)
        set({ hovered: e.object, hoveredNormal: e.normal, hoveredPosition: e.point.addScaledVector(e.normal, 0.1) })
      }}
      onPointerMove={(e: any) => {
        e.stopPropagation()
        set({ hoveredPosition: e.point.addScaledVector(e.normal, 0.1), hoveredNormal: e.normal })
      }}
    >
      <planeGeometry args={[200, 200]} />
      <meshStandardMaterial color={'#d3e6f0'} />
    </mesh>
  )
}

function Tracker() {
  const trackerRef = useRef<any>()
  const deviceRef = useRef<any>()

  useEffect(() => {
    const unsub1 = useStore.subscribe(
      (state) => [state.hovered, state.hoveredNormal],
      ([hovered]) => {
        const hoveredObject = hovered as THREE.Object3D
        // Create a Quaternion representing the rotation
        const worldQuaternion = hoveredObject.getWorldQuaternion(new THREE.Quaternion())

        // Apply the rotation to the object
        trackerRef.current.setRotationFromQuaternion(worldQuaternion)

        // Rotate the tracker to be flat on the floor
        if (hoveredObject.name.includes('Floor')) {
          trackerRef.current.setRotationFromAxisAngle(new THREE.Vector3(1, 0, 0), -Math.PI * 0.5)
        }
      }
    )

    const unsub2 = useStore.subscribe(
      (state) => [state.hoveredPosition, state.hoveredNormal],
      ([position, normal]) => {
        if (!trackerRef.current) return
        trackerRef.current.position.copy(position).addScaledVector(normal, 0.1)
        trackerRef.current.position.y += 0.01
      }
    )

    return () => {
      unsub1()
      unsub2()
    }
    // if (hovered?.name.includes('Wall')) {
    //   deviceRef.current?.material.color.set('red')
    // } else {
    //   deviceRef.current?.material.color.set('white')
    // }
  }, [])

  // if (!hoveredPosition) return null

  return (
    <group ref={trackerRef}>
      <mesh>
        <planeGeometry args={[1, 1]} />
        <meshStandardMaterial color={'red'} transparent opacity={0.4} side={THREE.DoubleSide} />
      </mesh>
      <Device ref={deviceRef} scale={0.02} />
    </group>
  )

  // return (
  //   <mesh position={hoveredPosition}>
  //     <boxGeometry args={[0.3, 0.3, 0.3]} />
  //     <meshStandardMaterial color={hovered ? 'hotpink' : 'gray'} transparent />
  //   </mesh>
  // )
}

function App() {
  const hovered = useStore((state) => state.hovered)

  return (
    <>
      <Canvas
        camera={{ position: [0, 15, 40], zoom: 2 }}
        onCreated={({ camera, raycaster }) => {
          camera.layers.enableAll()
          // raycaster.layers.set(2)
        }}
      >
        {/* <PerspectiveCamera position={} /> */}
        <ambientLight intensity={0.4} color={'blue'} />
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
        <gridHelper args={[200, 200, '#C5D6DB', '#C5D6DB']} position={[0, 0.01, 0]} />

        <Floor />

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
