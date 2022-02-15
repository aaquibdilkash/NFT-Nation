import { ethers } from "ethers";
import axios from "axios";
import { toast } from "react-toastify";

export const etherAddress = "0x0000000000000000000000000000000000000000";

export const basePath =
  process.env.NODE_ENV !== "production"
    ? `http://localhost:3000`
    : `https://nft-nation.vercel.app`;

export const feedPathArray = [
  "/",
  "/pin-detail/[pinId]",
  "/collection-detail/[collectionId]",
  "/user-profile/[userId]",
];

export const ether = (n) => {
  return new web3.utils.BN(web3.utils.toWei(n.toString(), "ether"));
};

export const parseAmount = (amount) => {
  return ethers.utils.parseUnits(amount, "ether");
};

export const buttonStyle =
  "transition duration-200 ease transform hover:-translate-y-1 text-[#ffffff] text-xs font-bold rounded-lg bg-themeColor inline-block mt-0 ml-1 py-1.5 px-2 cursor-pointer shadow-xl drop-shadow-lg";

export const formButtonStyles =
  "w-full transition transition duration-500 ease transform hover:-translate-y-1 inline-block drop-shadow-lg bg-themeColor text-secondTheme font-bold p-2 rounded-lg w-auto outline-none";

export const tabButtonStyles =
  "m-2 shadow-lg hover:drop-shadow-lg transition duration-500 ease transform hover:-translate-y-1 inline-block bg-themeColor text-md font-semibold rounded-full text-secondTheme px-4 py-2 cursor-pointer";

export const iconStyles =
  "text-[#ffffff] transition transition duration-500 ease transform hover:-translate-y-1 drop-shadow-lg cursor-pointer";

export const toHex = (num) => {
  return "0x" + num.toString(16);
};

export const isValidAmount = (number) => {
  return !isNaN(parseFloat(number)) && parseFloat(number) > 0;
};

export const isValidRoyalty = (number) => {
  return !isNaN(parseFloat(number)) && parseFloat(number) <= 50;
};

export const checkAttributes = (attributes = []) => {
  return attributes?.every(
    ({ trait_type, value }) => !(!trait_type || !value)
  );
};

