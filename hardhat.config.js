require("@nomiclabs/hardhat-waffle");
const fs = require("fs")
const PRIVATE_KEY = fs.readFileSync(".secret").toString()

const PROJECT_ID = "QvRZXVDKe49e5RDw_JCP2FCbohroBUS7"

module.exports = {
  networks: {
    hardhat: {
      chainId: 1337,
      allowUnlimitedContractSize: true,
    },
    mumbai: {
      url: `https://polygon-mumbai.g.alchemy.com/v2/${PROJECT_ID}`,
      accounts: [PRIVATE_KEY]
    },
    mainnet: {
      url: `https://polygon-mainnet.g.alchemy.com/v2/${PROJECT_ID}`,
      accounts: [PRIVATE_KEY]
    },
    ropsten: {
      url: `https://eth-ropsten.alchemyapi.io/v2/${PROJECT_ID}`,
      accounts: [PRIVATE_KEY]
    }
    
  },
  // solidity: "0.8.4",
  solidity: {
    version: "0.8.4",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200
      }
    }
  },
};
