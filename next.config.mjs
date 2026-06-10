/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  async redirects() {
    // The brief names the page "/index"; Pages Router serves it at "/".
    return [{ source: "/index", destination: "/", permanent: true }];
  },
};

export default nextConfig;