export const getMaxBid = (bids) => {
  if (!bids?.length) {
    return "0.0";
  }
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

export const getCurrentBid = (currentBid = "0.0", startingBid = "0.0") => {
  return Math.max(currentBid, startingBid);
};

export const getNotificationStatus = (to, user) => {
  return to?.find((item) => item?.user === user);
};

export const getUserName = (string) => {
  return string?.length !== 42
    ? `@${string}`
    : `@${string?.slice(0, 5)}...${string?.slice(-5)}`;
};

export const toTitleCase = (text) => {
  return text.substring(0, 1).toUpperCase() + text.substring(1, text.length).toLowerCase()
}

export const getImage = (hash) => {
  if (!hash) {
    return "/favicon.png";
  }
  const clouddflare = "https://cf-ipfs.com/ipfs/";
  const ipfs = "https://ipfs.io/ipfs/";
  const pinata = "https://gateway.pinata.cloud/ipfs/";
  const ipfsGateway = "https://gateway.ipfs.io/ipfs/";

  const url = hash?.length === 46 ? `${ipfs}${hash}` : hash;

  return url;
};

export const getGatewayImage = (hash, gateway) => {
  if (!hash) {
    return "https://nft-nation.vercel.app/favicon.png";
  }

  const gatewayObj = {
    clouddflare: "https://cf-ipfs.com/ipfs/",
    ipfs: "https://ipfs.io/ipfs/",
    pinata: "https://gateway.pinata.cloud/ipfs/",
    ipfsGateway: "https://gateway.ipfs.io/ipfs/",
  };

  const url = hash?.length === 46 ? `${gatewayObj[`${gateway}`]}${hash}` : hash;

  return url;
};

export const getIpfsImage = (hash) => {
  if (!hash) {
    return "/favicon.png";
  }

  const ipfs = "https://ipfs.io/ipfs/";

  const url = hash?.length === 46 ? `${ipfs}${hash}` : hash;

  return url;
};

export const getEventData = (event) => {
  const [
    itemId,
    nftContract,
    tokenId,
    onSale,
    owner,
    price,
    highestBidder,
    highestBid,
    pendingBidders,
    pendingOffers,
    auctionEnded,
    minter,
    royalty
  ] = event?.args;

  return {
    itemId: itemId.toString(),
    nftContract: nftContract.toString(),
    tokenId: tokenId.toString(),
    onSale,
    postedBy: owner.toString(),
    price: ethers.utils.formatEther(price).toString(),
    highestBidder: highestBidder.toString(),
    currentBid: ethers.utils.formatEther(highestBid).toString(),
    pendingBidders: pendingBidders,
    offers: pendingOffers,
    auctionEnded: Boolean(auctionEnded),
    createdBy: minter,
    royalty: royalty.toString()
  };
};

export const isSubset = (superObj, subObj) => {
  return Object.keys(subObj)?.every((ele) => {
    if (typeof subObj[ele] == "object") {
      return isSubset(superObj[ele], subObj[ele]);
    }
    return subObj[ele] === superObj[ele];
  });
};

export const pinFileToIPFS = async (
  selectedFile,
  setProgress = () => {},
  success = () => {},
  failure = () => {}
) => {
  const pinataUrl = `https://api.pinata.cloud/pinning/pinFileToIPFS`;

  //we gather a local file for this example, but any valid readStream source will work here.
  let data = new FormData();
  data.append(
    "file",
    selectedFile,
    selectedFile?.name ? `${selectedFile?.name}` : `metadata.json`
  );

  axios
    .post(pinataUrl, data, {
      onUploadProgress: function (progressEvent) {
        var percentCompleted = Math.round(
          (progressEvent.loaded * 100) / progressEvent.total
        );
        setProgress(percentCompleted);
      },
      maxContentLength: "Infinity", //this is needed to prevent axios from erroring out with large files
      headers: {
        "Content-Type": `multipart/form-data; boundary=${data._boundary}`,
        // "Content-Type": `${selectedFile?.type}; boundary=${data._boundary}`,
        pinata_api_key: process.env.PINATA_API_KEY,
        pinata_secret_api_key: process.env.PINATA_SECRET_KEY,
      },
    })
    .then(({ data }) => {
      const { IpfsHash, isDuplicate } = data;
      const url = `https://ipfs.io/ipfs/${data?.IpfsHash}`;
      // const url = `https://gateway.pinata.cloud/ipfs/${IpfsHash}`;
      success(IpfsHash, isDuplicate);
    })
    .catch((error) => {
      failure(error);
    });
};

export const removePinFromIPFS = async (
  hashToUnpin,
  success = () => {},
  failure = () => {}
) => {
  const pinataUrl = `https://api.pinata.cloud/pinning/unpin/${hashToUnpin}`;
  axios
    .delete(pinataUrl, {
      headers: {
        pinata_api_key: process.env.PINATA_API_KEY,
        pinata_secret_api_key: process.env.PINATA_SECRET_KEY,
      },
    })
    .then(function (response) {
      success();
      //handle response here
    })
    .catch(function (error) {
      failure(error);
      //handle error here
    });
};

export const sendNotifications = (
  obj,
  success = () => {},
  failure = () => {}
) => {
  axios
    .post(`/api/notifications`, obj)
    .then((res) => {
      success(res);
      // toast.success("notification sent!")
    })
    .catch((e) => {
      failure(e);
      // toast.error("notifications could not be Sent")
    });
};

export const fetcher = (url) => axios.get(url).then((res) => res.data);

export const getNotificationDescription = (item) => {
  const {
    type,
    toUser,
    byUser,
    pin,
    pinCollection,
    price,
    createdAt,
    to,
    _id,
  } = item;
  switch (type) {
    case "New NFT":
      return `${getUserName(byUser?.userName)} minted an NFT "${pin?.title}".`;
    case "New Collection":
      return `${getUserName(byUser?.userName)} created a collection "${
        pinCollection?.title
      }".`;
    case "New Save":
      return `${getUserName(byUser?.userName)} saved the ${
        pin ? `NFT "${pin?.title}"` : `Collection "${pinCollection?.title}"`
      }.`;
    case "New Comment":
      return `${getUserName(byUser?.userName)} commented on the ${
        pin ? `NFT "${pin?.title}"` : `Collection "${pinCollection?.title}"`
      }.`;
    case "New Reply":
      return `${getUserName(byUser?.userName)} replied to ${getUserName(
        toUser?.userName
      )} on the ${
        pin ? `NFT "${pin?.title}"` : `Collection "${pinCollection?.title}"`
      }.`;
    case "New Bid":
      return `${getUserName(
        byUser?.userName
      )} made bid of ${price} Matic on NFT "${pin?.title}".`;
    case "New Offer":
      return `${getUserName(
        byUser?.userName
      )} made an offer of ${price} Matic on NFT "${
        pin?.title
      }" to ${getUserName(toUser?.userName)}.`;
    case "Offer Accepted":
      return `${getUserName(
        byUser?.userName
      )} accepted an offer of ${price} Matic on NFT "${
        pin?.title
      }" from ${getUserName(toUser?.userName)}.`;
    case "Offer Rejected":
      return `${getUserName(
        byUser?.userName
      )} rejected an offer of ${price} Matic on NFT "${
        pin?.title
      }" from ${getUserName(toUser?.userName)}.`;
    case "Offers Rejected":
      return `${getUserName(byUser?.userName)} rejcted all the offers on NFT "${
        pin?.title
      }".`;
    case "New Follow":
      return `${getUserName(byUser?.userName)} started following ${getUserName(
        toUser?.userName
      )}.`;
    case "Up For Sale":
      return `${getUserName(byUser?.userName)} has put NFT "${
        pin?.title
      }" on sale for ${price} Matic.`;
    case "Sale Ended":
      return `${getUserName(byUser?.userName)} has ended the sale for NFT "${
        pin?.title
      }"`;
    case "NFT Sold":
      return `${getUserName(byUser?.userName)} has sold the NFT "${
        pin?.title
      }" to ${getUserName(toUser?.userName)} for ${price} Matic.`;
    case "Up For Auction":
      return `${getUserName(byUser?.userName)} has put NFT "${
        pin?.title
      }" on auction.`;
    case "Auction Ended":
      return `${getUserName(byUser?.userName)} has ended the auction for NFT "${
        pin?.title
      }"${
        price
          ? `, ${getUserName(
              toUser?.userName
            )} was the highest bidder with a bid of ${price} Matic`
          : ``
      }.`;
    default:
      return ``;
  }
};

export const getHistoryDescription = (item) => {
  const { type, amount } = item;
  switch (type) {
    case "Mint":
      return `Minted`;
    case "Bid":
      return `Won in an auction for bid ${amount} Matic.`;
    case "Sale":
      return `Purchased in a Sale for price ${amount} Matic.`;
    case "Offer":
      return `Purchased by Offer for price ${amount} Matic.`;
    case "Gift":
      return `Received as a Gift.`;
    default:
      return ``;
  }
};
