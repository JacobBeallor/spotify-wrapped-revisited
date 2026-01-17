/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    unoptimized: true
  },
  webpack: (config, { isServer }) => {
    if (isServer) {
      // Externalize DuckDB native binaries for server-side
      config.externals = config.externals || []
      config.externals.push('duckdb-async')
    }
    return config
  }
}

module.exports = nextConfig

