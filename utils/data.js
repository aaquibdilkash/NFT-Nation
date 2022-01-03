import {  FaCat, FaGamepad, FaLaugh, FaPaintBrush, FaPaperclip, FaPencilAlt, FaQuestion, FaReadme, FaSmile } from "react-icons/fa";


export const sidebarCategories = {
  "Discover Categories": [
    {
      name: "Art",
      icon: <FaPaintBrush className="" size={25} />
    },
    {
      name: "Gaming",
      icon: <FaGamepad className="" size={25} />
    },
    {
      name: "Collectibles",
      icon: <FaCat className="" size={25} />
    },
    {
      name: "Memes",
      icon: <FaLaugh className="" size={25} />
    },
    {
      name: "Gifs",
      icon: <FaSmile className="" size={25} />
    }
  ],
  // "Help Section": [
  //   {
  //     name: "FAQs",
  //     icon: <FaQuestion className="" size={25} />
  //   },
  //   {
  //     name: "Contact Us",
  //     icon: <FaPencilAlt className="" size={25} />
  //   },
  //   {
  //     name: "About Us",
  //     icon: <FaSign className="" size={25} />
  //   },
  //   {
  //     name: "Privacy Policy",
  //     icon: <FaPaperclip className="" size={25} />
  //   },
  //   {
  //     name: "Terms and Conditions",
  //     icon: <FaReadme className="" size={25} />
  //   }
  // ]
}



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
};

export const toHex = (num) => {
  return "0x" + num.toString(16);
};

export const isValidAmount = (number) => {
  return !isNaN(parseFloat(number)) && parseFloat(number) > 0
}

export const getMaxBid = (bids) => {
  return bids?.reduce( (prev, current) => {
    if (+current.bid > +prev.bid) {
        return current;
    } else {
        return prev;
    }
});
}

export const getUserName = (string) => {
  return string?.length !== 42
    ? `@${string}`
    : `@${string?.slice(0, 5)}...${string?.slice(-5)}`;
};

export const etherAddress = "0x0000000000000000000000000000000000000000";

export const loginMessage = "This Action requires you to Log in..."


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
