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
  },
  pwa: {
    dest: "public",
    register: true,
    skipWaiting: true,
    disable: process.env.NODE_ENV === "development",
  },
});
