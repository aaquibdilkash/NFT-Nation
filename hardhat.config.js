require("@nomiclabs/hardhat-waffle");
const fs = require("fs")
const PRIVATE_KEY = fs.readFileSync(".secret").toString()

const PROJECT_ID = "QvRZXVDKe49e5RDw_JCP2FCbohroBUS7"

module.exports = {
  networks: {
    hardhat: {
      chainId: 1337
    },
    mumbai: {
      url: `https://polygon-mumbai.g.alchemy.com/v2/${PROJECT_ID}`,
      accounts: [PRIVATE_KEY]
    },
    mainnet: {
      url: `https://polygon-mainnet.g.alchemy.com/v2/${PROJECT_ID}`,
      accounts: [PRIVATE_KEY]
    }
  },
  solidity: "0.8.4",
};
