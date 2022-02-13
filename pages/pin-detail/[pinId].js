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
  fetcher,
  getCurrentBid,
  getEventData,
  getHistoryDescription,
  getImage,
  getIpfsImage,
  getUserBid,
  getUserName,
  iconStyles,
  isValidAmount,
  parseAmount,
  sendNotifications,
  tabButtonStyles,
  basePath,
  getGatewayImage
} from "../../utils/data";
import {
  acceptOfferLoadingMessage,
  approvalLoadingMessage,
  bidAmountInfoMessage,
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
  fetchingBidsLoadingMessage,
  fetchingCommentsLoadingMessage,
  fetchingHistoryLoadingMessage,
  fetchingLoadingMessage,
  fetchingNFTLoadingMessage,
  fetchingOffersLoadingMessage,
  fetchingPropertiesLoadingMessage,
  finalErrorMessage,
  finalProcessingErrorMessage,
  finalSuccessMessage,
  giftLoadingMessage,
  giftUserSelectInfoMessage,
  loginMessage,
  makeBidLoadingMessage,
  makeOfferLoadingMessage,
  pendingOffersInfoMessage,
  rejectAllOffersLoadingMessage,
  rejectOfferLoadingMessage,
  saveErrorMessage,
  tokenAllOfferRejectSuccessMessage,
  tokenAllOffersRejectErrorMessage,
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
  tokenOfferAcceptErrorMessage,
  tokenOfferAcceptSuccessMessage,
  tokenOfferErrorMessage,
  tokenOfferRejectErrorMessage,
  tokenOfferRejectSuccessMessage,
  tokenOfferSuccessMessage,
  tokenOfferWithdrawErrorMessage,
  tokenOfferWithdrawSuccessMessage,
  tokenSaleCancelErrorMessage,
  tokenSaleCancelSuccessMessage,
  tokenSaleErrorMessage,
  tokenSaleSuccessMessage,
  validAmountErrorMessage,
  waitLoadingMessage,
  withdrawOfferLoadingMessage,
  withrawBidLoadingMessage,
} from "../../utils/messages";
import { useRouter } from "next/router";
import axios from "axios";
import Head from "next/head";
import Image from "next/image";
import { FaCheckCircle } from "react-icons/fa";
import { toast } from "react-toastify";
import { Feed } from "../../components";
import {
  AiFillHeart,
  AiOutlineHeart,
  AiOutlineLoading3Quarters,
} from "react-icons/ai";
import moment from "moment";
import { MdCancel } from "react-icons/md";
import { GIFTING_USER_SET } from "../../redux/constants/UserTypes";
import useSWR from "swr";
import CommentSection from "../../components/CommentSection";
import ShareButtons from "../../components/ShareButtons";
// import { wrapper } from "../../redux/store";

