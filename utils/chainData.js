export const chainData = {
  localhost: {
    name: "Localhost",
    chain: "ETH",
    network: "localhost",
    rpc: ["http://localhost:8545"],
    faucets: [],
    nativeCurrency: {
      name: "ETH",
      symbol: "ETH",
      decimals: 18,
    },
    // infoURL: "https://polygon.technology/",
    shortName: "localhost",
    chainId: 1337,
    hexChainId: "0x539",
    networkId: 1337,
    // explorers: [
    //   {
    //     name: "polygonscan",
    //     url: "https://polygonscan.com/",
    //     standard: "EIP3091",
    //   },
    // ],
  },
  maticmain: {
    name: "Polygon Mainnet",
    chain: "Polygon",
    network: "mainnet",
    rpc: [
      "https://polygon-rpc.com/",
      "https://rpc-mainnet.matic.network",
      "https://matic-mainnet.chainstacklabs.com",
      "https://rpc-mainnet.maticvigil.com",
      "https://rpc-mainnet.matic.quiknode.pro",
      "https://matic-mainnet-full-rpc.bwarelabs.com",
    ],
    faucets: [],
    nativeCurrency: {
      name: "MATIC",
      symbol: "MATIC",
      decimals: 18,
    },
    infoURL: "https://polygon.technology/",
    shortName: "MATIC",
    chainId: 137,
    hexChainId: "0x89",
    networkId: 137,
    slip44: 966,
    explorers: [
      {
        name: "polygonscan",
        url: "https://polygonscan.com/",
        standard: "EIP3091",
      },
    ],
  },

  test: {
    name: "Polygon Testnet Mumbai",
    chain: "Polygon",
    network: "testnet",
    rpc: [
      "https://matic-mumbai.chainstacklabs.com",
      "https://rpc-mumbai.maticvigil.com",
      "https://matic-testnet-archive-rpc.bwarelabs.com",
    ],
    faucets: ["https://faucet.polygon.technology/"],
    nativeCurrency: {
      name: "MATIC",
      symbol: "MATIC",
      decimals: 18,
    },
    infoURL: "https://polygon.technology/",
    shortName: "maticmum",
    chainId: 80001,
    hexChainId: "0x13881",
    networkId: 80001,
    explorers: [
      {
        name: "polygonscan",
        url: "https://mumbai.polygonscan.com/",
        standard: "EIP3091",
      },
    ],
  },
  ethmain: {
    name: "Ethereum Mainnet",
    chain: "ETH",
    icon: "ethereum",
    rpc: [
      "https://mainnet.infura.io/v3/${INFURA_API_KEY}",
      "wss://mainnet.infura.io/ws/v3/${INFURA_API_KEY}",
      "https://api.mycryptoapi.com/eth",
      "https://cloudflare-eth.com",
    ],
    faucets: [],
    nativeCurrency: { name: "Ether", symbol: "ETH", decimals: 18 },
    infoURL: "https://ethereum.org",
    shortName: "eth",
    chainId: 1,
    networkId: 1,
    slip44: 60,
    ens: { registry: "0x00000000000C2E074eC69A0dFb2997BA6C7d2e1e" },
    explorers: [
      { name: "etherscan", url: "https://etherscan.io", standard: "EIP3091" },
    ],
  },
  ropsten: {
    name: "Ethereum Testnet Ropsten",
    chain: "ETH",
    rpc: [
      `https://eth-ropsten.alchemyapi.io/v2/${process.env.PROJECT_ID}`,
      `wss://eth-ropsten.alchemyapi.io/v2/${process.env.PROJECT_ID}`,
    ],
    faucets: ["https://faucet.ropsten.be?${ADDRESS}"],
    nativeCurrency: { name: "Ropsten Ether", symbol: "ROP", decimals: 18 },
    infoURL: "https://github.com/ethereum/ropsten",
    shortName: "rop",
    chainId: 3,
    hexChainId: "0x3",
    networkId: 3,
    ens: { registry: "0x112234455c3a32fd11230c42e7bccd4a84e02010" },
  },
  rinkeby: {
    name: "Rinkeby",
    title: "Ethereum Testnet Rinkeby",
    chain: "ETH",
    rpc: [
      "https://rinkeby.infura.io/v3/${INFURA_API_KEY}",
      "wss://rinkeby.infura.io/ws/v3/${INFURA_API_KEY}",
    ],
    faucets: ["https://faucet.rinkeby.io"],
    nativeCurrency: { name: "Rinkeby Ether", symbol: "RIN", decimals: 18 },
    infoURL: "https://www.rinkeby.io",
    shortName: "rin",
    chainId: 4,
    networkId: 4,
    ens: { registry: "0xe7410170f87102df0055eb195163a03b7f2bff4a" },
    explorers: [
      {
        name: "etherscan-rinkeby",
        url: "https://rinkeby.etherscan.io",
        standard: "EIP3091",
      },
    ],
  },
  kovan: {
    name: "Kovan",
    title: "Ethereum Testnet Kovan",
    chain: "ETH",
    rpc: [
      `https://eth-kovan.alchemyapi.io/v2/${process.env.PROJECT_ID}`,
      `wss://eth-kovan.alchemyapi.io/v2/${process.env.PROJECT_ID}`,
      "https://kovan.poa.network",
      "http://kovan.poa.network:8545",
      "ws://kovan.poa.network:8546",
    ],
    faucets: [
      "http://fauceth.komputing.org?chain=42&address=${ADDRESS}",
      "https://faucet.kovan.network",
      "https://gitter.im/kovan-testnet/faucet",
    ],
    nativeCurrency: { name: "Kovan Ether", symbol: "KOV", decimals: 18 },
    explorers: [
      {
        name: "etherscan",
        url: "https://kovan.etherscan.io",
        standard: "EIP3091",
      },
    ],
    infoURL: "https://kovan-testnet.github.io/website",
    shortName: "kov",
    chainId: 42,
    hexChainId: "0x42",
    networkId: 42,
  },
  gorli: {
    name: "G??rli",
    title: "Ethereum Testnet G??rli",
    chain: "ETH",
    rpc: [
      "https://goerli.infura.io/v3/${INFURA_API_KEY}",
      "wss://goerli.infura.io/v3/${INFURA_API_KEY}",
      "https://rpc.goerli.mudit.blog/",
    ],
    faucets: [
      "https://goerli-faucet.slock.it/?address=${ADDRESS}",
      "https://faucet.goerli.mudit.blog",
    ],
    nativeCurrency: { name: "G??rli Ether", symbol: "GOR", decimals: 18 },
    infoURL: "https://goerli.net/#about",
    shortName: "gor",
    chainId: 5,
    networkId: 5,
    ens: { registry: "0x112234455c3a32fd11230c42e7bccd4a84e02010" },
    explorers: [
      {
        name: "etherscan-goerli",
        url: "https://goerli.etherscan.io",
        standard: "EIP3091",
      },
    ],
  },
};
