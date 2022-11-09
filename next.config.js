/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  output: 'standalone',
  serverRuntimeConfig: {
    // Default: false. Use levelDb
    useMemoryDb: process.env.PASTEBURN_USE_MEMORY_DB == 'true',
  },
  publicRuntimeConfig: {
    // Default: 10 MiB. Cannot be larger than 100MB. Even 50MB may not work
    fileSizeLimitInMB: Number(process.env.PASTEBURN_FILE_SIZE_LIMIT_IN_MB) || 10,
    // Default: 3 Day
    maxTimeToLiveInSecs: Number(process.env.PASTEBURN_MAX_TTL_IN_SECS) || 259200,
  }
}

module.exports = nextConfig