const PinDetail = ({detail, data = []}) => {
  // const CancelToken = axios.CancelToken;
  // const source = CancelToken.source();

  const router = useRouter();
  const dispatch = useDispatch();
  const { pathname } = router;
  const { pinId } = router.query;
  const { user, giftingUser, marketContract, navigating } = useSelector(
    (state) => state.userReducer
  );
  const [refresh, setRefresh] = useState(false);
  const [pinDetail, setPinDetail] = useState(detail);
  const [pinComments, setPinComments] = useState([]);
  const [commentReplies, setCommentReplies] = useState({});
  const [showCommentReplies, setShowCommentReplies] = useState({});
  const [pinHistory, setPinHistory] = useState([]);
  const [pinProperties, setPinProperties] = useState([]);
  const [pinBids, setPinBids] = useState([]);
  const [pinOffers, setPinOffers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [comment, setComment] = useState("");
  const [inputPrice, setInputPrice] = useState("");
  const [addingComment, setAddingComment] = useState(false);
  const [deletingComment, setDeletingComment] = useState("");
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
    currentBid,
    bidsCount,
    offersCount,
    startingBid,
    saved,
    commentsCount,
    nftContract,
    itemId,
    tokenId,
    price,
    auctionEnded,
    onSale,
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
    currentBid: "",
    bidsCount: 0,
    offersCount: 0,
    startingBid: "",
    saved: [],
    commentsCount: 0,
    nftContract: "",
    itemId: "",
    tokenId: "",
    price: "",
    category: "",
    image: "",
    auctionEnded: true,
    onSale: false,
    properties: [],
    history: [],
    postedBy: {},
    createdBy: {},
    createdAt: new Date(),
  };

  const executeMarketSaleCondition =
    price !== "0.0" && onSale && postedBy?._id !== user?._id && auctionEnded;

  const createMarketSaleCondition =
    price === "0.0" && postedBy?._id === user?._id && !onSale && auctionEnded;

  const cancelMarketSaleCondition =
    price !== "0.0" && postedBy?._id === user?._id && onSale && auctionEnded;

  const createMarketAuctionCondition =
    price === "0.0" && postedBy?._id === user?._id && !onSale && auctionEnded;

  const executeMarketAuctionEndCondition =
    price === "0.0" && postedBy?._id === user?._id && !onSale && !auctionEnded;

  const makeAuctionBidCondition =
    postedBy?._id !== user?._id &&
    !onSale &&
    !pinBids?.find((bid) => bid.user?._id === user?._id) &&
    !auctionEnded;

  const withdrawAuctionBidCondition =
    postedBy?._id !== user?._id &&
    !onSale &&
    pinBids?.find((bid) => bid.user?._id === user?._id) &&
    !auctionEnded;

  const makeOfferCondition =
    postedBy?._id !== user?._id &&
    !onSale &&
    !pinOffers?.find((bid) => bid.user?._id === user?._id) &&
    auctionEnded;

  const withdrawOfferCondition =
    postedBy?._id !== user?._id &&
    !onSale &&
    pinOffers?.find((bid) => bid.user?._id === user?._id) &&
    auctionEnded;

  const priceShowCondition = price !== "0.0" && onSale && auctionEnded;

  const highestBidShowCondition = price === "0.0" && !onSale && !auctionEnded;

  const offersShowCondition = price === "0.0" && !onSale && auctionEnded;

  const fetchPinProperties = () => {
    setLoadingMessage(fetchingPropertiesLoadingMessage);
    setSideLoading(true);
    axios
      .get(`/api/pins/properties/${pinId}`)
      .then((res) => {
        setPinProperties(res?.data?.attributes);
        setSideLoading(false);
      })
      .catch((e) => {
        toast.error(errorMessage);
        setSideLoading(false);
        // console.log(e);
      });
  };

  const fetchPinBids = () => {
    setLoadingMessage(fetchingBidsLoadingMessage);
    setSideLoading(true);
    axios
      .get(`/api/pins/bids/${pinId}`)
      .then((res) => {
        setPinBids(res?.data?.bids);
        setSideLoading(false);
      })
      .catch((e) => {
        toast.error(errorMessage);
        setSideLoading(false);
        // console.log(e);
      });
  };

  const fetchPinOffers = () => {
    setLoadingMessage(fetchingOffersLoadingMessage);
    setSideLoading(true);
    axios
      .get(`/api/pins/offers/${pinId}`)
      .then((res) => {
        setPinOffers(res?.data?.offers);
        setSideLoading(false);
      })
      .catch((e) => {
        toast.error(errorMessage);
        setSideLoading(false);
        // console.log(e);
      });
  };

  const fetchPinHistory = () => {
    setSideLoading(true);
    setLoadingMessage(fetchingHistoryLoadingMessage);
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
    setLoadingMessage(fetchingCommentsLoadingMessage);
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

  const fetchPinCommentReplies = () => {
    setLoadingMessage(fetchingCommentsLoadingMessage);
    setSideLoading(true);
    axios
      .get(`/api/pins/comments/reply/${pinId}/${showCommentReplies?._id}`)
      .then((res) => {
        setCommentReplies(res?.data?.comments);
        setSideLoading(false);
      })
      .catch((e) => {
        toast.error(errorMessage);
        setSideLoading(false);
        // console.log(e);
      });
  };

  const deleteComment = (id) => {
    setDeletingComment(id);
    axios
      .delete(`/api/pins/comments/${pinId}/${id}`)
      .then((res) => {
        setDeletingComment("");
        fetchPinComments();
      })
      .catch((e) => {
        setDeletingComment("");
        toast.error(errorMessage);
        // console.log(e);
      });
  };

  const deleteCommentReply = (id) => {
    setDeletingComment(id);
    axios
      .delete(
        `/api/pins/comments/reply/${pinId}/${showCommentReplies?._id}/${id}`
      )
      .then((res) => {
        setDeletingComment("");
        fetchPinCommentReplies();
      })
      .catch((e) => {
        setDeletingComment("");
        toast.error(errorMessage);
        // console.log(e);
      });
  };

  const { data: swrData, error } = useSWR(
    () => (pinId ? `/api/pins/${pinId}` : null),
    fetcher,
    {
      refreshInterval: 15000,
      onSuccess: (data, key, config) => {
        setPinDetail(data?.pin);
      },
    }
  );

  const fetchPinDetails = () => {
    // setPinDetail(null);
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
    setPinDetail(detail)
  }, [detail])

  useEffect(() => {
    pinId && fetchPinDetails();
  }, [pinId, refresh]);

  useEffect(() => {
    pinId && fetchPinComments();
    pinId && fetchPinBids();
    pinId && fetchPinHistory();
    pinId && fetchPinOffers();
    pinId && fetchPinProperties();
  }, [pinId]);

  useEffect(() => {
    setShowCommentReplies({});
    if (pinId) {
      if (tab === "comments") {
        fetchPinComments();
      } else if (tab === "history") {
        fetchPinHistory();
      } else if (tab === "offers") {
        fetchPinOffers();
      } else if (tab === "bids") {
        fetchPinBids();
      } else if (tab === "properties") {
        // fetchPinProperties();
      }
    }

    // return () => source.cancel("Operation Cancelled By The User!");
  }, [tab, pinId]);

  useEffect(() => {
    showCommentReplies?._id && fetchPinCommentReplies();
  }, [showCommentReplies]);

  const updatePin = (body) => {
    axios
      .put(`/api/pins/${_id}`, body)
      .then((res) => {
        setAddingSellPrice(false);
        setAddingBidPrice(false);
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
        // setAddingSellPrice(false);
        // setAddingBidPrice(false)
        // setInputPrice("");
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

    if (pinOffers?.length) {
      toast.info(pendingOffersInfoMessage);
      setTab("offers");
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
            page: 1,
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
      console.log(nftaddress, itemId, giftingUser?._id);
      transaction = await contract.giftMarketItem(itemId, giftingUser?._id);
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
      type: "Gift",
    };
    transferPin(transferObj);

    // ownership transfer as a gift notification
    try {
      let to = [
        ...pinComments.map((item) => item?.user),
        ...saved,
        ...user?.followers,
        createdBy?._id,
        postedBy?._id,
      ];
      to = [...new Set(to)];
      to = to.filter((item) => item !== user?._id);
      to = to.map((item) => ({ user: item }));

      const obj = {
        type: "NFT Gifted",
        byUser: user?._id,
        toUser: giftingUser?._id,
        pin: _id,
        to,
      };

      sendNotifications(
        obj,
        (res) => {
          // console.log(res);
        },
        (e) => {
          // console.log(e, "DDDDDDDDDDddddd");
        }
      );
    } catch (e) {
      console.log(e, "DDDDDDDDDDDDDDDDDDDdd");
    }

    // upadate pin in the database
    updatePin({
      ...eventData,
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
      const transaction = await contract.executeMarketSale(itemId, {
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
      type: "Sale",
      amount: price,
    };
    transferPin(transferObj);

    // ownership transfer notification
    try {
      let to = [
        ...pinComments.map((item) => item?.user),
        ...saved,
        ...user?.followers,
        createdBy?._id,
        postedBy?._id,
      ];
      to = [...new Set(to)];
      to = to.filter((item) => item !== user?._id);
      to = to.map((item) => ({ user: item }));

      const obj = {
        type: "NFT Sold",
        toUser: user?._id,
        byUser: postedBy?._id,
        price,
        pin: _id,
        to,
      };

      sendNotifications(
        obj,
        (res) => {
          // console.log(res);
        },
        (e) => {
          // console.log(e, "DDDDDDDDDDddddd");
        }
      );
    } catch (e) {
      console.log(e, "DDDDDDDDDDDDDDDDDDDdd");
    }

    // upadate pin in the database
    updatePin({
      ...eventData,
    });
  };

  const createMarketSale = async () => {
    if (!user?._id) {
      toast.info(loginMessage);
      return;
    }

    if (pinOffers?.length) {
      toast.info(pendingOffersInfoMessage);
      setTab("offers");
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
      transaction = await contract.createMarketSale(itemId, auctionPrice);
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

    // sale created notification
    try {
      let to = [
        ...pinComments.map((item) => item?.user),
        ...saved,
        ...user?.followers,
        createdBy?._id,
        postedBy?._id,
      ];
      to = [...new Set(to)];
      to = to.filter((item) => item !== user?._id);
      to = to.map((item) => ({ user: item }));

      const obj = {
        type: "Up For Sale",
        byUser: user?._id,
        price: inputPrice,
        pin: _id,
        to,
      };

      sendNotifications(
        obj,
        (res) => {
          // console.log(res);
        },
        (e) => {
          // console.log(e, "DDDDDDDDDDddddd");
        }
      );
    } catch (e) {
      console.log(e, "DDDDDDDDDDDDDDDDDDDdd");
    }

    updatePin({
      ...eventData,
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

    if (inputPrice <= getCurrentBid(currentBid, startingBid)) {
      toast.info(bidAmountInfoMessage);
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

    if (pinOffers?.length) {
      toast.info(pendingOffersInfoMessage);
      setTab("offers");
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
      transaction = await contract.createMarketAuction(itemId);
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

    // notify auction created
    try {
      let to = [
        ...pinComments.map((item) => item?.user),
        ...saved,
        ...user?.followers,
        createdBy?._id,
        postedBy?._id,
      ];
      to = [...new Set(to)];
      to = to.filter((item) => item !== user?._id);
      to = to.map((item) => ({ user: item }));

      const obj = {
        type: "Up For Auction",
        byUser: user?._id,
        pin: _id,
        to,
      };

      sendNotifications(
        obj,
        (res) => {
          // console.log(res);
        },
        (e) => {
          // console.log(e, "DDDDDDDDDDddddd");
        }
      );
    } catch (e) {
      console.log(e, "DDDDDDDDDDDDDDDDDDDdd");
    }

    updatePin({
      ...eventData,
      startingBid: inputPrice,
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
      const transaction = await contract.executeMarketAuctionEnd(itemId);
      setLoadingMessage(cancelAuctionLoadingMessage);
      const tx = await transaction.wait();
      console.log(tx);
      toast.success(tokenAuctionEndSuccessMessage);
      const event = tx.events[2];
      var eventData = getEventData(event);
      console.log(eventData);
      var newOwner = eventData?.postedBy;
    } catch (e) {
      console.log(e, "^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^");
      toast.error(tokenAuctionEndErrorMessage);
      setLoading(false);
      return;
    }

    // transfer asset
    if (newOwner !== user?._id) {
      const transferObj = {
        user: newOwner,
        type: "Bid",
        amount: currentBid,
      };

      transferPin(transferObj);
    }

    // notify auctionEnded or ownership transferred
    try {
      let to = [
        ...pinBids.map((item) => item?.user),
        ...pinComments.map((item) => item?.user),
        ...saved,
        ...user?.followers,
        createdBy?._id,
        postedBy?._id,
      ];
      to = [...new Set(to)];
      to = to.filter((item) => item !== user?._id);
      to = to.map((item) => ({ user: item }));

      const obj = {
        type: "Auction Ended",
        byUser: user?._id,
        ...(newOwner !== user?._id ? { toUser: newOwner?._id } : {}),
        ...(newOwner !== user?._id ? { currentBid } : {}),
        pin: _id,
        to,
      };

      sendNotifications(
        obj,
        (res) => {
          // console.log(res);
        },
        (e) => {
          // console.log(e, "DDDDDDDDDDddddd");
        }
      );
    } catch (e) {
      console.log(e, "DDDDDDDDDDDDDDDDDDDdd");
    }

    updatePin({
      ...eventData,
      startingBid: "0.0",
      // currentBid: "0.0",
      bids: [],
    });
  };

  const rejectAllMarketItemOffers = async () => {
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
      const transaction = await contract.rejectAllOffers(itemId);
      setLoadingMessage(rejectAllOffersLoadingMessage);
      const tx = await transaction.wait();
      console.log(tx);
      toast.success(tokenAllOfferRejectSuccessMessage);
      const event = tx.events[0];
      var eventData = getEventData(event);
      console.log(eventData);
      var newOwner = eventData?.postedBy;
    } catch (e) {
      console.log(e, "^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^");
      toast.error(tokenAllOffersRejectErrorMessage);
      setLoading(false);
      return;
    }

    // notify offers rejected
    try {
      let to = [
        ...pinOffers.map((item) => item?.user),
        ...pinComments.map((item) => item?.user),
        ...saved,
        ...user?.followers,
        createdBy?._id,
        postedBy?._id,
      ];
      to = [...new Set(to)];
      to = to.filter((item) => item !== user?._id);
      to = to.map((item) => ({ user: item }));

      const obj = {
        type: "Offers Rejected",
        byUser: user?._id,
        pin: _id,
        to,
      };

      sendNotifications(
        obj,
        (res) => {
          // console.log(res);
        },
        (e) => {
          // console.log(e, "DDDDDDDDDDddddd");
        }
      );
    } catch (e) {
      console.log(e, "DDDDDDDDDDDDDDDDDDDdd");
    }

    updatePin({
      ...eventData,
    });
  };

  const acceptMarketItemOffer = async (offeringAddress, offer) => {
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

    try {
      const contract = new ethers.Contract(
        nftmarketaddress,
        Market.abi,
        signer
      );
      const transaction = await contract.acceptOffer(itemId, offeringAddress);
      setLoadingMessage(acceptOfferLoadingMessage);
      const tx = await transaction.wait();
      console.log(tx);
      toast.success(tokenOfferAcceptSuccessMessage);
      const event = tx.events[2];
      var eventData = getEventData(event);
      console.log(eventData);
      var newOwner = eventData?.postedBy;
    } catch (e) {
      console.log(e, "^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^");
      toast.error(tokenOfferAcceptErrorMessage);
      setLoading(false);
      return;
    }

    // transfer asset
    const transferObj = {
      user: newOwner,
      type: "Offer",
      amount: offer,
    };

    transferPin(transferObj);

    // notify offer Accepted
    try {
      let to = [
        ...pinOffers.map((item) => item?.user),
        ...pinComments.map((item) => item?.user),
        ...saved,
        ...user?.followers,
        createdBy?._id,
        postedBy?._id,
      ];
      to = [...new Set(to)];
      to = to.filter((item) => item !== user?._id);
      to = to.map((item) => ({ user: item }));

      const obj = {
        type: "Offer Accepted",
        byUser: user?._id,
        toUser: newOwner,
        pin: _id,
        to,
      };

      sendNotifications(
        obj,
        (res) => {
          // console.log(res);
        },
        (e) => {
          // console.log(e, "DDDDDDDDDDddddd");
        }
      );
    } catch (e) {
      console.log(e, "DDDDDDDDDDDDDDDDDDDdd");
    }

    updatePin({
      ...eventData,
    });
  };

  const rejectMarketItemOffer = async (offeringAddress) => {
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
      const transaction = await contract.rejectOffer(itemId, offeringAddress);
      setLoadingMessage(rejectOfferLoadingMessage);
      const tx = await transaction.wait();
      console.log(tx.events, "DDDDDDDDDDDDDDDDDDDDDDDDDDDDDD");
      toast.success(tokenOfferRejectSuccessMessage);
      const event = tx.events[0];
      var eventData = getEventData(event);
      console.log(eventData);
    } catch (e) {
      console.log(e, "^^^^^^^^^^^^^^^^^^^^^");
      toast.error(tokenOfferRejectErrorMessage);
      setLoading(false);
      return;
    }

    // notify auctionEnded or ownership transferred
    try {
      let to = [
        ...pinOffers.map((item) => item?.user),
        ...pinComments.map((item) => item?.user),
        ...saved,
        ...user?.followers,
        createdBy?._id,
        postedBy?._id,
      ];
      to = [...new Set(to)];
      to = to.filter((item) => item !== user?._id);
      to = to.map((item) => ({ user: item }));

      const obj = {
        type: "Offer Rejected",
        byUser: user?._id,
        toUser: offeringAddress,
        pin: _id,
        to,
      };

      sendNotifications(
        obj,
        (res) => {
          // console.log(res);
        },
        (e) => {
          // console.log(e, "DDDDDDDDDDddddd");
        }
      );
    } catch (e) {
      console.log(e, "DDDDDDDDDDDDDDDDDDDdd");
    }

    withdrawOfferRequest({
      user: offeringAddress,
    });
  };

  const makeMarketItemOffer = async () => {
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

      const auctionBid = parseAmount(inputPrice);
      const transaction = await contract.makeOffer(itemId, {
        value: auctionBid,
      });
      setLoadingMessage(makeOfferLoadingMessage);
      const tx = await transaction.wait();
      console.log(tx.events, "DDDDDDD");
      toast.success(tokenOfferSuccessMessage);
      const event = tx.events[0];
      var eventData = getEventData(event);
      console.log(eventData);
    } catch (e) {
      console.log(e, "^^^^^^^^^^^^^^");
      toast.error(tokenOfferErrorMessage);
      setLoading(false);
      return;
    }

    makeOfferRequest({
      user: user?._id,
      offer: inputPrice,
    });
  };

  const withdrawMarketItemOffer = async () => {
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
      const transaction = await contract.withdrawOffer(itemId);
      setLoadingMessage(withdrawOfferLoadingMessage);
      const tx = await transaction.wait();
      console.log(tx.events, "DDDDDDDDDDDDDDDDDDDDDDDDDDDDDD");
      toast.success(tokenOfferWithdrawSuccessMessage);
      const event = tx.events[0];
      var eventData = getEventData(event);
      console.log(eventData);
    } catch (e) {
      console.log(e, "^^^^^^^^^^^^^^^^^^^^^");
      toast.error(tokenOfferWithdrawErrorMessage);
      setLoading(false);
      return;
    }

    withdrawOfferRequest({
      user: user?._id,
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
      const transaction = await contract.cancelMarketSale(itemId);
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

    try {
      // notify sale ended
      let to = [
        ...pinComments.map((item) => item?.user),
        ...saved,
        ...user?.followers,
        createdBy?._id,
        postedBy?._id,
      ];
      to = [...new Set(to)];
      to = to.filter((item) => item !== user?._id);
      to = to.map((item) => ({ user: item }));

      const obj = {
        type: "Sale Ended",
        byUser: user?._id,
        pin: _id,
        to,
      };

      sendNotifications(
        obj,
        (res) => {
          // console.log(res);
        },
        (e) => {
          // console.log(e, "DDDDDDDDDDddddd");
        }
      );
    } catch (e) {
      console.log(e, "DDDDDDDDDDDDDDDDDDDdd");
    }

    updatePin({
      ...eventData,
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

          let to = [
            ...pinComments.map((item) => item?.user?._id),
            ...user?.followers,
            createdBy?._id,
            postedBy?._id,
          ];
          to = [...new Set(to)];
          to = to.filter((item) => item !== user?._id);
          to = to.map((item) => ({ user: item }));

          const obj = {
            type: "New Comment",
            byUser: user?._id,
            pin: _id,
            to,
          };

          sendNotifications(
            obj,
            (res) => {
              // console.log(res);
            },
            (e) => {
              // console.log(e, "DDDDDDDDDDddddd");
            }
          );
        })
        .catch((e) => {
          setAddingComment(false);
          toast.error(commentAddErrorMessage);
          console.log(e, "DDDDDDDDDDDDDDDDDDDD")
        });
    }
  };

  const addCommentReply = () => {
    if (!user?._id) {
      toast.info(loginMessage);
      return;
    }

    if (comment) {
      setAddingComment(true);

      axios
        .post(`/api/pins/comments/reply/${pinId}/${showCommentReplies?._id}`, {
          user: user?._id,
          comment,
        })
        .then(() => {
          setAddingComment(false);
          setComment("");
          // setShowCommentReplies({});
          fetchPinCommentReplies();
          toast.success(commentAddSuccessMessage);

          let to = [
            ...pinComments.map((item) => item?.user?._id),
            ...commentReplies?.replies?.map((item) => item?.user?._id),
            ...user?.followers,
            createdBy?._id,
            postedBy?._id,
          ];
          to = [...new Set(to)];
          to = to.filter((item) => item !== user?._id);
          to = to.map((item) => ({ user: item }));

          const obj = {
            type: "New Reply",
            byUser: user?._id,
            toUser: showCommentReplies?.user?._id,
            pin: _id,
            to,
          };

          sendNotifications(
            obj,
            (res) => {
              // console.log(res);
            },
            (e) => {
              // console.log(e, "DDDDDDDDDDddddd");
            }
          );
        })
        .catch((e) => {
          setAddingComment(false);
          toast.error(commentAddErrorMessage);
          console.log(e,'DDDDDDDDDDD')
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

        let to = [
          ...pinBids.map((item) => item?.user?._id),
          ...user?.followers,
          createdBy?._id,
          postedBy?._id,
        ];
        to = [...new Set(to)];
        to = to.filter((item) => item !== user?._id);
        to = to.map((item) => ({ user: item }));

        const obj = {
          type: "New Bid",
          byUser: user?._id,
          price: body?.bid,
          pin: _id,
          to,
        };

        sendNotifications(
          obj,
          (res) => {
            // console.log(res);
          },
          (e) => {
            // console.log(e, "DDDDDDDDDDddddd");
          }
        );
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

  const makeOfferRequest = (body) => {
    axios
      .post(`/api/pins/offers/${pinId}`, body)
      .then(() => {
        setAddingBidPrice(false);
        setInputPrice("");
        setRefresh((prev) => !prev);
        setLoading(false);
        toast.success(finalSuccessMessage);

        let to = [
          ...pinComments.map((item) => item?.user?._id),
          ...saved,
          ...user?.followers,
          createdBy?._id,
          postedBy?._id,
        ];
        to = [...new Set(to)];
        to = to.filter((item) => item !== user?._id);
        to = to.map((item) => ({ user: item }));

        const obj = {
          type: "New Offer",
          byUser: user?._id,
          toUser: postedBy?._id,
          price: body?.offer,
          pin: _id,
          to,
        };

        sendNotifications(
          obj,
          (res) => {
            // console.log(res);
          },
          (e) => {
            // console.log(e, "DDDDDDDDDDddddd");
          }
        );
      })
      .catch((e) => {
        setLoading(false);
        toast.error(finalProcessingErrorMessage);
      });
  };

  const withdrawOfferRequest = (body) => {
    axios
      .put(`/api/pins/offers/${pinId}`, body)
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

        if (!alreadySaved) {
          let to = [...user?.followers, createdBy?._id, postedBy?._id];
          to = [...new Set(to)];
          to = to.filter((item) => item !== user?._id);
          to = to.map((item) => ({ user: item }));

          const obj = {
            type: "New Save",
            byUser: user?._id,
            pin: _id,
            to,
          };

          sendNotifications(
            obj,
            (res) => {
              // console.log(res);
            },
            (e) => {
              // console.log(e, "DDDDDDDDDDddddd");
            }
          );
        }

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
        setAddingBidPrice(false);
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
      function: () => {
        setAddingBidPrice((prev) => !prev);
        setAddingSellPrice(false);
      },
    },
    {
      text: `End Auction (Current Bid: ${getCurrentBid(
        currentBid,
        startingBid
      )} Matic)`,
      condition: executeMarketAuctionEndCondition,
      function: executeMarketAuctionEnd,
    },
    // {
    //   text: `Make a Bid (Current Bid: ${getCurrentBid(currentBid, startingBid)} Matic)`,
    //   condition: makeAuctionBidCondition,
    //   function: () => {
    //     // setAddingBidPrice((prev) => !prev);
    //     setTab("bids")
    //   },
    // },
    // {
    //   text: `Withdraw Bid (Your Bid: ${
    //     getUserBid(pinBids, user?._id)?.bid
    //   } Matic)`,
    //   condition: withdrawAuctionBidCondition,
    //   function: withdrawAuctionBid,
    // },
  ];

  const tabArray = [
    {
      name: "properties",
      text: `Properties${
        pinProperties?.length ? ` (${pinProperties?.length})` : ``
      }`,
      condition: true,
      loadingCondition:
        tab === "properties" && !pinProperties?.length && sideLoading,
      emptyCondition:
        tab === "properties" && !pinProperties?.length && !sideLoading,
      emptyText: "No Properties...",
      func: () => setTab("properties"),
    },
    {
      name: "comments",
      text: `Comments${pinComments?.length ? ` (${pinComments?.length})` : ``}`,
      condition: true,
      loadingCondition:
        tab === "comments" && !pinComments?.length && sideLoading,
      emptyText: "No Comments Yet, Be the first one to comment...",
      emptyCondition:
        tab === "comments" && !pinComments?.length && !sideLoading,
      input: {
        condition: tab === "comments",
        placeholder: !showCommentReplies?._id ? "Add a Comment" : "Add a Reply",
        value: comment,
        loadingCondition: addingComment,
        buttonText: !showCommentReplies?._id ? "Comment" : "Reply",
        onChangeFunc: (val) => setComment(val),
        onClickFunc: () =>
          !showCommentReplies?._id
            ? addComment()
            : addCommentReply(showCommentReplies?._id),
      },
      func: () => setTab("comments"),
    },
    {
      name: "bids",
      text: `Bids${pinBids?.length ? ` (${pinBids?.length})` : ``}`,
      condition: highestBidShowCondition,
      loadingCondition: tab === "bids" && !pinBids?.length && sideLoading,
      emptyCondition: tab === "bids" && !pinBids?.length && !sideLoading,
      emptyText: "No Bids Yet, Be the first one to make a Bid...",
      input: {
        condition: tab === "bids" && makeAuctionBidCondition,
        placeholder: "Add a Bid Amount",
        value: inputPrice,
        loadingCondition: false,
        buttonText: "Make Bid",
        onChangeFunc: (val) => setInputPrice(val),
        onClickFunc: () => makeAuctionBid(),
      },
      withdraw: {
        condition: tab === "bids" && withdrawAuctionBidCondition,
        text: `Withdraw Your Bid (Your Bid: ${
          getUserBid(pinBids, user?._id)?.bid
        } Matic)`,
        func: () => withdrawAuctionBid(),
      },
      func: () => setTab("bids"),
    },
    {
      name: "offers",
      text: `Offers${pinOffers?.length ? ` (${pinOffers?.length})` : ``}`,
      condition: offersShowCondition,
      loadingCondition: tab === "offers" && !pinOffers?.length && sideLoading,
      emptyCondition: tab === "offers" && !pinOffers?.length && !sideLoading,
      emptyText: "No Offers Yet...",
      input: {
        condition: tab === "offers" && makeOfferCondition,
        placeholder: "Add an Offer Price",
        value: inputPrice,
        loadingCondition: false,
        buttonText: "Make Offer",
        onChangeFunc: (val) => setInputPrice(val),
        onClickFunc: () => makeMarketItemOffer(),
      },
      withdraw: {
        condition: tab === "offers" && withdrawOfferCondition,
        text: `Withdraw Offer (Your Offer: ${
          getUserBid(pinOffers, user?._id)?.offer
        } Matic)`,
        func: () => withdrawMarketItemOffer(),
      },
      owner: {
        condition:
          tab === "offers" &&
          pinOffers?.length > 0 &&
          postedBy?._id === user?._id,
        text: `Reject All Offers`,
        func: () => rejectAllMarketItemOffers(),
      },
      func: () => setTab("offers"),
    },
    {
      name: "history",
      text: `History`,
      condition: true,
      loadingCondition: tab === "history" && !pinHistory?.length && sideLoading,
      emptyCondition: tab === "history" && !pinHistory?.length && !sideLoading,
      emptyText: "No History...",
      func: () => setTab("history"),
    },
  ];

  if (navigating) {
    return (
      <Spinner
        message={fetchingLoadingMessage}
      />
    );
  }

  if (!pinDetail) {
    return <Spinner message={fetchingNFTLoadingMessage} />;
  }

  if (loading) {
    return <Spinner title={loadingMessage} message={waitLoadingMessage} />;
  }


  return (
    <>
      <Head>
        <title>{`#${detail?.tokenId} ${detail?.title} - NFT | NFT Nation`}</title>
        <meta name="description" content={`${detail?.about}`} />
        <meta property="og:title" content={`${detail?.title} - NFT | NFT Nation`} />
        <meta property="og:description" content={`${detail?.about}`} />
        <meta
          property="og:url"
          content={`https://nft-nation.vercel.app/pin-detail/${pinId}`}
        />
        <meta
          property="og:image"
          // content={getGatewayImage(detail?.image, "ipfs")}
          content={`${basePath}/favicon.png`}
        />
        <meta name="twitter:card" content="summary" />
        <meta property="og:type" content="website" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
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
              <div className="flex flex-wrap justify-center mb-2 lg:gap-2">
                {tabArray.map((item, index) => {
                  if (item?.condition)
                    return (
                      <button
                        className={`mt-1`}
                        key={index}
                        onClick={() => item?.func()}
                      >
                        <span
                          className={`${buttonStyle} ${
                            tab === item?.name ? `bg-[#009387]` : ``
                          } text-xl`}
                        >
                          {item?.text}
                        </span>
                      </button>
                    );
                })}
              </div>

              <div className="max-h-370 h-370 overflow-y-scroll">
                {tabArray.map((item, index) => {
                  if (item?.emptyCondition)
                    return (
                      <h2
                        key={index}
                        className="flex justify-center items-center h-370 mt-0 text-xl font-bold"
                      >
                        {item?.emptyText}
                      </h2>
                    );
                })}

                {tabArray.map((item, index) => {
                  if (item?.loadingCondition)
                    return (
                      <div key={index}>
                        <Spinner title={loadingMessage} />
                      </div>
                    );
                })}

                {tab === "properties" && pinProperties.length > 0 && (
                  <div className="mt-5 grid grid-cols-1 md:grid-cols-2 gap-2 p-2">
                    {pinProperties?.map((item, index) => (
                      <div
                        key={index}
                        className="p-2 bg-gradient-to-r from-secondTheme to-themeColor flex gap-2 mt-2 items-center bg-secondTheme rounded-lg justify-center text-center shadow-xl drop-shadow-xl"
                      >
                        <div className="flex flex-col py-4" key={index}>
                          <h1 className="font-bold text-md">{item?.value}</h1>
                          <h3 className="font-semibold text-sm">{`(${item?.trait_type})`}</h3>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {tab === "bids" &&
                  pinBids?.length > 0 &&
                  pinBids?.map((item, index) => (
                    <div
                      key={index}
                      className="flex flex-col p-2 bg-gradient-to-r from-secondTheme to-themeColor mt-5 bg-secondTheme rounded-lg"
                    >
                      {item?.user?._id && (
                        <>
                          <div className="flex gap-2">
                            <Link
                              onClick={() =>
                                router.push(`/user-profile/${item?.user?._id}`)
                              }
                              href={`/user-profile/${item?.user?._id}`}
                            >
                              <div className="flex flex-row gap-2 items-center cursor-pointer">
                                <Image
                                  height={30}
                                  width={30}
                                  src={getImage(item?.user?.image)}
                                  className="w-12 h-12 rounded-full"
                                  alt="user-profile"
                                />
                                <p className="font-bold text-sm">
                                  {getUserName(item?.user?.userName)}
                                </p>
                              </div>
                            </Link>
                            <div className="flex ml-auto items-center">
                              <p className="font-bold text-xs">
                                {moment(item?.createdAt).fromNow()}
                              </p>
                            </div>
                          </div>
                        </>
                      )}
                      <div className="flex justify-start ml-10">
                        <p className="font-semibold text-sm">{`${item.bid} Matic`}</p>
                      </div>
                    </div>
                  ))}

                {tab === "offers" &&
                  pinOffers?.length > 0 &&
                  pinOffers?.map((item, index) => (
                    <div
                      key={index}
                      className="flex flex-col p-2 bg-gradient-to-r from-secondTheme to-themeColor mt-5 bg-secondTheme rounded-lg"
                    >
                      {item?.user?._id && (
                        <>
                          <div className="flex gap-2">
                            <Link
                              onClick={() =>
                                router.push(`/user-profile/${item?.user?._id}`)
                              }
                              href={`/user-profile/${item?.user?._id}`}
                            >
                              <div className="flex flex-row gap-2 items-center cursor-pointer">
                                <Image
                                  height={30}
                                  width={30}
                                  src={getImage(item?.user?.image)}
                                  className="w-12 h-12 rounded-full"
                                  alt="user-profile"
                                />
                                <p className="font-bold text-sm">
                                  {getUserName(item?.user?.userName)}
                                </p>
                              </div>
                            </Link>
                            <div className="flex ml-auto items-center">
                              <p className="font-bold text-xs">
                                {moment(item?.createdAt).fromNow()}
                              </p>
                            </div>
                          </div>
                        </>
                      )}
                      <div className="flex justify-start ml-10">
                        <p className="font-semibold text-sm">{`${item.offer} Matic`}</p>
                        {postedBy?._id === user?._id && (
                          <div className="flex ml-auto gap-4">
                            <FaCheckCircle
                              onClick={(e) => {
                                e.stopPropagation();
                                acceptMarketItemOffer(
                                  item?.user?._id,
                                  item?.offer
                                );
                              }}
                              size={23}
                              className="cursor-pointer text-[#009387]"
                            />
                            <MdCancel
                              onClick={(e) => {
                                e.stopPropagation();
                                rejectMarketItemOffer(item?.user?._id);
                              }}
                              size={23}
                              className="cursor-pointer text-[#a83f39]"
                            />
                          </div>
                        )}
                      </div>
                    </div>
                  ))}

                <CommentSection
                  user={user}
                  tab={tab}
                  showCommentReplies={showCommentReplies}
                  setShowCommentReplies={setShowCommentReplies}
                  commentsArr={pinComments}
                  deletingComment={deletingComment}
                  deleteComment={deleteComment}
                  commentReplies={commentReplies}
                  setCommentReplies={setCommentReplies}
                  deleteCommentReply={deleteCommentReply}
                  fetchComments={fetchPinComments}
                />

                {tab === "history" &&
                  pinHistory?.length > 0 &&
                  pinHistory?.map((item, index) => (
                    <div
                      key={index}
                      className="flex flex-col p-2 bg-gradient-to-r from-secondTheme to-themeColor mt-5 bg-secondTheme rounded-lg"
                    >
                      {item?.user?._id && (
                        <>
                          <div className="flex gap-2">
                            <Link
                              onClick={() =>
                                router.push(`/user-profile/${item?.user?._id}`)
                              }
                              href={`/user-profile/${item?.user?._id}`}
                            >
                              <div className="flex flex-row gap-2 items-center cursor-pointer">
                                <Image
                                  height={30}
                                  width={30}
                                  src={getImage(item?.user?.image)}
                                  className="w-12 h-12 rounded-full"
                                  alt="user-profile"
                                />
                                <p className="font-bold text-sm">
                                  {getUserName(item?.user?.userName)}
                                </p>
                              </div>
                            </Link>
                            <div className="flex ml-auto items-center">
                              <p className="font-bold text-xs">
                                {moment(item?.createdAt).fromNow()}
                              </p>
                            </div>
                          </div>
                        </>
                      )}
                      <div className="flex justify-start ml-10">
                        <p className="font-semibold text-sm">
                          {getHistoryDescription(item)}
                        </p>
                      </div>
                    </div>
                  ))}
              </div>

              {tabArray.map((item, index) => {
                if (item?.input?.condition)
                  return (
                    <div key={index} className="flex flex-wrap mt-2 gap-3">
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
                        placeholder={item?.input?.placeholder}
                        value={item?.input?.value}
                        onChange={(e) =>
                          item?.input?.onChangeFunc(e.target.value)
                        }
                      />
                      <button
                        type="button"
                        className="shadow-lg hover:drop-shadow-lg transition transition duration-500 ease transform hover:-translate-y-1 inline-block bg-themeColor text-secondTheme rounded-full px-6 py-2 font-semibold text-base outline-none"
                        onClick={() => item?.input?.onClickFunc()}
                      >
                        {!item?.input?.loadingCondition ? (
                          `${item?.input?.buttonText}`
                        ) : (
                          <AiOutlineLoading3Quarters
                            onClick={(e) => {
                              e.stopPropagation();
                              // savePin();
                            }}
                            className="mx-4 animate-spin text-[#ffffff] drop-shadow-lg cursor-pointer"
                            size={20}
                          />
                        )}
                      </button>
                    </div>
                  );
              })}

              {tabArray.map((item, index) => {
                if (item?.withdraw?.condition)
                  return (
                    <div
                      key={index}
                      className="flex flex-wrap mt-6 gap-3 justify-center"
                    >
                      <button
                        type="button"
                        className="shadow-lg hover:drop-shadow-lg transition transition duration-500 ease transform hover:-translate-y-1 inline-block bg-themeColor text-secondTheme rounded-full px-6 py-2 font-semibold text-base outline-none"
                        onClick={() => item?.withdraw?.func()}
                      >
                        {item?.withdraw?.text}
                      </button>
                    </div>
                  );

                if (item?.owner?.condition)
                  return (
                    <div
                      key={index}
                      className="flex flex-wrap mt-6 gap-3 justify-center"
                    >
                      <button
                        type="button"
                        className="shadow-lg hover:drop-shadow-lg transition transition duration-500 ease transform hover:-translate-y-1 inline-block bg-themeColor text-secondTheme rounded-full px-6 py-2 font-semibold text-base outline-none"
                        onClick={() => item?.owner?.func()}
                      >
                        {item?.owner?.text}
                      </button>
                    </div>
                  );
              })}
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

            {!(priceShowCondition || highestBidShowCondition) && (
              <div className="font-bold text-sm mr-2 mb-1">
                <span className={buttonStyle}>
                  {offersCount > 0
                    ? `Has ${offersCount} ${
                        offersCount > 1 ? `Offers` : `Offer`
                      }`
                    : `No Offers Yet`}
                </span>
              </div>
            )}

            {highestBidShowCondition && (
              <div className="font-bold text-sm mr-2 mb-1">
                <span className={buttonStyle}>
                  {bidsCount > 0
                    ? `Has ${bidsCount} ${bidsCount > 1 ? `Bids` : `Bid`}`
                    : `No Bids Yet`}
                </span>
              </div>
            )}
            {(priceShowCondition || highestBidShowCondition) && (
              <div className="font-bold text-sm mr-2 mb-1">
                <span className={buttonStyle}>
                  {priceShowCondition
                    ? `On Sale (Price: ${price} Matic)`
                    : `On Auction (Current Bid: ${getCurrentBid(
                        currentBid,
                        startingBid
                      )} Matic)`}
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
                        className={iconStyles}
                        size={25}
                      />
                    ) : (
                      <AiFillHeart
                        onClick={(e) => {
                          e.stopPropagation();
                          savePin();
                        }}
                        className={`${iconStyles} text-[#a83f39]`}
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
            <ShareButtons title={title} shareUrl={`https://nft-nation.vercel.app/pin-detail/${pinId}`} image={getImage(image)}/>
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
                    className=" flex-0.5 border-gray-100 outline-none border-2 p-2 rounded-2xl focus:border-gray-300"
                    type="text"
                    placeholder={
                      addingSellPrice && !addingBidPrice
                        ? `Price For Sale...`
                        : `Starting Bid For Auction...`
                    }
                    maxLength={10}
                    value={inputPrice}
                    onChange={(e) => setInputPrice(e.target.value)}
                  />
                  <button
                    type="button"
                    className="shadow-lg hover:drop-shadow-lg transition transition duration-500 ease transform hover:-translate-y-1 inline-block bg-themeColor text-secondTheme rounded-full px-6 py-2 font-semibold text-base outline-none"
                    onClick={() => {
                      addingSellPrice && !addingBidPrice
                        ? createMarketSale()
                        : createMarketAuction();
                    }}
                  >
                    {`Confirm`}
                  </button>
                </div>
              </div>
            )}
        </div>
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
        <Feed data={data}/>
      </>
    </>
  );
};

export default PinDetail;

// export const getServerSideProps = wrapper.getServerSideProps(
//   (store) =>
//     async ({ query }) => {
  export const getServerSideProps = async ({query}) => {
  const {pinId} = query

  try {
    var {data} = await axios
    .get(`${basePath}/api/pins/${pinId}`)
  } catch(e) {
    console.log(e,"Error")
  }

  if (!data) {
    return {
        notFound: true,
    };
}

  return {
    props: {
      detail: data?.pin,
      data: []
    },
  };
}
// );
