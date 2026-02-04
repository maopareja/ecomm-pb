/** @type {import('next').NextConfig} */
const nextConfig = {
    // TEMPORAL: Hardcodeado para diagnóstico
    basePath: '/prjzdev1092',
    assetPrefix: '/prjzdev1092',

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
