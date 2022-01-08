import { ethers } from "ethers";
import {
  FaBook,
  FaCat,
  FaGamepad,
  FaLaugh,
  FaPaintBrush,
  FaPaperclip,
  FaPencilAlt,
  FaQuestion,
  FaReadme,
  FaSign,
  FaSmile,
} from "react-icons/fa";

export const sidebarCategories = {
  "Discover Categories": [
    {
      name: "Art",
      link: "Art",
      icon: <FaPaintBrush className="" size={25} />,
    },
    {
      name: "Gaming",
      link: "Gaming",
      icon: <FaGamepad className="" size={25} />,
    },
    {
      name: "Collectibles",
      link: "Collectibles",
      icon: <FaCat className="" size={25} />,
    },
    {
      name: "Memes",
      link: "Memes",
      icon: <FaLaugh className="" size={25} />,
    },
    {
      name: "Gifs",
      link: "Gifs",
      icon: <FaSmile className="" size={25} />,
    },
  ],
  // "Help Section": [
  //   {
  //     name: "FAQs",
  //     link: "faqs",
  //     icon: <FaQuestion className="" size={25} />,
  //   },
  //   {
  //     name: "Blogs",
  //     link: "blogs",
  //     icon: <FaBook className="" size={25} />,
  //   },
  //   {
  //     name: "Contact Us",
  //     link: "contact_us",
  //     icon: <FaPencilAlt className="" size={25} />,
  //   },
  //   {
  //     name: "About Us",
  //     link: "about_us",
  //     icon: <FaSign className="" size={25} />,
  //   },
  //   {
  //     name: "Privacy Policy",
  //     link: "privacy_policy",
  //     icon: <FaPaperclip className="" size={25} />,
  //   },
  //   {
  //     name: "Terms and Conditions",
  //     link: "terms_and_conditions",
  //     icon: <FaReadme className="" size={25} />,
  //   },
  // ],
};

export const chainData = {
  localhost: {
    name: "Localhost",
    chain: "ETH",
    network: "localhost",
    rpc: [
      "http://localhost:8545"
    ],
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
  gorli: {
    name: "Görli",
    title: "Ethereum Testnet Görli",
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
    nativeCurrency: { name: "Görli Ether", symbol: "GOR", decimals: 18 },
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

export const toHex = (num) => {
  return "0x" + num.toString(16);
};

export const isValidAmount = (number) => {
  return !isNaN(parseFloat(number)) && parseFloat(number) > 0;
};

export const getMaxBid = (bids) => {
  return bids?.reduce((prev, current) => {
    if (+current.bid > +prev.bid) {
      return current;
    } else {
      return prev;
    }
  });
};

export const getUserBid = (bids, user) => {
  return bids?.find((item) => item?.user?._id === user);
};

export const getUserName = (string) => {
  return string?.length !== 42
    ? `@${string}`
    : `@${string?.slice(0, 5)}...${string?.slice(-5)}`;
};

export const getEventData = (event) => {
  const [
    itemId,
    nftContract,
    tokenId,
    seller,
    owner,
    price,
    highestBidder,
    highestBid,
    pendingBidders,
    auctionEnded,
  ] = event?.args;

  return {
    itemId: itemId.toString(),
    nftContract: nftContract.toString(),
    tokenId: tokenId.toString(),
    seller: seller.toString(),
    owner: owner.toString(),
    price: ethers.utils.formatEther(price).toString(),
    highestBidder: highestBidder.toString(),
    highestBid: ethers.utils.formatEther(highestBid).toString(),
    pendingBidders: pendingBidders,
    auctionEnded: Boolean(auctionEnded),
  };
};

export const etherAddress = "0x0000000000000000000000000000000000000000";

export const loginMessage = "This Action requires you to Log in...";
export const approvalLoadingMessage = `Approving Your Token...`;
export const confirmLoadingMessage = `Waiting For Your Confirmation...`;
export const mintLoadingMessage = `Minting Your Token...`;
export const createSaleLoadingMessage = `Creating Sale For Your Token...`;
export const createItemLoadingMessage = `Adding Your Token To Marketplace...`;
export const createAuctionLoadingMessage = `Creating An Auction For Your Token...`;
export const withrawBidLoadingMessage = `Withdrawing Your Bid...`;
export const makeBidLoadingMessage = `Making Your Bid...`;
export const cancelSaleLoadingMessage = `Putting Down Your Token From Sale...`;
export const cancelAuctionLoadingMessage = `Putting Down Your Token From Auction...`;
export const buyLoadingMessage = `Transfering The Ownership Of This Token To You...`;

export const validAmountErrorMessage = `Please enter a valid amount`;
export const fileUploadErrorMessage = `Something went wrong while uploading the file, Please Try Again Later!`;
export const tokenMintErrorMessage = `Token Could Not Be Minted, Please Try Again Later!`;
export const tokenApproveErrorMessage = `Token Could Not Be Approved, Please Try Again Later!`;
export const tokenSaleErrorMessage = `Token Sale Could Not Be Created, Please Try Again Later!`;
export const tokenSaleCancelErrorMessage = `Token Sale Could Not Be Cancelled, Please Try Again Later!`;
export const tokenAuctionErrorMessage = `Token Auction Could Not Be Created, Please Try Again Later!`;
export const tokenAuctionEndErrorMessage = `Token Auction Could Not Be Ended, Please Try Again Later!`;
export const marketItemErrorMessage = `Market Item Could Not Be Created, Please Try Again Later!`;
export const tokenBuyErrorMessage = `Token Buy Could Not Be Created, Please Try Again Later!`;
export const tokenBidErrorMessage = `Your Bid Could Not Be Created, Please Try Again Later!`;
export const tokenBidWithdrawErrorMessage = `Your Bid Could Not Be Withdrawn, Please Try Again Later!`;
export const finalErrorMessage = `Something went wrong while saving your Token, Please Contact Support!`;
export const finalProcessingErrorMessage = `Something went wrong while finalizing Your Request, Please Contact Support!`;
export const commentAddErrorMessage = `Your Comment Could Not Be Submitted, Please Try Again Later!`;
export const saveErrorMessage = `This Token Could Not Be Saved, Please Try Again Later!`;
export const errorMessage = `Something went wrong!`;

export const tokenMintSuccessMessage = `Token Minted Successfuly!`;
export const tokenApproveSuccessMessage = `Token Approved Successfuly!`;
export const tokenSaleSuccessMessage = `Token Sale Created Successfuly!`;
export const tokenSaleCancelSuccessMessage = `Token Sale is Cancelled Successfuly!`;
export const tokenBuySuccessMessage = `Token Bought Successfuly!`;
export const tokenAuctionSuccessMessage = `Token Auction Created Successfuly!`;
export const tokenAuctionEndSuccessMessage = `Token Auction Ended Successfuly!`;
export const tokenBidSuccessMessage = `Your Bid Created Successfuly!`;
export const tokenBidWithdrawSuccessMessage = `Your Bid Withdrawn Successfuly!`;
export const MarketItemSuccessMessage = `Market Item Created Successfuly!`;
export const commentAddSuccessMessage = `Your Comment Submitted Successfuly!`;
export const saveSuccessMessage = `Token Saved Successfuly!`;
export const unsaveSuccessMessage = `Token Unsaved Successfuly!`;
export const finalSuccessMessage = `Well Done! Everything went well!`;
export const shareInfoMessage = `Share Link Copied To Clipboard!`;
export const contractAddressCopiedMessage = `Contract Address Copied To Clipboard!`;
