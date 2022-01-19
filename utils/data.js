import { ethers } from "ethers";
import axios from "axios"

export const etherAddress = "0x0000000000000000000000000000000000000000";

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

export const isSubset = (superObj, subObj) => {
  return Object.keys(subObj)?.every(ele => {
      if (typeof subObj[ele] == 'object') {
          return isSubset(superObj[ele], subObj[ele]);
      }
      return subObj[ele] === superObj[ele]
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
  data.append("file", selectedFile);

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
      const url = `https://gateway.pinata.cloud/ipfs/${data?.IpfsHash}`;
      success(url);
    })
    .catch((error) => {
      failure(error);
    });
};