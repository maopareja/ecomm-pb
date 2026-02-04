/** @type {import('next').NextConfig} */
const nextConfig = {
    // basePath temporal para despliegue en subpath
    // Para eliminar: quitar esta línea y la variable NEXT_PUBLIC_BASE_PATH del docker-compose.yml
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
