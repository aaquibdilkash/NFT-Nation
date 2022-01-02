import React, { useEffect, useState } from "react";
import Link from "next/link";
import { nftaddress, nftmarketaddress } from "./../../config";
import NFT from "./../../artifacts/contracts/NFT.sol/NFT.json";
import Market from "./../../artifacts/contracts/NFTMarket.sol/NFTMarket.json";
import Web3Modal from "web3modal";
import { ethers } from "ethers";
import MasonryLayout from "../../components/MasonryLayout";
import Spinner from "../../components/Spinner";
import { useSelector } from "react-redux";
import { useDispatch } from "react-redux";
import { etherAddress, getMaxBid, getUserName, isValidAmount } from "../../utils/data";
import { useRouter } from "next/router";
import axios from "axios";
import { REFRESH_SET } from "../../redux/constants/UserTypes";
import Head from "next/head";
import Image from "next/image";
import moment from "moment";

const buttonStyles =
  "m-2 shadow-lg hover:drop-shadow-lg transition duration-500 ease transform hover:-translate-y-1 inline-block bg-[#009387] text-lg font-medium rounded-full text-white px-8 py-3 cursor-pointer";

const PinDetail = () => {
  const dispatch = useDispatch();
  const router = useRouter();
  const { pinId } = router.query;
  const { user, refresh } = useSelector((state) => state.userReducer);
  const [pins, setPins] = useState();
  const [pinDetail, setPinDetail] = useState();
  const [comment, setComment] = useState("");
  const [inputPrice, setInputPrice] = useState("");
  const [addingComment, setAddingComment] = useState(false);
  const [addingSellPrice, setAddingSellPrice] = useState(false);
  const [addingBidPrice, setAddingBidPrice] = useState(false);
  const [savingPost, setSavingPost] = useState(false);
  let alreadySaved = pinDetail?.saved?.find((item) => item === user?._id);
  const executeMarketSaleCondition =
    pinDetail?.price !== "0" &&
    pinDetail?.owner === etherAddress &&
    pinDetail?.seller !== user?.address &&
    pinDetail?.auctionEnded;

  const createMarketSaleCondition =
    pinDetail?.price === "0" &&
    pinDetail?.owner === user?.address &&
    pinDetail?.seller === etherAddress &&
    pinDetail?.auctionEnded;

  const cancelMarketSaleCondition =
    pinDetail?.price !== "0" &&
    pinDetail?.seller === user?.address &&
    pinDetail?.owner === etherAddress &&
    pinDetail?.auctionEnded;

  const createMarketAuctionCondition =
    pinDetail?.price === "0" &&
    pinDetail?.owner === user?.address &&
    pinDetail?.seller === etherAddress &&
    pinDetail?.auctionEnded;

  const executeMarketAuctionEndCondition =
    pinDetail?.price === "0" &&
    pinDetail?.seller === user?.address &&
    pinDetail?.owner === etherAddress &&
    !pinDetail?.auctionEnded;

  const makeAuctionBidCondition =
    pinDetail?.seller !== user?.address &&
    pinDetail?.owner === etherAddress &&
    !pinDetail?.bids?.find((bid) => bid.user?._id === user?._id) &&
    !pinDetail?.auctionEnded;

  const withdrawAuctionBidCondition =
    pinDetail?.seller !== user?.address &&
    pinDetail?.owner === etherAddress &&
    pinDetail?.bids?.find((bid) => bid.user?._id === user?._id) &&
    !pinDetail?.auctionEnded;

  useEffect(() => {
    pinId &&
      axios
        .get(`/api/pins/${pinId}`)
        .then((res) => {
          setPinDetail(res.data.pin);
          // console.log(res.data.pin, 'PPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPP')
          axios
            .get(`/api/pins?category=${res.data.pin.category}`)
            .then((res) => {
              setPins(res.data.pins);
              // console.log(res.data.pins, "dddddddddddddddddddddddddddddddddddddddddd")
            })
            .catch((e) => {
              console.log(e);
            });
        })
        .catch((e) => {
          console.log(e);
        });
  }, [pinId, refresh]);

  const updatePin = (body) => {
    axios
      .put(`/api/pins/${pinDetail?._id}`, body)
      .then((res) => {
        // router.push("/")
        setAddingSellPrice(false)
        setInputPrice("")
        dispatch({
          type: REFRESH_SET,
          payload: !refresh,
        });
      })
      .catch((e) => {});
  };

  const executeMarketSale = async () => {
    const { price, itemId } = pinDetail;

    const web3Modal = new Web3Modal();
    const connection = await web3Modal.connect();
    const provider = new ethers.providers.Web3Provider(connection);

    const signer = provider.getSigner();
    const contract = new ethers.Contract(nftmarketaddress, Market.abi, signer);

    const auctionPrice = ethers.utils.parseUnits(price, "ether");

    const transaction = await contract.executeMarketSale(nftaddress, itemId, {
      value: auctionPrice,
    });

    const tx = await transaction.wait();

    console.log(tx.events);
    const event = tx.events[0];

    let newPrice = "0";
    let newSeller = etherAddress;
    let newOwner = user?.address;

    updatePin({
      price: newPrice,
      owner: newOwner,
      seller: newSeller,
      postedBy: user?._id,
    });
  };

  const createMarketSale = async () => {
    if(!isValidAmount(inputPrice)) {
      alert("Please enter a valid amount")
      return
    }

    const { itemId, tokenId } = pinDetail;

    const web3Modal = new Web3Modal();
    const connection = await web3Modal.connect();
    const provider = new ethers.providers.Web3Provider(connection);

    const signer = provider.getSigner();

    let contract = new ethers.Contract(nftaddress, NFT.abi, signer);

    let transaction = await contract.approve(nftmarketaddress, tokenId);

    await transaction.wait();

    contract = new ethers.Contract(nftmarketaddress, Market.abi, signer);

    const auctionPrice = ethers.utils.parseUnits(inputPrice, "ether");
    transaction = await contract.createMarketSale(
      nftaddress,
      itemId,
      auctionPrice
    );

    const tx = await transaction.wait();
    console.log(tx.events, "DDDDDDD");
    const event = tx.events[0];

    let newPrice = inputPrice;
    let newOwner = etherAddress;
    let newSeller = user?.address;

    updatePin({
      price: newPrice,
      owner: newOwner,
      seller: newSeller,
      postedBy: user?._id,
    });
  };

  const makeAuctionBid = async () => {
    if(!isValidAmount(inputPrice)) {
      alert("Please enter a valid amount")
      return
    }

    const { itemId } = pinDetail;

    const web3Modal = new Web3Modal();
    const connection = await web3Modal.connect();
    const provider = new ethers.providers.Web3Provider(connection);

    const signer = provider.getSigner();

    let contract = new ethers.Contract(nftmarketaddress, Market.abi, signer);

    const auctionBid = ethers.utils.parseUnits(inputPrice, "ether");

    const transaction = await contract.makeAuctionBid(itemId, {
      value: auctionBid,
    });

    const tx = await transaction.wait();
    console.log(tx.events, "DDDDDDD");
    const event = tx.events[0];

    let newBid = inputPrice;
    let newBidder = user?._id;

    makeAuctionBidRequest({
      user: newBidder,
      bid: newBid
    })
  };

  const withdrawAuctionBid = async () => {
    const { itemId } = pinDetail;

    const web3Modal = new Web3Modal();
    const connection = await web3Modal.connect();
    const provider = new ethers.providers.Web3Provider(connection);

    const signer = provider.getSigner();

    let contract = new ethers.Contract(nftmarketaddress, Market.abi, signer);

    const transaction = await contract.withdrawAuctionBid(itemId);

    const tx = await transaction.wait();
    console.log(tx.events, "DDDDDDD");
    const event = tx.events[0];

    withdrawAuctionBidRequest({
      user: user?._id
    })
  };

  const createMarketAuction = async () => {
    const { itemId, tokenId } = pinDetail;

    const web3Modal = new Web3Modal();
    const connection = await web3Modal.connect();
    const provider = new ethers.providers.Web3Provider(connection);

    const signer = provider.getSigner();

    let contract = new ethers.Contract(nftaddress, NFT.abi, signer);

    let transaction = await contract.approve(nftmarketaddress, tokenId);

    await transaction.wait();

    contract = new ethers.Contract(nftmarketaddress, Market.abi, signer);

    // const auctionPrice = ethers.utils.parseUnits("0.01", 'ether')
    transaction = await contract.createMarketAuction(
      nftaddress,
      itemId,
    );

    const tx = await transaction.wait();
    console.log(tx.events, "DDDDDDD");
    const event = tx.events[0];

    let newPrice = "0";
    let newOwner = etherAddress;
    let newSeller = user?.address;

    updatePin({
      price: newPrice,
      owner: newOwner,
      seller: newSeller,
      postedBy: user?._id,
      auctionEnded: false,
    });
  };

  const executeMarketAuctionEnd = async () => {
    const { itemId } = pinDetail;

    const web3Modal = new Web3Modal();
    const connection = await web3Modal.connect();
    const provider = new ethers.providers.Web3Provider(connection);

    const signer = provider.getSigner();

    const contract = new ethers.Contract(nftmarketaddress, Market.abi, signer);

    const transaction = await contract.executeMarketAuctionEnd(
      nftaddress,
      itemId
    );

    const tx = await transaction.wait();
    console.log(tx.events, "DDDDDDD");
    const event = tx.events[0];

    let newPrice = "0";
    let newOwner = getMaxBid(pinDetail?.bids)?.user?.address;
    let newSeller = etherAddress;

    updatePin({
      price: newPrice,
      owner: newOwner,
      seller: newSeller,
      postedBy: user?._id,
      auctionEnded: true,
    });
  };

  const cancelMarketSale = async () => {
    const { itemId } = pinDetail;

    const web3Modal = new Web3Modal();
    const connection = await web3Modal.connect();
    const provider = new ethers.providers.Web3Provider(connection);

    const signer = provider.getSigner();
    const contract = new ethers.Contract(nftmarketaddress, Market.abi, signer);

    const transaction = await contract.cancelMarketSale(nftaddress, itemId);

    const tx = await transaction.wait();

    console.log(tx.events);
    const event = tx.events[0];

    let newPrice = "0";
    let newOwner = user?.address;
    let newSeller = etherAddress;

    updatePin({
      price: newPrice,
      owner: newOwner,
      seller: newSeller,
      postedBy: user?._id,
    });
  };

  const addComment = () => {
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
          dispatch({
            type: REFRESH_SET,
            payload: !refresh,
          });
        });
    }
  };
  const makeAuctionBidRequest = (body) => {
      axios
        .post(`/api/pins/bids/${pinId}`, body)
        .then(() => {
          setAddingBidPrice(false);
          setInputPrice("");
          dispatch({
            type: REFRESH_SET,
            payload: !refresh,
          });
        });
  };
  const withdrawAuctionBidRequest = (body) => {
      axios
        .put(`/api/pins/bids/${pinId}`, body)
        .then(() => {
          dispatch({
            type: REFRESH_SET,
            payload: !refresh,
          });
        });
  };

  const savePin = () => {
    setSavingPost(true);
    axios
      .put(`/api/pins/save/${pinId}`, {
        user: user?._id,
      })
      .then((res) => {
        setSavingPost(false);
        dispatch({
          type: REFRESH_SET,
          payload: !refresh,
        });
      })
      .catch((e) => {
        console.log(e);
        setSavingPost(false);
      });
  };

  const modalToggle = () => {
    setDisplay((display) => (display == "hidden" ? "block" : "hidden"));
  };

  if (!pinDetail) {
    return <Spinner message="Showing pin" />;
  }

  return (
    <>
      <Head>
        <title>{`${pinDetail?.title} | NFT Nation`}</title>
        <meta name="description" content={`${pinDetail?.about}`} />
        <meta
          property="og:title"
          content={`${pinDetail?.title} | NFT Nation`}
        />
        <meta property="og:description" content={`${pinDetail?.about}`} />
        <meta
          property="og:url"
          content={`https://nft-nation.vercel.app/pin-detail/${pinDetail?._id}`}
        />
        <meta property="og:type" content="website" />
        <link rel="icon" href="/favicon.png" />
      </Head>
      {pinDetail && (
        <div className="bg-gradient-to-r from-[#ffffff] to-[#009387] bg-white shadow-lg rounded-lg p-0 lg:p-8 pb-12 mb-8">
          <div className="bg-gradient-to-r from-[#009387] to-[#ffffff] flex flex-col lg:flex-row relative justify-between align-center overflow-hidden shadow-md p-8 mb-6 rounded-lg">
            <Image
              unoptimized
              placeholder="blur"
              blurDataURL="/favicon.png"
              alt={pinDetail?.title}
              className="shadow-lg rounded-t-lg lg:rounded-lg"
              height={500}
              width={600}
              src={pinDetail?.image}
            />

            <div className="w-full p-5 flex-1 xl:min-w-620">
              <h2 className="mt-0 text-2xl font-bold">
                {pinDetail?.comments?.length
                  ? `${pinDetail?.comments?.length} Comments`
                  : `No Comments Yet`}
              </h2>
              <div className="max-h-370 overflow-y-scroll">
                {pinDetail?.comments?.map((item) => (
                  <div
                    key={`${item?._id}`}
                    className="bg-gradient-to-r from-[#ffffff] to-[#009387] flex gap-2 mt-5 items-center bg-white rounded-lg"
                  >
                    {item?.user?._id && (
                      <Link href={`/user-profile/${item?.user?._id}`}>
                        {item?.user?.image && (
                          <Image
                            height={40}
                            width={40}
                            src={item?.user?.image}
                            className="w-10 h-10 rounded-full cursor-pointer"
                            alt="user-profile"
                          />
                        )}
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
                    {user?.image && (
                      <Image
                        height={40}
                        width={40}
                        src={user?.image}
                        className="w-10 h-10 rounded-full cursor-pointer"
                        alt="user-profile"
                      />
                    )}
                  </Link>
                )}
                <input
                  className=" flex-1 border-gray-100 outline-none border-2 p-2 rounded-2xl focus:border-gray-300"
                  type="text"
                  placeholder="Add a comment"
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                />
                <button
                  type="button"
                  className="shadow-lg hover:drop-shadow-lg transition transition duration-500 ease transform hover:-translate-y-1 inline-block bg-red text-white rounded-full px-6 py-2 font-semibold text-base outline-none"
                  onClick={addComment}
                >
                  {addingComment ? "Doing..." : "Done"}
                </button>
              </div>
            </div>
          </div>

          <h1 className="transition duration-700 text-center mb-8 cursor-pointer hover:text-pink-600 text-3xl font-semibold">
            <p>{pinDetail?.title}</p>
          </h1>
          <div className="block lg:flex text-center items-center justify-center mb-8 w-full">
            {pinDetail?.postedBy?._id && (
              <Link href={`/user-profile/${pinDetail?.postedBy?._id}`}>
                <div className="cursor-pointer flex items-center justify-center mb-4 lg:mb-0 w-full lg:w-auto mr-8 items-center">
                  <Image
                    alt={pinDetail.postedBy.userName}
                    height={40}
                    width={40}
                    className="align-middle rounded-full"
                    src={pinDetail?.postedBy?.image}
                  />

                  <p className="inline align-middle text-gray-700 ml-2 text-lg font-bold">
                    {getUserName(pinDetail?.postedBy?.userName)}
                  </p>
                </div>
              </Link>
            )}

            <div className="font-bold text-gray-700">
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
                {moment(pinDetail.createdAt).format("MMM DD, YYYY")}
              </span>
            </div>
          </div>
          <p className="text-center text-lg text-gray-700 font-normal px-4 lg:px-20 mb-8">
            {pinDetail?.about}
          </p>
          <div className="p-2 bg-gradient-to-r from-[#009387] to-[#ffffff] rounded-lg drop-shadow-lg flex flex-wrap text-center justify-evenly">
            {executeMarketSaleCondition && (
              <button
                onClick={() => {
                  executeMarketSale();
                }}
              >
                <span className={buttonStyles}>
                  {`Buy ${pinDetail?.price} Matic`}{" "}
                </span>
              </button>
            )}

            {createMarketSaleCondition && (
              <button
                onClick={() => {
                  setAddingSellPrice((prev) => !prev)
                }}
              >
                <span className={buttonStyles}>{`Sell`} </span>
              </button>
            )}

            {cancelMarketSaleCondition && (
              <button
                onClick={() => {
                  cancelMarketSale();
                }}
              >
                <span className={buttonStyles}>{`Put Down From Sale (Current Price: ${pinDetail?.price} Matic)`} </span>
              </button>
            )}

            {createMarketAuctionCondition && (
              <button
                onClick={() => {
                  createMarketAuction();
                }}
              >
                <span className={buttonStyles}>{`Put On Auction`} </span>
              </button>
            )}

            {executeMarketAuctionEndCondition && (
              <button
                onClick={() => {
                  executeMarketAuctionEnd();
                }}
              >
                <span className={buttonStyles}>{`Put Down From Auction${pinDetail?.bids?.length ? ` (Highest Bid: ${getMaxBid(pinDetail?.bids).bid} Matic)` : ` (No Bids Yet)`}`} </span>
              </button>
            )}

            {makeAuctionBidCondition && (
              <button
                onClick={() => {
                  setAddingBidPrice(prev => !prev)
                }}
              >
                <span className={buttonStyles}>
                  {`Make a Bid${pinDetail?.bids?.length ? ` (Highest Bid: ${getMaxBid(pinDetail?.bids).bid} Matic)` : ` (No Bids Yet)`}`}{" "}
                </span>
              </button>
            )}
            {withdrawAuctionBidCondition && (
              <button
                onClick={() => {
                  withdrawAuctionBid();
                }}
              >
                <span className={buttonStyles}>{`Withdraw Bid (Highest Bid: ${getMaxBid(pinDetail?.bids).bid} Matic)`} </span>
              </button>
            )}

            <button
              onClick={() => {
                savePin();
              }}
            >
              <span className={buttonStyles}>
                {alreadySaved
                  ? `${pinDetail?.saved?.length} Saved`
                  : savingPost
                  ? `Saving...`
                  : `Save`}{" "}
              </span>
            </button>

            <button
              onClick={() => {
                navigator.clipboard.writeText(
                  `https:nft-nation.vercel.app/pin-detail/${pinId}`
                );
              }}
            >
              <span className={buttonStyles}>{`Share`} </span>
            </button>
          </div>
          {(addingBidPrice || addingSellPrice) && (
            <div className="mt-4 p-2 bg-gradient-to-r from-[#009387] to-[#ffffff] rounded-lg drop-shadow-lg flex flex-wrap text-center justify-evenly">
              <div className="flex flex-wrap m-2 gap-3">
                {user?._id && (
                  <Link href={`/user-profile/${user?._id}`}>
                    {user?.image && (
                      <Image
                        height={40}
                        width={40}
                        src={user?.image}
                        className="w-10 h-10 rounded-full cursor-pointer hover:shadow-lg"
                        alt="user-profile"
                      />
                    )}
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
                  className="shadow-lg hover:drop-shadow-lg transition transition duration-500 ease transform hover:-translate-y-1 inline-block bg-red text-white rounded-full px-6 py-2 font-semibold text-base outline-none"
                  onClick={() => {
                    addingSellPrice && createMarketSale()
                    addingBidPrice && makeAuctionBid()
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
        <h2 className="text-center font-bold text-2xl mt-8 mb-4">
          More like this
        </h2>
      )}
      {pins ? (
        <MasonryLayout pins={pins} />
      ) : (
        <Spinner message="Loading more pins" />
      )}
    </>
  );
};

export default PinDetail;
