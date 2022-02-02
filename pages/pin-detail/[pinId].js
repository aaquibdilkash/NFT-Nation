import { useEffect, useState } from "react";
import Link from "next/link";
import { nftaddress, nftmarketaddress } from "../../config";
import NFT from "../../artifacts/contracts/NFT.sol/NFT.json";
import Market from "../../artifacts/contracts/NFTMarket.sol/NFTMarket.json";
import Web3Modal from "web3modal";
import { ethers } from "ethers";
import Spinner from "../../components/Spinner";
import { useDispatch, useSelector } from "react-redux";
import {
  buttonStyle,
  etherAddress,
  getEventData,
  getImage,
  getIpfsImage,
  getMaxBid,
  getUserBid,
  getUserName,
  isValidAmount,
  parseAmount,
} from "../../utils/data";
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
  finalErrorMessage,
  finalProcessingErrorMessage,
  finalSuccessMessage,
  giftLoadingMessage,
  giftUserSelectInfoMessage,
  loginMessage,
  makeBidLoadingMessage,
  saveErrorMessage,
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
  tokenGiftErrorMessage,
  tokenGiftSuccessMessage,
  tokenSaleCancelErrorMessage,
  tokenSaleCancelSuccessMessage,
  tokenSaleErrorMessage,
  tokenSaleSuccessMessage,
  validAmountErrorMessage,
  withrawBidLoadingMessage,
} from "../../utils/messages";
import { useRouter } from "next/router";
import axios from "axios";
import Head from "next/head";
import Image from "next/image";
import { FaShareAlt } from "react-icons/fa";
import { toast } from "react-toastify";
import { Feed } from "../../components";
import {
  AiFillHeart,
  AiOutlineHeart,
  AiOutlineLoading3Quarters,
} from "react-icons/ai";
import moment from "moment";
import { MdDeleteForever } from "react-icons/md";
import { GIFTING_USER_SET } from "../../redux/constants/UserTypes";

const tabButtonStyles =
  "m-2 shadow-lg hover:drop-shadow-lg transition duration-500 ease transform hover:-translate-y-1 inline-block bg-themeColor text-md font-semibold rounded-full text-secondTheme px-4 py-2 cursor-pointer";

