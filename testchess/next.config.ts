import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  reactStrictMode: false,
  transpilePackages: ['three'],
  outputFileTracingRoot: '/media/fi/NewVolume8/project01/Git_Volt_agent/testchess',
  experimental: {
    optimizePackageImports: ['@react-three/fiber', '@react-three/drei'],
  },
}

export default nextConfig
