import React, { useMemo } from 'react'
import { Canvas } from '@react-three/fiber'
import { OrbitControls, Stars, Text, Float } from '@react-three/drei'
import * as THREE from 'three'

const ATOM_COLORS = {
  H: '#f8fafc',
  O: '#ef4444',
  N: '#3b82f6',
  C: '#1e1e1e',
  S: '#facc15',
  P: '#f97316',
  Cl: '#4ade80',
  F: '#fbbf24',
}

const ATOM_SIZES = {
  H: 0.4,
  O: 0.65,
  N: 0.7,
  C: 0.75,
  S: 0.8,
  P: 0.75,
  Cl: 0.7,
  F: 0.5,
}

function Atom({ position, type }) {
  return (
    <group position={position}>
      <mesh castShadow receiveShadow>
        <sphereGeometry args={[ATOM_SIZES[type], 32, 32]} />
        <meshStandardMaterial 
          color={ATOM_COLORS[type]} 
          roughness={0.2} 
          metalness={0.1}
          emissive={ATOM_COLORS[type]}
          emissiveIntensity={0.2}
        />
      </mesh>
      <Text
        position={[0, ATOM_SIZES[type] + 0.3, 0]}
        fontSize={0.2}
        color="white"
        anchorX="center"
        anchorY="middle"
      >
        {type}
      </Text>
    </group>
  )
}

function Bond({ start, end, strength }) {
  
  const width = 0.1
  const vec = new THREE.Vector3().subVectors(end, start)
  const len = vec.length()
  const pos = new THREE.Vector3().addVectors(start, end).multiplyScalar(0.5)
  const orientation = new THREE.Matrix4()
  const up = new THREE.Vector3(0, 1, 0)
  const target = vec.clone().normalize()
  orientation.lookAt(target, new THREE.Vector3(0, 0, 0), up)
  
  const renderCylinder = (offset = 0) => {
    const adjustedPos = pos.clone()
    if (offset !== 0) {
      const side = new THREE.Vector3().crossVectors(target, up).normalize().multiplyScalar(offset)
      adjustedPos.add(side)
    }
    
    return (
      <mesh position={adjustedPos} quaternion={new THREE.Quaternion().setFromRotationMatrix(orientation)}>
        <cylinderGeometry args={[width, width, len, 16]} />
        <meshStandardMaterial color="#94a3b8" metalness={0.5} roughness={0.5} transparent opacity={0.8} />
      </mesh>
    )
  }

  return (
    <group>
      {strength === 1 && renderCylinder(0)}
      {strength === 2 && (
        <>
          {renderCylinder(0.12)}
          {renderCylinder(-0.12)}
        </>
      )}
      {strength === 3 && (
        <>
          {renderCylinder(0)}
          {renderCylinder(0.2)}
          {renderCylinder(-0.2)}
        </>
      )}
    </group>
  )
}

export default function ThreeScene({ atoms, bonds }) {
  // Map 2D coordinates (pixels) to 3D units
  // Scale down and center
  const centerOfMass = useMemo(() => {
    if (atoms.length === 0) return [0, 0, 0]
    const sumX = atoms.reduce((s, a) => s + a.x, 0)
    const sumY = atoms.reduce((s, a) => s + a.y, 0)
    return [sumX / atoms.length, sumY / atoms.length]
  }, [atoms])

  const scale = 0.02

  const mappedAtoms = atoms.map(a => ({
    ...a,
    pos: [(a.x - centerOfMass[0]) * scale, -(a.y - centerOfMass[1]) * scale, 0]
  }))

  return (
    <div className="three-scene-wrapper glass-panel">
      <Canvas shadows camera={{ position: [0, 0, 10], fov: 45 }}>
        <color attach="background" args={['#0a0a0c']} />
        <fog attach="fog" args={['#0a0a0c', 5, 20]} />
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} intensity={1.5} castShadow />
        <pointLight position={[-10, -10, -10]} color="#4f46e5" intensity={0.5} />
        
        <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />
        
        <Float speed={2} rotationIntensity={0.5} floatIntensity={0.5}>
          <group>
            {mappedAtoms.map(atom => (
              <Atom 
                key={atom.id} 
                position={atom.pos} 
                type={atom.type} 
              />
            ))}
            {bonds.map(bond => {
              const src = mappedAtoms.find(a => a.id === bond.source)
              const tgt = mappedAtoms.find(a => a.id === bond.target)
              if (!src || !tgt) return null
              return (
                <Bond 
                  key={bond.id} 
                  start={new THREE.Vector3(...src.pos)} 
                  end={new THREE.Vector3(...tgt.pos)} 
                  strength={bond.strength}
                />
              )
            })}
          </group>
        </Float>

        <OrbitControls enablePan={false} minDistance={5} maxDistance={15} />
      </Canvas>
      <div className="three-hint">Döndürmek ve yakınlaştırmak için etkileşime geçin 🌐</div>
    </div>
  )
}