const PinDetail = () => {
  const router = useRouter();
  const dispatch = useDispatch();
  const { pathname } = router;
  const { pinId } = router.query;
  const { user, giftingUser, marketContract } = useSelector(
    (state) => state.userReducer
  );
  const [refresh, setRefresh] = useState(false);
  const [pinDetail, setPinDetail] = useState();
  const [pinComments, setPinComments] = useState([]);
  const [pinHistory, setPinHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [comment, setComment] = useState("");
  const [inputPrice, setInputPrice] = useState("");
  const [addingComment, setAddingComment] = useState(false);
  const [addingSellPrice, setAddingSellPrice] = useState(false);
  const [addingBidPrice, setAddingBidPrice] = useState(false);
  const [savingPost, setSavingPost] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState("Loading...");
  const [sideLoading, setSideLoading] = useState(true);
  const [alreadySaved, setAlreadySaved] = useState(false);
  const [savedLength, setSavedLenth] = useState(0);
  const [activeBtn, setActiveBtn] = useState("More NFTs Like This");
  const [tab, setTab] = useState("comments");

  const {
    _id,
    title,
    about,
    seller,
    owner,
    bids,
    saved,
    commentsCount,
    nftContract,
    itemId,
    tokenId,
    price,
    auctionEnded,
    properties,
    history,
    category,
    image,
    postedBy,
    createdBy,
    createdAt,
  } = pinDetail ?? {
    _id: "",
    title: "",
    about: "",
    seller: "",
    owner: "",
    bids: [],
    saved: [],
    commentsCount: 0,
    nftContract: "",
    itemId: "",
    tokenId: "",
    price: "",
    category: "",
    image: "",
    auctionEnded: true,
    properties: [],
    history: [],
    postedBy: {},
    createdBy: {},
    createdAt: new Date(),
  };

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

  // useEffect(() => {
  //   const listener = () => {
  //     setTimeout(() => {
  //       setRefresh((prev) => !prev);
  //     }, 5000);
  //   };

  //   marketContract &&
  //     marketContract?.events?.UpdatedMarketItem({}, (error, event) => {
  //       listener();
  //     });
  // }, []);

  const fetchPinHistory = () => {
    setLoadingMessage("Fetching History...");
    setSideLoading(true);
    axios
      .get(`/api/pins/history/${pinId}`)
      .then((res) => {
        setPinHistory(res?.data?.history);
        setSideLoading(false);
      })
      .catch((e) => {
        toast.error(errorMessage);
        setSideLoading(false);
        // console.log(e);
      });
  };

  const fetchPinComments = () => {
    setLoadingMessage("Fetching Comments...");
    setSideLoading(true);
    axios
      .get(`/api/pins/comments/${pinId}`)
      .then((res) => {
        setPinComments(res?.data?.comments);
        setSideLoading(false);
      })
      .catch((e) => {
        toast.error(errorMessage);
        setSideLoading(false);
        // console.log(e);
      });
  };

  const deleteComment = (id) => {
    axios
      .delete(`/api/pins/comments/${pinId}/${id}`)
      .then((res) => {
        fetchPinComments();
      })
      .catch((e) => {
        toast.error(errorMessage);
        // console.log(e);
      });
  };

  const fetchPinDetails = () => {
    setPinDetail(null);
    axios
      .get(`/api/pins/${pinId}`)
      .then((res) => {
        setPinDetail(res?.data?.pin);
        setAlreadySaved(
          res?.data?.pin?.saved?.find((item) => item === user?._id)
        );
        setSavedLenth(res?.data?.pin?.saved?.length);

        router.replace(
          {
            pathname: pathname,
            query: {
              pinId,
              type: "pins",
              category: res.data.pin.category,
            },
          },
          undefined,
          { shallow: true }
        );
      })
      .catch((e) => {
        toast.error(errorMessage);
        // console.log(e);
      });
  };

  useEffect(() => {
    user?._id && setAlreadySaved(saved?.find((item) => item === user?._id));
  }, [user, pinDetail]);

  useEffect(() => {
    pinId && fetchPinDetails();
    pinId && fetchPinComments();
    pinId && fetchPinHistory();
  }, [pinId, refresh]);

  const updatePin = (body) => {
    axios
      .put(`/api/pins/${_id}`, body)
      .then((res) => {
        setAddingSellPrice(false);
        setInputPrice("");
        setRefresh((prev) => !prev);
        dispatch({
          type: GIFTING_USER_SET,
          payload: {},
        });
        setLoading(false);
        toast.success(finalSuccessMessage);
      })
      .catch((e) => {
        toast.error(finalErrorMessage);
        setAddingSellPrice(false);
        setInputPrice("");
        setLoading(false);
      });
  };

  const transferPin = (body) => {
    axios
      .post(`/api/pins/history/${_id}`, body)
      .then((res) => {
        // toast.success("tranferred success");
      })
      .catch((e) => {
        // toast.error("could not be transferred");
      });
  };

  const giftMarketItem = async () => {
    if (!user?._id) {
      toast.info(loginMessage);
      return;
    }

    if (!giftingUser?._id) {
      toast.info(giftUserSelectInfoMessage);
      setActiveBtn("Gift This NFT To Someone");

      router.push(
        {
          pathname: pathname,
          query: {
            pinId,
            type: "users",
            page: 1
          },
        },
        undefined,
        { shallow: true }
      );
      return;
    }

    setLoading(true);
    setLoadingMessage(confirmLoadingMessage);
    const web3Modal = new Web3Modal();
    const connection = await web3Modal.connect();
    const provider = new ethers.providers.Web3Provider(connection);
    const signer = provider.getSigner();

    // get approval
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

    // execute Market Sale function
    try {
      contract = new ethers.Contract(nftmarketaddress, Market.abi, signer);
      console.log(nftaddress, itemId, giftingUser?.address);
      transaction = await contract.giftMarketItem(
        nftaddress,
        itemId,
        giftingUser?.address
      );
      setLoadingMessage(giftLoadingMessage);
      const tx = await transaction.wait();
      toast.success(tokenGiftSuccessMessage);
      console.log(tx.events, "DDDDDDDDDDDDDDDDDDDD");
      const event = tx.events[2];
      var eventData = getEventData(event);
      console.log(eventData);
    } catch (e) {
      toast.error(tokenGiftErrorMessage);
      setLoading(false);
      return;
    }

    // transfer asset
    const transferObj = {
      user: giftingUser?._id,
      price: "0.0",
    };
    transferPin(transferObj);

    // upadate pin in the database
    updatePin({
      ...eventData,
      postedBy: giftingUser?._id,
      destination: "https://nft-nation.vercel.app",
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
      const auctionPrice = parseAmount(price);
      // const auctionPrice = ethers.utils.parseUnits(price, "ether");
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

    // transfer asset
    const transferObj = {
      user: user?._id,
      price,
    };
    transferPin(transferObj);

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
      // const auctionPrice = ethers.utils.parseUnits(inputPrice, "ether");
      const auctionPrice = parseAmount(inputPrice);
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
      // const auctionBid = ethers.utils.parseUnits(inputPrice, "ether");
      const auctionBid = parseAmount(inputPrice);
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
      console.log(e, "^^^^^^^^^^^^^^");
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
      console.log(tx.events, "DDDDDDDDDDDDDDDDDDDDDDDDDDDDDD");
      console.log(eventData);
    } catch (e) {
      console.log(e, "^^^^^^^^^^^^^^^^^^^^^");
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
      console.log(e, "^^^^^^^^^^^^^^^^^^^^^^^^^");
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
      console.log(e, "^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^");
      toast.error(tokenAuctionEndErrorMessage);
      setLoading(false);
      return;
    }

    // transfer asset
    if (bids?.length) {
      const transferObj = {
        user: newOwner?._id,
        price,
      };

      transferPin(transferObj);
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
          fetchPinComments();
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
        setRefresh((prev) => !prev);
        setLoading(false);
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
        setRefresh((prev) => !prev);
        setLoading(false);
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

    if (savingPost) {
      return;
    }

    setSavingPost(true);
    axios
      .put(`/api/pins/save/${_id}`, {
        user: user?._id,
      })
      .then((res) => {
        // toast.success(alreadySaved ? unsaveSuccessMessage : saveSuccessMessage);
        setSavedLenth((prev) => (alreadySaved ? prev - 1 : prev + 1));
        setAlreadySaved((prev) => !prev);
        setSavingPost(false);
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
      text: `Gift`,
      condition: createMarketSaleCondition,
      function: giftMarketItem,
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
          ? ` (Current Bid: ${getMaxBid(bids).bid} Matic)`
          : ` (No Bids Yet)`
      }`,
      condition: executeMarketAuctionEndCondition,
      function: executeMarketAuctionEnd,
    },
    {
      text: `Make a Bid${
        bids?.length
          ? ` (Current Bid: ${getMaxBid(bids).bid} Matic)`
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
              className="shadow-lg rounded-lg"
              height={500}
              width={480}
              objectFit="cover"
              src={getImage(image)}
            />

            <div className="w-full px-5 flex-1 xl:min-w-620 mt-4">
              <div className="flex flex-wrap justify-center lg:gap-2">
                {[
                  {
                    name: "properties",
                    text: `Properties${
                      properties?.length ? ` (${properties?.length})` : ``
                    }`,
                    condition: true,
                    func: () => setTab("properties"),
                  },
                  {
                    name: "comments",
                    text: `Comments${
                      pinComments?.length ? ` (${pinComments?.length})` : ``
                    }`,
                    condition: true,
                    func: () => setTab("comments"),
                  },
                  {
                    name: "bids",
                    text: `Bids${bids?.length ? ` (${bids?.length})` : ``}`,
                    condition: highestBidShowCondition,
                    func: () => setTab("bids"),
                  },
                  {
                    name: "history",
                    text: `History`,
                    condition: true,
                    func: () => setTab("history"),
                  },
                ].map((item, index) => {
                  if (item?.condition)
                    return (
                      <button
                        className="mt-1"
                        key={index}
                        onClick={() => item?.func()}
                      >
                        <span className={`${buttonStyle} text-xl`}>
                          {item?.text}
                        </span>
                      </button>
                    );
                })}
              </div>

              <div className="max-h-370 h-370 overflow-y-scroll">
                {tab === "properties" && (
                  <h2 className="flex justify-center items-center h-370 mt-0 text-xl font-bold">{`No Properties...`}</h2>
                )}
                {tab === "properties" &&
                  false &&
                  pinComments?.map((item) => (
                    <div
                      key={`${item?._id}`}
                      className="p-2 bg-gradient-to-r from-secondTheme to-themeColor flex gap-2 mt-5 items-center bg-secondTheme rounded-lg"
                    >
                      {item?.user?._id && (
                        <Link href={`/user-profile/${item?.user?._id}`}>
                          <div>
                            <Image
                              height={40}
                              width={40}
                              src={getImage(item?.user?.image)}
                              className="w-10 h-10 rounded-full cursor-pointer"
                              alt="user-profile"
                            />
                          </div>
                        </Link>
                      )}
                      <div className="flex flex-col">
                        <p className="font-bold">
                          {getUserName(item?.user?.userName)}
                        </p>
                        <p className="font-semibold">{item.comment}</p>
                      </div>
                    </div>
                  ))}

                {tab === "bids" && !bids?.length && (
                  <h2 className="flex justify-center items-center h-370 mt-0 text-xl font-bold">{`No Bids Yet, Be the first one to make a Bid...`}</h2>
                )}

                {tab === "bids" &&
                  bids?.length > 0 &&
                  bids?.map((item) => (
                    <div
                      key={`${item?._id}`}
                      className="p-2 bg-gradient-to-r from-secondTheme to-themeColor flex gap-2 mt-5 items-center bg-secondTheme rounded-lg"
                    >
                      {item?.user?._id && (
                        <Link href={`/user-profile/${item?.user?._id}`}>
                          <div>
                            <Image
                              height={45}
                              width={45}
                              src={getImage(item?.user?.image)}
                              className="w-12 h-12 rounded-full cursor-pointer"
                              alt="user-profile"
                            />
                          </div>
                        </Link>
                      )}
                      <div className="flex flex-col">
                        <p className="font-bold">
                          {getUserName(item?.user?.userName)}
                        </p>
                        <p className="font-bold">{`${item.bid} Matic`}</p>
                      </div>
                    </div>
                  ))}

                {tab === "comments" && !pinComments?.length && !sideLoading && (
                  <h2 className="flex justify-center items-center h-370 text-xl font-bold">{`No Comments Yet, Be the first one to comment...`}</h2>
                )}

                {tab === "comments" && !pinComments?.length && sideLoading && (
                  <Spinner title={loadingMessage} />
                )}

                {tab === "comments" &&
                  pinComments.length > 0 &&
                  pinComments?.map((item) => (
                    <div
                      key={`${item?._id}`}
                      className="p-2 bg-gradient-to-r from-secondTheme to-themeColor flex gap-2 mt-5 items-center bg-secondTheme rounded-lg"
                    >
                      {item?.user?._id && (
                        <Link href={`/user-profile/${item?.user?._id}`}>
                          <div>
                            <Image
                              height={45}
                              width={45}
                              src={getImage(item?.user?.image)}
                              className="w-12 h-12 rounded-full cursor-pointer"
                              alt="user-profile"
                            />
                          </div>
                        </Link>
                      )}
                      <div className="flex flex-col">
                        <p className="font-bold">
                          {getUserName(item?.user?.userName)}
                        </p>
                        <p className="font-semibold">{item.comment}</p>
                      </div>
                      {item?.user?._id === user?._id && (
                        <div className="flex flex-col ml-auto">
                          <MdDeleteForever
                            onClick={() => {
                              deleteComment(item?._id);
                            }}
                            size={25}
                            className="cursor-pointer text-[#ff7f7f]"
                          />
                        </div>
                      )}
                    </div>
                  ))}

                {tab === "history" && !pinHistory?.length && !sideLoading && (
                  <h2 className="flex justify-center items-center h-370 mt-0 text-xl font-bold">{`No History...`}</h2>
                )}

                {tab === "history" &&
                  pinHistory?.length > 0 &&
                  pinHistory?.map((item, index) => (
                    <div
                      key={`${item?._id}`}
                      className="p-2 bg-gradient-to-r from-secondTheme to-themeColor flex gap-2 mt-5 items-center bg-secondTheme rounded-lg"
                    >
                      {item?.user?._id && (
                        <Link href={`/user-profile/${item?.user?._id}`}>
                          <div>
                            <Image
                              height={40}
                              width={40}
                              src={getImage(item?.user?.image)}
                              className="w-12 h-12 rounded-full cursor-pointer"
                              alt="user-profile"
                            />
                          </div>
                        </Link>
                      )}
                      <div className="flex justify-between gap-2 md:gap-8">
                        <div className="flex flex-wrap">
                          <p className=" font-bold">
                            {`${getUserName(item?.user?.userName)}`}
                          </p>
                        </div>
                        <div className="flex flex-wrap">
                          <p className="font-semibold">{`${
                            index === pinHistory.length - 1
                              ? `Minted on`
                              : `Transferred on`
                          }: ${moment(new Date(item?.createdAt)).format(
                            "MMM DD, YYYY"
                          )}`}</p>
                        </div>
                        <div className="flex flex-wrap">
                          {index !== pinHistory.length - 1 && (
                            <p className="font-semibold">{`For: ${item?.price} Matic`}</p>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
              </div>

              {tab === "comments" && (
                <div className="flex flex-wrap mt-6 gap-3">
                  {user?._id && (
                    <Link href={`/user-profile/${user?._id}`}>
                      <div>
                        <Image
                          height={45}
                          width={45}
                          src={getImage(user?.image)}
                          className="w-14 h-14 rounded-full cursor-pointer pt-2"
                          alt="user-profile"
                        />
                      </div>
                    </Link>
                  )}
                  <input
                    className=" flex-1 border-gray-100 outline-none border-2 p-2 mb-0 rounded-2xl focus:border-gray-300"
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
              )}
            </div>
          </div>

          <div className="block lg:flex text-left items-center mb-1 pl-5 w-full justify-evenly">
            {postedBy?._id && (
              <Link href={`/user-profile/${postedBy?._id}`}>
                <div className="cursor-pointer flex items-center mb-4 lg:mb-0 w-full lg:w-auto mr-2 transition transition duration-500 ease transform hover:-translate-y-1">
                  <p className="inline align-middle text-sm mr-2 font-bold">
                    {`Owner: `}
                  </p>
                  <Image
                    alt={pinDetail.postedBy.userName}
                    height={35}
                    width={35}
                    className="align-middle rounded-full"
                    src={getImage(postedBy?.image)}
                  />

                  <p className="inline align-middle text-sm ml-1 font-bold">
                    {getUserName(postedBy?.userName)}
                  </p>
                </div>
              </Link>
            )}
            {createdBy?._id && (
              <Link href={`/user-profile/${createdBy?._id}`}>
                <div className="cursor-pointer flex items-center mb-4 lg:mb-0 w-full lg:w-auto mr-2 transition transition duration-500 ease transform hover:-translate-y-1">
                  <p className="inline align-middle text-sm mr-2 font-bold">
                    {`Minter: `}
                  </p>
                  <Image
                    alt={createdBy.userName}
                    height={35}
                    width={35}
                    className="align-middle rounded-full"
                    src={getImage(createdBy?.image)}
                  />

                  <p className="inline align-middle text-sm ml-1 font-bold">
                    {getUserName(createdBy?.userName)}
                  </p>
                </div>
              </Link>
            )}
          </div>
          <h1 className="transition duration-700 text-center mb-2 cursor-pointer hover:text-pink-600 text-2xl font-semibold">
            <p>{`#${tokenId} ${title}`}</p>
          </h1>
          <p className="text-center text-md text-gray-700 font-bold px-4 lg:px-20 mb-5">
            {about}
          </p>

          <div className="flex flex-wrap justify-center">
            <div className="font-bold text-sm mr-2 mb-1">
              <span className={buttonStyle}>{`Minted ${moment(
                createdAt
              ).fromNow()}`}</span>
            </div>
            {(priceShowCondition || highestBidShowCondition) && (
              <div className="font-bold text-sm mr-2 mb-1">
                <span className={buttonStyle}>
                  {priceShowCondition
                    ? `On Sale (Price: ${price} Matic)`
                    : `On Auction ${
                        bids?.length
                          ? ` (Current Bid: ${getMaxBid(bids)?.bid} Matic)`
                          : ` (No Bids Yet)`
                      }`}
                </span>
              </div>
            )}

            <div className="font-bold text-sm mr-2 mb-1">
              <span
                onClick={(e) => {
                  e.stopPropagation();
                  navigator.clipboard.writeText(`${nftContract}`);
                  toast.info(contractAddressCopiedMessage);
                }}
                className={buttonStyle}
              >
                {`Contract Address`}
              </span>
            </div>

            <div className="font-bold text-sm mr-2 mb-1">
              <span className={buttonStyle}>{`Token ID: ${tokenId}`}</span>
            </div>

            <div className="font-bold text-sm mr-2 mb-1">
              <a
                onClick={(e) => {
                  e.stopPropagation();
                }}
                href={getIpfsImage(image)}
                target="_blank"
              >
                <span className={buttonStyle}>{`IPFS`}</span>
              </a>
            </div>

            <div className="font-bold text-sm mr-2 mb-1">
              <a
                onClick={(e) => {
                  e.stopPropagation();
                }}
                href={`https://ropsten.etherscan.io/token/${nftContract}?a=${tokenId}`}
                target="_blank"
              >
                <span className={buttonStyle}>{`Etherscan`}</span>
              </a>
            </div>
          </div>
          <div className="p-2 mt-3 bg-gradient-to-r from-themeColor to-secondTheme rounded-lg drop-shadow-lg flex flex-wrap text-center justify-evenly">
            {buttonArray?.map((item, index) => {
              if (item?.condition) {
                return (
                  <button key={index} onClick={item?.function}>
                    <span className={tabButtonStyles}>{item?.text} </span>
                  </button>
                );
              }
            })}
            <button className={tabButtonStyles}>
              <div className="flex gap-2 items-center">
                <p className="font-semibold hover:font-extrabold hover:cursor-pointer">
                  {savedLength}
                </p>
                {!savingPost ? (
                  <span>
                    {!alreadySaved ? (
                      <AiOutlineHeart
                        onClick={(e) => {
                          e.stopPropagation();
                          savePin();
                        }}
                        className="text-[#ffffff] transition transition duration-500 ease transform hover:-translate-y-1 drop-shadow-lg cursor-pointer"
                        size={25}
                      />
                    ) : (
                      <AiFillHeart
                        onClick={(e) => {
                          e.stopPropagation();
                          savePin();
                        }}
                        className="text-[#a83f39] transition transition duration-500 ease transform hover:-translate-y-1 drop-shadow-lg cursor-pointer"
                        size={25}
                      />
                    )}
                  </span>
                ) : (
                  <AiOutlineLoading3Quarters
                    onClick={(e) => {
                      e.stopPropagation();
                      // savePin();
                    }}
                    className="animate-spin text-[#ffffff] drop-shadow-lg cursor-pointer"
                    size={20}
                  />
                )}
              </div>
            </button>
            <button className={tabButtonStyles}>
              <div className="flex gap-2 items-center">
                <FaShareAlt
                  onClick={(e) => {
                    e.stopPropagation();
                    navigator.clipboard.writeText(
                      `https:nft-nation.vercel.app/pin-detail/${pinId}`
                    );
                    toast.info(shareInfoMessage);
                  }}
                  className="text-[#ffffff] transition transition duration-500 ease transform hover:-translate-y-1 drop-shadow-lg cursor-pointer"
                  size={25}
                />
              </div>
            </button>
          </div>
          {(makeAuctionBidCondition || createMarketSaleCondition) &&
            (addingBidPrice || addingSellPrice) && (
              <div className="mt-4 p-2 bg-gradient-to-r from-themeColor to-secondTheme rounded-lg drop-shadow-lg flex flex-wrap text-center justify-evenly">
                <div className="flex flex-wrap m-2 gap-3">
                  {user?._id && (
                    <Link href={`/user-profile/${user?._id}`}>
                      <div>
                        <Image
                          height={45}
                          width={45}
                          src={getImage(user?.image)}
                          className="w-14 h-14 rounded-full cursor-pointer hover:shadow-lg"
                          alt="user-profile"
                        />
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
      <>
        <div className="flex flex-wrap justify-evenly mt-2 mb-2">
          {[
            {
              name: `More NFTs Like This`,
              text: `More NFTs Like This`,
              query: {
                type: "pins",
                category,
                page: 1,
              },
              condition: true,
            },
            {
              name: "Gift This NFT To Someone",
              text: "Gift This NFT To Someone",
              query: {
                type: "users",
                page: 1,
              },
              condition: createMarketSaleCondition,
            },
          ].map((item, index) => {
            if (item?.condition)
              return (
                <button
                  key={index}
                  onClick={(e) => {
                    setActiveBtn(item.name);

                    router.push(
                      {
                        pathname: pathname,
                        query: {
                          pinId,
                          ...item?.query,
                        },
                      },
                      undefined,
                      { shallow: true }
                    );
                  }}
                  className={`${buttonStyle} ${
                    activeBtn === item?.name
                      ? ``
                      : `bg-transparent text-[#000000]`
                  }`}
                >
                  {item?.text}
                </button>
              );
          })}
        </div>
        <Feed />
      </>
    </>
  );
};

export default PinDetail;
