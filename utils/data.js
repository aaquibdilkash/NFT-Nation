export const categories = [
  {
    name: "Art",
    image:
      "https://i.pinimg.com/750x/eb/47/44/eb4744eaa3b3ccd89749fa3470e2b0de.jpg",
  },
  {
    name: "Music and media",
    image:
      "https://i.pinimg.com/236x/03/48/b6/0348b65919fcbe1e4f559dc4feb0ee13.jpg",
  },
  {
    name: "Gaming",
    image:
      "https://i.pinimg.com/750x/66/b1/29/66b1296d36598122e6a4c5452b5a7149.jpg",
  },
  {
    name: "Collectible",
    image:
      "https://i.pinimg.com/236x/72/8c/b4/728cb43f48ca762a75da645c121e5c57.jpg",
  },
  {
    name: "Utility Based",
    image:
      "https://i.pinimg.com/236x/7d/ef/15/7def15ac734837346dac01fad598fc87.jpg",
  },
  {
    name: "Virtual Worlds",
    image:
      "https://i.pinimg.com/236x/b9/82/d4/b982d49a1edd984c4faef745fd1f8479.jpg",
  },
  {
    name: "Web3 Domain Names",
    image:
      "https://i.pinimg.com/736x/f4/e5/ba/f4e5ba22311039662dd253be33bf5f0e.jpg",
  },
];

export const chainData = {
  main: {
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
    networkId: 80001,
    explorers: [
      {
        name: "polygonscan",
        url: "https://mumbai.polygonscan.com/",
        standard: "EIP3091",
      },
    ],
  },
};

export const toHex = (num) => {
  return "0x" + num.toString(16);
};

export const getUserName = (string) => {
  return string?.length !== 42
    ? `@${string}`
    : `@${string?.slice(0, 7)}...${string?.slice(-8, -1)}`;
};

export const etherAddress = "0x0000000000000000000000000000000000000000";


const addToNetwork = async () => {
  let chain = chainData.test
  if (window.ethereum && window.ethereum.isMetaMask) {
    window.web3 = new Web3(ethereum);
    console.log("MetaMask Here!");
    const params = {
      chainId: toHex(chain.chainId), // A 0x-prefixed hexadecimal string
      chainName: chain.name,
      nativeCurrency: {
        name: chain.nativeCurrency.name,
        symbol: chain.nativeCurrency.symbol, // 2-6 characters long
        decimals: chain.nativeCurrency.decimals,
      },
      rpcUrls: chain.rpc,
      blockExplorerUrls: [
        chain.explorers &&
        chain.explorers.length > 0 &&
        chain.explorers[0].url
          ? chain.explorers[0].url
          : chain.infoURL,
      ],
    };

    window.web3.eth.getAccounts((error, accounts) => {
      window.ethereum
        .request({
          method: "wallet_addEthereumChain",
          params: [params, accounts[0]],
        })
        .then((result) => {
          
          axios
            .post("/api/users", {
              address: accounts[0],
              userName: accounts[0],
              image:
                "https://aaquibdilkashdev.web.app/images/AaquibDilkash.jpeg",
            })
            .then((res) => {
              console.log(res, "dfjdkfjdkfjkdjfdf")
              localStorage.setItem("user", JSON.stringify(res.data.user));
              dispatch({
                type: USER_GET_SUCCESS,
                payload: res.data.user,
              });
              router.push("/");
            }).catch((e) => {
              console.log(e)
            })
        })
        .catch((error) => {
          console.log(error);
        });
    });
  } else {
    alert("Please install MetaMask browser extension to interact");
  }
};
