import React, { useEffect, useState } from "react";
import Link from "next/link";
import { nftaddress, nftmarketaddress } from "./../../config";
import NFT from "./../../artifacts/contracts/NFT.sol/NFT.json";
import Market from "./../../artifacts/contracts/NFTMarket.sol/NFTMarket.json";
import Web3Modal from "web3modal";
import { ethers } from "ethers";
import MasonryLayout from "../../components/MasonryLayout";
import Spinner from "../../components/Spinner";
import { useDispatch, useSelector } from "react-redux";
import {
  approvalLoadingMessage,
  buyLoadingMessage,
  cancelAuctionLoadingMessage,
  cancelSaleLoadingMessage,
  commentAddErrorMessage,
  commentAddSuccessMessage,
  confirmLoadingMessage,
  contractAddressCopiedMessage,
  createAuctionLoadingMessage,
  createSaleLoadingMessage,
  errorMessage,
  etherAddress,
  finalErrorMessage,
  finalProcessingErrorMessage,
  finalSuccessMessage,
  getEventData,
  getMaxBid,
  getUserBid,
  getUserName,
  isValidAmount,
  loginMessage,
  makeBidLoadingMessage,
  saveErrorMessage,
  saveSuccessMessage,
  shareInfoMessage,
  tokenApproveErrorMessage,
  tokenApproveSuccessMessage,
  tokenAuctionEndErrorMessage,
  tokenAuctionEndSuccessMessage,
  tokenAuctionErrorMessage,
  tokenAuctionSuccessMessage,
  tokenBidErrorMessage,
  tokenBidSuccessMessage,
  tokenBidWithdrawErrorMessage,
  tokenBidWithdrawSuccessMessage,
  tokenBuyErrorMessage,
  tokenBuySuccessMessage,
  tokenSaleCancelErrorMessage,
  tokenSaleCancelSuccessMessage,
  tokenSaleErrorMessage,
  tokenSaleSuccessMessage,
  unsaveSuccessMessage,
  validAmountErrorMessage,
  withrawBidLoadingMessage,
} from "../../utils/data";
import { useRouter } from "next/router";
import axios from "axios";
import Head from "next/head";
import Image from "next/image";
import { HAS_MORE, MORE_LOADING, REFRESH_SET } from "../../redux/constants/UserTypes";
import { FaCopy, FaDiceD20 } from "react-icons/fa";
import { toast } from "react-toastify";

const buttonStyles =
  "m-2 shadow-lg hover:drop-shadow-lg transition duration-500 ease transform hover:-translate-y-1 inline-block bg-themeColor text-lg font-medium rounded-full text-secondTheme px-8 py-3 cursor-pointer";

