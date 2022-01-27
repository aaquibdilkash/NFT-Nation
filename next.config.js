const withPWA = require("next-pwa");

module.exports = withPWA({
  images: {
    domains: [
      "ipfs.io",
      "gateway.pinata.cloud",
      "cf-ipfs.com",
      "ipfs.infura.io",
      "gateway.ipfs.io",
    ],
  },
  env: {
    DB_URI: process.env.DB_URI,
    PROJECT_ID: process.env.PROJECT_ID,
    PRIVATE_KEY: process.env.PRIVATE_KEY,
    INFURA_PROJECT_ID: process.env.INFURA_PROJECT_ID,
    INFURA_PROJECT_SECRET: process.env.INFURA_PROJECT_SECRET,
    PINATA_API_KEY: process.env.PINATA_API_KEY,
    PINATA_SECRET_KEY: process.env.PINATA_SECRET_KEY,
    PINATA_JWT: process.env.PINATA_JWT,
    REDIS_URL: process.env.REDIS_URL,
  },
  pwa: {
    dest: "public",
    register: true,
    skipWaiting: true,
    disable: process.env.NODE_ENV !== "production",
  },
});
