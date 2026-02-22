/** @type {import('next').NextConfig} */
const nextConfig = {
  // Explicit buildId generator for Node.js v24 compatibility
  generateBuildId: async () => null,
}

module.exports = nextConfig