const PinDetail = () => {
  const dispatch = useDispatch();
  const router = useRouter();
  const { pinId } = router.query;
  const { user, page, marketContract } = useSelector((state) => state.userReducer);
  const [refresh, setRefresh] = useState(false);
  const [pins, setPins] = useState([]);
  const [pinDetail, setPinDetail] = useState();
  const [loading, setLoading] = useState(false);
  const [similarLoading, setSimilarLoading] = useState(false);
  const [comment, setComment] = useState("");
  const [inputPrice, setInputPrice] = useState("");
  const [addingComment, setAddingComment] = useState(false);
  const [addingSellPrice, setAddingSellPrice] = useState(false);
  const [addingBidPrice, setAddingBidPrice] = useState(false);
  const [savingPost, setSavingPost] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState("Loading...");

  const {
    _id,
    title,
    about,
    seller,
    owner,
    bids,
    saved,
    comments,
    nftContract,
    itemId,
    tokenId,
    price,
    auctionEnded,
    category,
    image,
    postedBy,
  } = pinDetail ?? {
    _id: "",
    title: "",
    about: "",
    seller: "",
    owner: "",
    bids: [],
    saved: [],
    comments: [],
    nftContract: "",
    itemId: "",
    tokenId: "",
    price: "",
    category: "",
    image: "",
    auctionEnded: true,
    postedBy: {},
  };

  let alreadySaved = saved?.find((item) => item === user?._id);

  const executeMarketSaleCondition =
    price !== "0.0" &&
    owner === etherAddress &&
    seller !== user?.address &&
    auctionEnded;

  const createMarketSaleCondition =
    price === "0.0" &&
    owner === user?.address &&
    seller === etherAddress &&
    auctionEnded;

  const cancelMarketSaleCondition =
    price !== "0.0" &&
    seller === user?.address &&
    owner === etherAddress &&
    auctionEnded;

  const createMarketAuctionCondition =
    price === "0.0" &&
    owner === user?.address &&
    seller === etherAddress &&
    auctionEnded;

  const executeMarketAuctionEndCondition =
    price === "0.0" &&
    seller === user?.address &&
    owner === etherAddress &&
    !auctionEnded;

  const makeAuctionBidCondition =
    seller !== user?.address &&
    owner === etherAddress &&
    !bids?.find((bid) => bid.user?._id === user?._id) &&
    !auctionEnded;

  const withdrawAuctionBidCondition =
    seller !== user?.address &&
    owner === etherAddress &&
    bids?.find((bid) => bid.user?._id === user?._id) &&
    !auctionEnded;

  const priceShowCondition =
    price !== "0.0" && owner === etherAddress && auctionEnded;

  const highestBidShowCondition =
    price === "0.0" && owner === etherAddress && !auctionEnded;


  useEffect(() => {
    const listener = () => {
      setTimeout(() => {
        setRefresh(prev => !prev)
      }, 5000)
    }

    marketContract && marketContract?.events?.UpdatedMarketItem({}, (error, event) => {
      listener()
    })

  }, [])

  const fetchPinDetails = () => {
    axios
      .get(`/api/pins/${pinId}`)
      .then((res) => {
        setPinDetail(res.data.pin);
      })
      .catch((e) => {
        toast.error(errorMessage);
        // console.log(e);
      });
  };

  const fetchRelatedPins = () => {
    page === 1 && setSimilarLoading(true);
    dispatch({
      type: MORE_LOADING,
      payload: page !== 1,
    });
    axios
      .get(`/api/pins?page=${page}&category=${category}`)
      .then((res) => {
        const { pins, resultPerPage, filteredPinsCount } = res.data;
        let filtered = pins.filter((pin) => pin?._id !== pinId);
        setSimilarLoading(false);
        page === 1
          ? setPins(filtered)
          : setPins((prev) => [...prev, ...filtered]);
        dispatch({
          type: MORE_LOADING,
          payload: false,
        });
        dispatch({
          type: HAS_MORE,
          payload: page * resultPerPage < filteredPinsCount,
        });
      })
      .catch((e) => {
        setSimilarLoading(false);
        dispatch({
          type: MORE_LOADING,
          payload: false,
        });
        toast.error(errorMessage);
        // console.log(e);
      });
  };

  useEffect(() => {
    pinId && fetchPinDetails();
  }, [pinId, refresh]);

  useEffect(() => {
    category && fetchRelatedPins();
  }, [pinDetail, page]);

  const updatePin = (body) => {
    axios
      .put(`/api/pins/${_id}`, body)
      .then((res) => {
        setLoading(false);
        setAddingSellPrice(false);
        setInputPrice("");
        setRefresh((prev) => !prev);
        toast.success(finalSuccessMessage);
      })
      .catch((e) => {
        toast.error(finalErrorMessage);
        setLoading(false);
        setAddingSellPrice(false);
        setInputPrice("");
      });
  };

  const executeMarketSale = async () => {
    if (!user?._id) {
      toast.info(loginMessage);
      return;
    }

    setLoading(true);
    setLoadingMessage(confirmLoadingMessage);
    const web3Modal = new Web3Modal();
    const connection = await web3Modal.connect();
    const provider = new ethers.providers.Web3Provider(connection);
    const signer = provider.getSigner();

    // execute Market Sale function
    try {
      const contract = new ethers.Contract(
        nftmarketaddress,
        Market.abi,
        signer
      );
      const auctionPrice = ethers.utils.parseUnits(price, "ether");
      const transaction = await contract.executeMarketSale(nftaddress, itemId, {
        value: auctionPrice,
      });
      setLoadingMessage(buyLoadingMessage);
      const tx = await transaction.wait();
      toast.success(tokenBuySuccessMessage);
      const event = tx.events[2];
      var eventData = getEventData(event);
      console.log(eventData);
    } catch (e) {
      toast.error(tokenBuyErrorMessage);
      setLoading(false);
      return;
    }

    // upadate pin in the database
    updatePin({
      ...eventData,
      postedBy: user?._id,
      destination: "https://nft-nation.vercel.app",
    });
  };

  const createMarketSale = async () => {
    if (!user?._id) {
      toast.info(loginMessage);
      return;
    }

    if (!isValidAmount(inputPrice)) {
      toast.info(validAmountErrorMessage);
      return;
    }

    setLoading(true);
    setLoadingMessage(confirmLoadingMessage);
    const web3Modal = new Web3Modal();
    const connection = await web3Modal.connect();
    const provider = new ethers.providers.Web3Provider(connection);
    const signer = provider.getSigner();

    try {
      var contract = new ethers.Contract(nftaddress, NFT.abi, signer);
      var transaction = await contract.approve(nftmarketaddress, tokenId);
      setLoadingMessage(approvalLoadingMessage);
      await transaction.wait();
      toast.success(tokenApproveSuccessMessage);
    } catch (e) {
      toast.error(tokenApproveErrorMessage);
      setLoading(false);
      return;
    }

    try {
      setLoadingMessage(confirmLoadingMessage);
      contract = new ethers.Contract(nftmarketaddress, Market.abi, signer);
      const auctionPrice = ethers.utils.parseUnits(inputPrice, "ether");
      transaction = await contract.createMarketSale(
        nftaddress,
        itemId,
        auctionPrice
      );
      setLoadingMessage(createSaleLoadingMessage);
      const tx = await transaction.wait();
      toast.success(tokenSaleSuccessMessage);
      console.log(tx.events);
      const event = tx.events[2];
      var eventData = getEventData(event);
      console.log(eventData);
    } catch (e) {
      toast.error(tokenSaleErrorMessage);
      setLoading(false);
      return;
    }

    updatePin({
      ...eventData,
      postedBy: user?._id,
      destination: "https://nft-nation.vercel.app",
    });
  };

  const makeAuctionBid = async () => {
    if (!user?._id) {
      toast.info(loginMessage);
      return;
    }

    if (!isValidAmount(inputPrice)) {
      toast.info(validAmountErrorMessage);
      return;
    }

    setLoading(true);
    setLoadingMessage(confirmLoadingMessage);
    const web3Modal = new Web3Modal();
    const connection = await web3Modal.connect();
    const provider = new ethers.providers.Web3Provider(connection);
    const signer = provider.getSigner();

    try {
      const contract = new ethers.Contract(
        nftmarketaddress,
        Market.abi,
        signer
      );
      const auctionBid = ethers.utils.parseUnits(inputPrice, "ether");
      const transaction = await contract.makeAuctionBid(itemId, {
        value: auctionBid,
      });
      setLoadingMessage(makeBidLoadingMessage);
      const tx = await transaction.wait();
      toast.success(tokenBidSuccessMessage);
      const event = tx.events[0];
      var eventData = getEventData(event);
      console.log(eventData);
      console.log(tx.events, "DDDDDDD");
    } catch (e) {
      console.log(e, "^^^^^^^^^^^^^^")
      toast.error(tokenBidErrorMessage);
      setLoading(false);
      return;
    }

    makeAuctionBidRequest({
      user: user?._id,
      bid: inputPrice,
    });
  };

  const withdrawAuctionBid = async () => {
    if (!user?._id) {
      toast.info(loginMessage);
      return;
    }

    setLoading(true);
    setLoadingMessage(confirmLoadingMessage);
    const web3Modal = new Web3Modal();
    const connection = await web3Modal.connect();
    const provider = new ethers.providers.Web3Provider(connection);
    const signer = provider.getSigner();

    try {
      let contract = new ethers.Contract(nftmarketaddress, Market.abi, signer);
      const transaction = await contract.withdrawAuctionBid(itemId);
      setLoadingMessage(withrawBidLoadingMessage);
      const tx = await transaction.wait();
      toast.success(tokenBidWithdrawSuccessMessage);
      const event = tx.events[0];
      var eventData = getEventData(event);
      console.log(tx.events, "DDDDDDDDDDDDDDDDDDDDDDDDDDDDDD")
      console.log(eventData);
    } catch (e) {
      console.log(e,"^^^^^^^^^^^^^^^^^^^^^")
      toast.error(tokenBidWithdrawErrorMessage);
      setLoading(false);
      return;
    }

    withdrawAuctionBidRequest({
      user: user?._id,
    });
  };

  const createMarketAuction = async () => {
    if (!user?._id) {
      toast.info(loginMessage);
      return;
    }

    setLoading(true);
    setLoadingMessage(confirmLoadingMessage);
    const web3Modal = new Web3Modal();
    const connection = await web3Modal.connect();
    const provider = new ethers.providers.Web3Provider(connection);
    const signer = provider.getSigner();

    try {
      var contract = new ethers.Contract(nftaddress, NFT.abi, signer);
      var transaction = await contract.approve(nftmarketaddress, tokenId);
      setLoadingMessage(approvalLoadingMessage);
      await transaction.wait();
      toast.success(tokenApproveSuccessMessage);
    } catch (e) {
      toast.error(tokenApproveErrorMessage);
      setLoading(false);
      return;
    }

    try {
      setLoadingMessage(confirmLoadingMessage);
      contract = new ethers.Contract(nftmarketaddress, Market.abi, signer);
      transaction = await contract.createMarketAuction(nftaddress, itemId);
      setLoadingMessage(createAuctionLoadingMessage);
      const tx = await transaction.wait();
      toast.success(tokenAuctionSuccessMessage);
      const event = tx.events[2];
      var eventData = getEventData(event);
      console.log(tx.events);
      console.log(eventData);
    } catch (e) {
      console.log(e, "^^^^^^^^^^^^^^^^^^^^^^^^^")
      toast.error(tokenAuctionErrorMessage);
      setLoading(false);
      return;
    }

    updatePin({
      ...eventData,
      postedBy: user?._id,
      destination: "https://nft-nation.vercel.app",
    });
  };

  const executeMarketAuctionEnd = async () => {
    if (!user?._id) {
      toast.info(loginMessage);
      return;
    }

    setLoading(true);
    setLoadingMessage(confirmLoadingMessage);
    const web3Modal = new Web3Modal();
    const connection = await web3Modal.connect();
    const provider = new ethers.providers.Web3Provider(connection);
    const signer = provider.getSigner();

    try {
      const contract = new ethers.Contract(
        nftmarketaddress,
        Market.abi,
        signer
      );
      const transaction = await contract.executeMarketAuctionEnd(
        nftaddress,
        itemId
      );
      setLoadingMessage(cancelAuctionLoadingMessage);
      const tx = await transaction.wait();
      console.log(tx);
      toast.success(tokenAuctionEndSuccessMessage);
      const event = tx.events[2];
      var eventData = getEventData(event);
      console.log(eventData);
      var newOwner = bids?.length ? getMaxBid(bids)?.user : user;
    } catch (e) {
      console.log(e, "^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^")
      toast.error(tokenAuctionEndErrorMessage);
      setLoading(false);
      return;
    }

    updatePin({
      ...eventData,
      postedBy: newOwner?._id,
      bids: [],
      destination: "https://nft-nation.vercel.app",
    });
  };

  const cancelMarketSale = async () => {
    if (!user?._id) {
      toast.info(loginMessage);
      return;
    }

    setLoading(true);
    setLoadingMessage(confirmLoadingMessage);
    const web3Modal = new Web3Modal();
    const connection = await web3Modal.connect();
    const provider = new ethers.providers.Web3Provider(connection);
    const signer = provider.getSigner();

    try {
      const contract = new ethers.Contract(
        nftmarketaddress,
        Market.abi,
        signer
      );
      const transaction = await contract.cancelMarketSale(nftaddress, itemId);
      setLoadingMessage(cancelSaleLoadingMessage);
      const tx = await transaction.wait();
      toast.success(tokenSaleCancelSuccessMessage);
      const event = tx.events[2];
      var eventData = getEventData(event);
      console.log(eventData);
    } catch (e) {
      toast.error(tokenSaleCancelErrorMessage);
      setLoading(false);
      return;
    }

    updatePin({
      ...eventData,
      postedBy: user?._id,
      destination: "https://nft-nation.vercel.app",
    });
  };

  const addComment = () => {
    if (!user?._id) {
      toast.info(loginMessage);
      return;
    }

    if (comment) {
      setAddingComment(true);

      axios
        .post(`/api/pins/comments/${pinId}`, {
          user: user?._id,
          comment,
        })
        .then(() => {
          setAddingComment(false);
          setComment("");
          setRefresh((prev) => !prev);
          toast.success(commentAddSuccessMessage);
        })
        .catch((e) => {
          setAddingComment(false);
          toast.error(commentAddErrorMessage);
        });
    }
  };
  const makeAuctionBidRequest = (body) => {
    axios
      .post(`/api/pins/bids/${pinId}`, body)
      .then(() => {
        setAddingBidPrice(false);
        setInputPrice("");
        setLoading(false);
        setRefresh((prev) => !prev);
        toast.success(finalSuccessMessage);
      })
      .catch((e) => {
        setLoading(false);
        toast.error(finalProcessingErrorMessage);
      });
  };
  const withdrawAuctionBidRequest = (body) => {
    axios
      .put(`/api/pins/bids/${pinId}`, body)
      .then(() => {
        setLoading(false);
        setRefresh((prev) => !prev);
        toast.success(finalSuccessMessage);
      })
      .catch((e) => {
        setLoading(false);
        toast.error(finalProcessingErrorMessage);
      });
  };

  const savePin = () => {
    if (!user?._id) {
      toast.info(loginMessage);
      return;
    }
    setSavingPost(true);
    axios
      .put(`/api/pins/save/${pinId}`, {
        user: user?._id,
      })
      .then((res) => {
        setSavingPost(false);
        setRefresh((prev) => !prev);
        toast.success(alreadySaved ? unsaveSuccessMessage : saveSuccessMessage);
      })
      .catch((e) => {
        console.log(e);
        setSavingPost(false);
        toast.error(saveErrorMessage);
      });
  };

  const buttonArray = [
    {
      text: `Buy ${price} Matic`,
      condition: executeMarketSaleCondition,
      function: executeMarketSale,
    },
    {
      text: `Sell`,
      condition: createMarketSaleCondition,
      function: () => {
        setAddingSellPrice((prev) => !prev);
      },
    },
    {
      text: `Put Down From Sale`,
      condition: cancelMarketSaleCondition,
      function: cancelMarketSale,
    },
    {
      text: `Put On Auction`,
      condition: createMarketAuctionCondition,
      function: createMarketAuction,
    },
    {
      text: `End Auction${
        bids?.length
          ? ` (Highest Bid: ${getMaxBid(bids).bid} Matic)`
          : ` (No Bids Yet)`
      }`,
      condition: executeMarketAuctionEndCondition,
      function: executeMarketAuctionEnd,
    },
    {
      text: `Make a Bid${
        bids?.length
          ? ` (Highest Bid: ${getMaxBid(bids).bid} Matic)`
          : ` (No Bids Yet)`
      }`,
      condition: makeAuctionBidCondition,
      function: () => {
        setAddingBidPrice((prev) => !prev);
      },
    },
    {
      text: `Withdraw Bid (Your Bid: ${
        getUserBid(bids, user?._id)?.bid
      } Matic)`,
      condition: withdrawAuctionBidCondition,
      function: withdrawAuctionBid,
    },
    {
      text: `${
        alreadySaved
          ? `${saved?.length} Saved`
          : savingPost
          ? `Saving...`
          : `Save`
      }`,
      condition: true,
      function: savePin,
    },
    {
      text: `Share`,
      condition: true,
      function: () => {
        navigator.clipboard.writeText(
          `https:nft-nation.vercel.app/pin-detail/${pinId}`
        );
        toast.info(shareInfoMessage)
      },
    },
  ];

  if (!pinDetail) {
    return <Spinner message="Showing pin..." />;
  }

  if (loading) {
    return (
      <Spinner
        title={loadingMessage}
        message={`Please Do Not Leave This Page...`}
      />
    );
  }

  return (
    <>
      <Head>
        <title>{`${title} | NFT Nation`}</title>
        <meta name="description" content={`${about}`} />
        <meta property="og:title" content={`${title} | NFT Nation`} />
        <meta property="og:description" content={`${about}`} />
        <meta
          property="og:url"
          content={`https://nft-nation.vercel.app/pin-detail/${_id}`}
        />
        <meta property="og:type" content="website" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      {pinDetail && (
        <div className="bg-gradient-to-r from-secondTheme to-themeColor bg-secondTheme shadow-lg rounded-lg p-0 lg:p-5 pb-12 mb-8">
          <div className="bg-gradient-to-r from-themeColor to-secondTheme flex flex-col lg:flex-row relative justify-between align-center overflow-hidden shadow-md p-5 mb-6 rounded-lg">
            <Image
              unoptimized
              placeholder="blur"
              blurDataURL="/favicon.png"
              alt={title}
              className="shadow-lg rounded-t-lg lg:rounded-lg"
              height={500}
              width={600}
              src={image}
            />

            <div className="w-full p-5 flex-1 xl:min-w-620">
              <h2 className="mt-0 text-2xl font-bold">
                {comments?.length
                  ? `${comments?.length} Comments`
                  : `No Comments Yet`}
              </h2>
              <div className="max-h-370 overflow-y-scroll">
                {comments?.map((item) => (
                  <div
                    key={`${item?._id}`}
                    className="p-2 bg-gradient-to-r from-secondTheme to-themeColor flex gap-2 mt-5 items-center bg-secondTheme rounded-lg"
                  >
                    {item?.user?._id && (
                      <Link href={`/user-profile/${item?.user?._id}`}>
                        <div>
                          {item?.user?.image && (
                            <Image
                              height={40}
                              width={40}
                              src={item?.user?.image}
                              className="w-10 h-10 rounded-full cursor-pointer"
                              alt="user-profile"
                            />
                          )}
                        </div>
                      </Link>
                    )}
                    <div className="flex flex-col">
                      <p className="font-bold">
                        {getUserName(item?.user?.userName)}
                      </p>
                      <p>{item.comment}</p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="flex flex-wrap mt-6 gap-3">
                {user?._id && (
                  <Link href={`/user-profile/${user?._id}`}>
                    <div>
                      {user?.image && (
                        <Image
                          height={40}
                          width={40}
                          src={user?.image}
                          className="w-10 h-10 rounded-full cursor-pointer"
                          alt="user-profile"
                        />
                      )}
                    </div>
                  </Link>
                )}
                <input
                  className=" flex-1 border-gray-100 outline-none border-2 p-2 mb- rounded-2xl focus:border-gray-300"
                  type="text"
                  placeholder="Add a comment"
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                />
                <button
                  type="button"
                  className="shadow-lg hover:drop-shadow-lg transition transition duration-500 ease transform hover:-translate-y-1 inline-block bg-themeColor text-secondTheme rounded-full px-6 py-2 font-semibold text-base outline-none"
                  onClick={addComment}
                >
                  {addingComment ? "Doing..." : "Done"}
                </button>
              </div>
            </div>
          </div>

          <div className="block lg:flex text-center items-center justify-center mb-5 w-full justify-evenly">
            {postedBy?._id && (
              <Link href={`/user-profile/${postedBy?._id}`}>
                <div className="cursor-pointer flex items-center justify-center mb-4 lg:mb-0 w-full lg:w-auto mr-2 items-center transition transition duration-500 ease transform hover:-translate-y-1">
                  <Image
                    alt={pinDetail.postedBy.userName}
                    height={40}
                    width={40}
                    className="align-middle rounded-full"
                    src={postedBy?.image}
                  />

                  <p className="inline align-middle text-gray-700 ml-2 text-lg font-bold">
                    {getUserName(postedBy?.userName)}
                  </p>
                </div>
              </Link>
            )}

            {(priceShowCondition || highestBidShowCondition) && (
              <div className="font-bold text-gray-700 mr-2">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6 inline mr-2 text-pink-500"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
                <span className="align-middle">
                  {/* {moment(createdAt).format("MMM DD, YYYY")} */}
                  {priceShowCondition
                    ? `On Sale (Price: ${price} Matic)`
                    : `On Auction ${
                        bids?.length
                          ? ` (Highest Bid: ${getMaxBid(bids)?.bid} Matic)`
                          : ` (No Bids Yet)`
                      }`}
                </span>
              </div>
            )}

            <div
              onClick={() => {
                navigator.clipboard.writeText(`${nftContract}`);
                toast.info(contractAddressCopiedMessage)
              }}
              className="font-bold text-gray-700 mr-2 cursor-pointer transition transition duration-500 ease transform hover:-translate-y-1"
            >
              <FaCopy className="inline mr-2" size={25} />
              <span className="align-middle">
                {/* {moment(createdAt).format("MMM DD, YYYY")} */}
                {`NFT Contract Address`}
              </span>
            </div>

            <div className="font-bold text-gray-700 mr-2">
              <FaDiceD20 className="inline mr-2" size={25} />
              <span className="align-middle">
                {/* {moment(createdAt).format("MMM DD, YYYY")} */}
                {`Token ID: #${tokenId}`}
              </span>
            </div>
            <div className="font-bold text-gray-700 mr-2">
              <FaDiceD20 className="inline mr-2" size={25} />
              <span className="align-middle">
                {/* {moment(createdAt).format("MMM DD, YYYY")} */}
                {`Item ID: #${itemId}`}
              </span>
            </div>
          </div>
          <h1 className="transition duration-700 text-center mb-5 cursor-pointer hover:text-pink-600 text-3xl font-semibold">
            <p>{`#${tokenId} ${title}`}</p>
          </h1>
          <p className="text-center text-lg text-gray-700 font-normal px-4 lg:px-20 mb-5">
            {about}
          </p>
          <div className="p-2 bg-gradient-to-r from-themeColor to-secondTheme rounded-lg drop-shadow-lg flex flex-wrap text-center justify-evenly">
            {buttonArray?.map((item, index) => {
              if (item?.condition) {
                return (
                  <button key={index} onClick={item?.function}>
                    <span className={buttonStyles}>{item?.text} </span>
                  </button>
                );
              }
            })}
          </div>
          {(makeAuctionBidCondition || createMarketSaleCondition) && (addingBidPrice || addingSellPrice) && (
            <div className="mt-4 p-2 bg-gradient-to-r from-themeColor to-secondTheme rounded-lg drop-shadow-lg flex flex-wrap text-center justify-evenly">
              <div className="flex flex-wrap m-2 gap-3">
                {user?._id && (
                  <Link href={`/user-profile/${user?._id}`}>
                    <div>
                      {user?.image && (
                        <Image
                          height={40}
                          width={40}
                          src={user?.image}
                          className="w-10 h-10 rounded-full cursor-pointer hover:shadow-lg"
                          alt="user-profile"
                        />
                      )}
                    </div>
                  </Link>
                )}
                <input
                  className=" flex-1 border-gray-100 outline-none border-2 p-2 rounded-2xl focus:border-gray-300"
                  type="text"
                  placeholder="Enter Price..."
                  maxLength={10}
                  value={inputPrice}
                  onChange={(e) => setInputPrice(e.target.value)}
                />
                <button
                  type="button"
                  className="shadow-lg hover:drop-shadow-lg transition transition duration-500 ease transform hover:-translate-y-1 inline-block bg-themeColor text-secondTheme rounded-full px-6 py-2 font-semibold text-base outline-none"
                  onClick={() => {
                    addingSellPrice && createMarketSale();
                    addingBidPrice && makeAuctionBid();
                  }}
                >
                  {`Confirm`}
                </button>
              </div>
            </div>
          )}
        </div>
      )}
      {pins?.length > 0 && (
        <>
          <h2 className="text-center font-bold text-2xl mt-8 mb-4">
            More like this
          </h2>
          <MasonryLayout pins={pins} />
        </>
      )}
      {similarLoading && <Spinner message="Loading more pins" />}
    </>
  );
};

export default PinDetail;
