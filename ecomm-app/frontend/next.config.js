/** @type {import('next').NextConfig} */
const nextConfig = {
    // basePath dinámico para despliegue en subpath (necesario para assets/estilos)
    basePath: process.env.NEXT_PUBLIC_BASE_PATH || '',
    assetPrefix: process.env.NEXT_PUBLIC_BASE_PATH || '',

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

module.exports = nextConfig
