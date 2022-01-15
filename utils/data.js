import { ethers } from "ethers";

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

// export const isSubset = (obj1, obj2) => {
//   for (var key in obj2){
//      if (JSON.stringify(obj2[key]) === JSON.stringify(obj1[key]))
//         return true;
//   }
//   return false;
// }

export const isSubset = (superObj, subObj) => {
  return Object.keys(subObj)?.every(ele => {
      if (typeof subObj[ele] == 'object') {
          return isSubset(superObj[ele], subObj[ele]);
      }
      return subObj[ele] === superObj[ele]
  });
};