/** @type {import('next').NextConfig} */
const nextConfig = {
    eslint: {
        ignoreDuringBuilds: true,
    },
    typescript: {
        ignoreBuildErrors: true,
    },
    images: {
        domains: ['m.media-amazon.com', 'res.cloudinary.com'],
    },
}

module.exports = nextConfig
