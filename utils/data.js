import { ethers } from "ethers";
import {
  FaCat,
  FaGamepad,
  FaLaugh,
  FaPaintBrush,
  FaPaperclip,
  FaPencilAlt,
  FaQuestion,
  FaReadme,
  FaSmile,
} from "react-icons/fa";

export const sidebarCategories = {
  "Discover Categories": [
    {
      name: "Art",
      icon: <FaPaintBrush className="" size={25} />,
    },
    {
      name: "Gaming",
      icon: <FaGamepad className="" size={25} />,
    },
    {
      name: "Collectibles",
      icon: <FaCat className="" size={25} />,
    },
    {
      name: "Memes",
      icon: <FaLaugh className="" size={25} />,
    },
    {
      name: "Gifs",
      icon: <FaSmile className="" size={25} />,
    },
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
};

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
    highestBid: highestBid.toString(),
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
export const marketItemErrorMessage = `Market Item Could Not Be Bought, Please Try Again Later!`;
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
