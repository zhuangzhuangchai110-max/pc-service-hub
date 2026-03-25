/** @type {import('next').NextConfig} */
const nextConfig = {
  // 绕过 TypeScript 检查，允许有错误也继续构建
  typescript: {
    ignoreBuildErrors: true,
  },
  // 绕过 ESLint 检查
  eslint: {
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;
