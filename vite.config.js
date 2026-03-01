/** @type {import("vite").UserConfig} */
module.exports = {
  server: {
    port: 3000,
    proxy: {
      "/create-payment-link": "http://localhost:3030",
    },
  },
};
