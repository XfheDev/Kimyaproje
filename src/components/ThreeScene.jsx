import React, { useMemo } from 'react'
import { Canvas } from '@react-three/fiber'
import { OrbitControls, Stars, Text, Float } from '@react-three/drei'
import * as THREE from 'three'

const ATOM_COLORS = {
  H: '#f8fafc',
  O: '#f43f5e',
  N: '#3b82f6',
  C: '#1e293b',
  S: '#f59e0b',
  P: '#ec4899',
  Cl: '#22c55e',
  F: '#fbbf24',
}

const ATOM_SIZES = {
  H: 0.45,
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
          roughness={0.4} 
          metalness={0.2}
          emissive={ATOM_COLORS[type]}
          emissiveIntensity={0.1}
        />
      </mesh>
      <Text
        position={[0, ATOM_SIZES[type] + 0.35, 0]}
        fontSize={0.25}
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
  const vec = new THREE.Vector3().subVectors(end, start)
  const len = vec.length()
  const pos = new THREE.Vector3().addVectors(start, end).multiplyScalar(0.5)
  const width = 0.08
  
  const quaternion = new THREE.Quaternion()
  const cylinderUp = new THREE.Vector3(0, 1, 0)
  const direction = vec.clone().normalize()
  quaternion.setFromUnitVectors(cylinderUp, direction)
  
  const renderCylinder = (offset = 0) => {
    const adjustedPos = pos.clone()
    if (offset !== 0) {
      const perp = new THREE.Vector3(1, 0, 0).cross(direction)
      if (perp.length() < 0.1) perp.set(0, 0, 1).cross(direction)
      perp.normalize().multiplyScalar(offset)
      adjustedPos.add(perp)
    }
    
    return (
      <mesh position={adjustedPos} quaternion={quaternion}>
        <cylinderGeometry args={[width, width, len, 8]} />
        <meshStandardMaterial color="#475569" metalness={0.4} roughness={0.6} />
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
          {renderCylinder(0.22)}
          {renderCylinder(-0.22)}
        </>
      )}
    </group>
  )
}

export default function ThreeScene({ atoms, bonds }) {
  const scale = 0.02

  const { mappedAtoms, maxRadius } = useMemo(() => {
    if (atoms.length === 0) return { mappedAtoms: [], maxRadius: 5 }
    
    const sumX = atoms.reduce((s, a) => s + a.x, 0)
    const sumY = atoms.reduce((s, a) => s + a.y, 0)
    const center = [sumX / atoms.length, sumY / atoms.length]

    const mapped = atoms.map(a => ({
      ...a,
      pos: [(a.x - center[0]) * scale, -(a.y - center[1]) * scale, 0]
    }))

    let maxDistSq = 0
    mapped.forEach(a => {
      const distSq = a.pos[0] * a.pos[0] + a.pos[1] * a.pos[1]
      if (distSq > maxDistSq) maxDistSq = distSq
    })
    
    return { mappedAtoms: mapped, maxRadius: Math.sqrt(maxDistSq) }
  }, [atoms])

  const cameraDist = Math.max(6, maxRadius * 3 + 2)

  return (
    <div className="three-scene-wrapper">
      <Canvas shadows camera={{ position: [0, 0, cameraDist], fov: 45 }}>
        <color attach="background" args={['#020617']} />
        <ambientLight intensity={1.2} />
        <pointLight position={[10, 10, 10]} intensity={2} castShadow />
        <pointLight position={[-10, -10, -10]} color="#818cf8" intensity={1} />
        
        <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />

        <Float speed={1.8} rotationIntensity={0.4} floatIntensity={0.4}>
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

        <OrbitControls 
          enablePan={true} 
          minDistance={maxRadius + 1} 
          maxDistance={cameraDist * 3} 
          autoRotate={true}
          autoRotateSpeed={0.5}
        />
      </Canvas>
      <div className="three-hint">Gezinmek için basılı tutun | 3D Modu Aktif</div>
    </div>
  )
}


