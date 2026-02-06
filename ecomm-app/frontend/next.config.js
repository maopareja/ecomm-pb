/** @type {import('next').NextConfig} */
const nextConfig = {
    // Base path detection is now dynamic (see app/utils/basePath.ts)
    // No hardcoded basePath or assetPrefix needed

    async rewrites() {
        return [
            {
                source: '/api/:path*',
                destination: 'http://backend:8000/:path*', // Proxy to Backend container
            },
        ]
    },
}

module.exports = nextConfig
