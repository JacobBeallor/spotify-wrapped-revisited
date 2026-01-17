/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    unoptimized: true
  },
  webpack: (config, { isServer }) => {
    if (isServer) {
      // Exclude duckdb from bundling - it's a native module
      config.externals.push({
        'duckdb-async': 'commonjs duckdb-async',
        'duckdb': 'commonjs duckdb'
      })
    }
    return config
  }
}

module.exports = nextConfig

