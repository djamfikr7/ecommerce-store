'use client'

import { useRef } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { Text, RoundedBox } from '@react-three/drei'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import * as THREE from 'three'

interface Product3DButtonProps {
  children: React.ReactNode
  href?: string
  size?: 'md' | 'lg'
}

function Button3D({ children, size = 'md' }: { children: React.ReactNode; size: 'md' | 'lg' }) {
  const meshRef = useRef<THREE.Mesh>(null)
  const [hovered, setHovered] = React.useState(false)
  const [pressed, setPressed] = React.useState(false)

  const scale = size === 'lg' ? 1.2 : 1
  const depth = size === 'lg' ? 0.5 : 0.4

  useFrame(() => {
    if (meshRef.current) {
      // Subtle floating animation
      meshRef.current.position.y = Math.sin(Date.now() * 0.001) * 0.05
    }
  })

  return (
    <group>
      {/* Button base with depth */}
      <RoundedBox
        ref={meshRef}
        args={[2.5 * scale, 0.6 * scale, depth * scale]}
        radius={0.1}
        smoothness={4}
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
        onPointerDown={() => setPressed(true)}
        onPointerUp={() => setPressed(false)}
      >
        <meshStandardMaterial
          color={hovered ? '#818cf8' : '#6366f1'}
          metalness={0.3}
          roughness={0.4}
          emissive={hovered ? '#6366f1' : '#000000'}
          emissiveIntensity={hovered ? 0.3 : 0}
        />
      </RoundedBox>

      {/* Shadow */}
      <RoundedBox
        args={[2.5 * scale, 0.3 * scale, depth * scale]}
        position={[0, -0.4, -0.1]}
        radius={0.1}
      >
        <meshStandardMaterial
          color="#000000"
          transparent
          opacity={0.4}
        />
      </RoundedBox>

      {/* Text */}
      <Text
        position={[0, 0, depth * scale / 2 + 0.01]}
        fontSize={0.15 * scale}
        color="#ffffff"
        anchorX="center"
        anchorY="middle"
        font="/fonts/inter.woff"
      >
        {typeof children === 'string' ? children : 'Shop Now'}
      </Text>
    </group>
  )
}

export function Product3DButton({ children, href, size = 'md' }: Product3DButtonProps) {
  if (href) {
    return (
      <a href={href}>
        <div className="cursor-pointer">
          <Canvas
            camera={{ position: [0, 0, 4], fov: 50 }}
            style={{ width: 200, height: 80 }}
          >
            <ambientLight intensity={0.5} />
            <directionalLight position={[5, 5, 5]} intensity={1} />
            <Button3D size={size}>{children}</Button3D>
          </Canvas>
        </div>
      </a>
    )
  }

  return (
    <motion.div
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
    >
      <Canvas
        camera={{ position: [0, 0, 4], fov: 50 }}
        style={{ width: 200, height: 80 }}
      >
        <ambientLight intensity={0.5} />
        <directionalLight position={[5, 5, 5]} intensity={1} />
        <Button3D size={size}>{children}</Button3D>
      </Canvas>
    </motion.div>
  )
}

// Need to import React for useState in the component
import React from 'react'
