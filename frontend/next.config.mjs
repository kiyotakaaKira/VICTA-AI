/** @type {import('next').NextConfig} */
const devOrigins = [
  'localhost:3000',
  'localhost:3001',
  'localhost:3002',
  '127.0.0.1:3000',
  '127.0.0.1:3001',
  '127.0.0.1:3002',
];

function hostOnly(urlOrHost) {
  if (!urlOrHost) return null;
  const s = String(urlOrHost).trim().replace(/\/$/, '');
  return s.replace(/^https?:\/\//i, '');
}

const vercelHost = hostOnly(process.env.VERCEL_URL);
const customActionHost = hostOnly(process.env.NEXT_PUBLIC_SERVER_ACTIONS_ORIGIN);

const serverActionOrigins = [...devOrigins];
if (vercelHost) serverActionOrigins.push(vercelHost);
if (customActionHost && !serverActionOrigins.includes(customActionHost)) {
  serverActionOrigins.push(customActionHost);
}

const nextConfig = {
  reactStrictMode: true,

  images: {
    domains: [
      'img.clerk.com',
      'images.clerk.dev',
      'firebasestorage.googleapis.com',
    ],
  },

  experimental: {
    serverActions: {
      allowedOrigins: serverActionOrigins,
    },
  },
};

export default nextConfig;