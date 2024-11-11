/** @type {import('next').NextConfig} */
const nextConfig = {
    basePath: "/qrt-unnester",
    reactStrictMode: true,
    output: 'export',
    experimental: {
        missingSuspenseWithCSRBailout: false,
    },
};

export default nextConfig;
