const withPWA = require("next-pwa");

module.exports = withPWA({
  images: {
    domains: [
      "ipfs.infura.io",
      "source.unsplash.com",
    ],
  },
  env: {
    DB_URI: process.env.DB_URI,
    PROJECT_ID: process.env.PROJECT_ID,
    PRIVATE_KEY: process.env.PRIVATE_KEY,
  },
  pwa: {
    dest: "public",
    register: true,
    skipWaiting: true,
    disable: process.env.NODE_ENV !== "production",
  },
});
