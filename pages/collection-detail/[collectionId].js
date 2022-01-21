import React, { useEffect, useState } from "react";
import Link from "next/link";
import { nftaddress, nftmarketaddress } from "../../config";
import NFT from "../../artifacts/contracts/NFT.sol/NFT.json";
import Market from "../../artifacts/contracts/NFTMarket.sol/NFTMarket.json";
import Web3Modal from "web3modal";
import { ethers } from "ethers";
import MasonryLayout from "../../components/MasonryLayout";
import Spinner from "../../components/Spinner";
import { useDispatch, useSelector } from "react-redux";
import {
  etherAddress,
  getEventData,
  getMaxBid,
  getUserBid,
  getUserName,
  isValidAmount,
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
  unSaveErrorMessage,
  unsaveSuccessMessage,
  validAmountErrorMessage,
  withrawBidLoadingMessage,
} from "../../utils/messages";
import { useRouter } from "next/router";
import axios from "axios";
import Head from "next/head";
import Image from "next/image";
import { FaCopy, FaDiceD20, FaLink, FaShareAlt } from "react-icons/fa";
import { toast } from "react-toastify";
import { Feed } from "../../components";
import { AiFillHeart, AiOutlineEdit, AiOutlineHeart } from "react-icons/ai";
import moment from "moment";
import CollectionFeed from "../../components/CollectionFeed";
import { COLLECTION_SET } from "../../redux/constants/UserTypes";
import CollectionEdit from "../../components/CollectionEdit";

const buttonStyles =
  "m-2 shadow-lg hover:drop-shadow-lg transition duration-500 ease transform hover:-translate-y-1 inline-block bg-themeColor text-lg font-semibold rounded-full text-secondTheme px-8 py-3 cursor-pointer";
const tabButtonStyles =
  "m-2 shadow-lg hover:drop-shadow-lg transition duration-500 ease transform hover:-translate-y-1 inline-block bg-themeColor text-md font-semibold rounded-full text-secondTheme px-4 py-2 cursor-pointer";

const activeBtnStyles =
  "bg-themeColor mr-4 mt-2 text-secondTheme font-semibold p-2 px-3 rounded-full w-auto outline-noned shadow-lg hover:drop-shadow-lg transition duration-500 ease transform hover:-translate-y-1 inline-block";
const notActiveBtnStyles =
  "bg-primary mr-4 mt-2 text-textColor font-semibold p-2 px-3 rounded-full w-auto outline-none shadow-lg hover:drop-shadow-lg transition duration-500 ease transform hover:-translate-y-1 inline-block";

const CollectionDetail = () => {
  const router = useRouter();
  const dispatch = useDispatch();
  const { pathname, query } = router;
  const { collectionId } = query;
  const { user, collection } = useSelector((state) => state.userReducer);
  const [refresh, setRefresh] = useState(false);
  const [collectionDetail, setCollectionDetail] = useState();
  const [collectionComments, setCollectionComments] = useState([]);
  const [activeBtn, setActiveBtn] = useState("Items");
  const [sideLoading, setSideLoading] = useState(true);
  const [collectionEditing, setCollectionEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [comment, setComment] = useState("");
  const [addingComment, setAddingComment] = useState(false);
  const [savingPost, setSavingPost] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState("Loading...");
  const [alreadySaved, setAlreadySaved] = useState(false);
  const [savedLength, setSavedLenth] = useState(0);
  const [tab, setTab] = useState("comments");

  const { _id, title, about, category, saved, image, createdBy, pins } =
    collectionDetail ?? {
      _id: "",
      title: "",
      about: "",
      saved: [],
      category: "",
      image: "",
      createdBy: {},
      pins: [],
    };

  const fetchCollectionComments = () => {
    setSideLoading(true);
    axios
      .get(`/api/collections/comments/${collectionId}`)
      .then((res) => {
        setCollectionComments(res?.data?.comments);
        setSideLoading(false);
      })
      .catch((e) => {
        toast.error(errorMessage);
        setSideLoading(false);
        // console.log(e);
      });
  };

  const fetchCollectionDetails = () => {
    axios
      .get(`/api/collections/${collectionId}`)
      .then((res) => {
        setCollectionDetail(res?.data?.collection);
        dispatch({
          type: COLLECTION_SET,
          payload: res?.data?.collection,
        });
        setAlreadySaved(
          res?.data?.collection?.saved?.find((item) => item === user?._id)
        );
        setSavedLenth(res?.data?.collection?.saved?.length);

        setActiveBtn("Items");

        router.push(
          {
            pathname: pathname,
            query: {
              collectionId,
              collection: true,
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
  }, [user, collectionDetail]);

  useEffect(() => {
    collectionId && fetchCollectionDetails();
    collectionId && fetchCollectionComments();
  }, [collectionId, refresh]);

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

  const addComment = () => {
    if (!user?._id) {
      toast.info(loginMessage);
      return;
    }

    if (comment) {
      setAddingComment(true);

      axios
        .post(`/api/collections/comments/${collectionId}`, {
          user: user?._id,
          comment,
        })
        .then(() => {
          setAddingComment(false);
          setComment("");
          // setRefresh((prev) => !prev);
          fetchCollectionComments();
          toast.success(commentAddSuccessMessage);
        })
        .catch((e) => {
          setAddingComment(false);
          toast.error(commentAddErrorMessage);
        });
    }
  };

  const saveCollection = () => {
    if (!user?._id) {
      toast.info(loginMessage);
      return;
    }
    setSavingPost(true);
    axios
      .put(`/api/collections/save/${_id}`, {
        user: user?._id,
      })
      .then((res) => {
        setSavingPost(false);
        // toast.success(alreadySaved ? unsaveSuccessMessage : saveSuccessMessage);
        setSavedLenth((prev) => (alreadySaved ? prev - 1 : prev + 1));
        setAlreadySaved((prev) => !prev);
      })
      .catch((e) => {
        console.log(e);
        setSavingPost(false);
        toast.error(saveErrorMessage);
      });
  };

  if (!collectionDetail) {
    return <Spinner message="Showing Collection..." />;
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
      {user?._id === _id && user?._id === createdBy?._id && (
              <div className="absolute top-0 z-1 right-0 p-2">
                <button
                  type="button"
                  className="transition transition duration-500 ease transform hover:-translate-y-1 drop-shadow-lg bg-secondTheme p-2 rounded-full cursor-pointer outline-none shadow-md"
                  onClick={() => {
                    setCollectionEditing((collectionEditing) => !collectionEditing);
                  }}
                >
                  <AiOutlineEdit color="themeColor" fontSize={21} />
                </button>
              </div>
            )}
      {collectionEditing && (
        <CollectionEdit setCollectionEditing={setCollectionEditing} />
      )}
      {collectionDetail && !collectionEditing && (
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
              src={image}
            />

            <div className="w-full px-5 flex-1 xl:min-w-620">
              <div className="flex flex-wrap justify-evenly">
                {[
                  {
                    name: "comments",
                    text: `Comments${
                      collectionComments?.length
                        ? ` (${collectionComments?.length})`
                        : ``
                    }`,
                    condition: true,
                    func: () => setTab("comments"),
                  },
                  {
                    name: "edit",
                    text: `Edit`,
                    condition: true,
                    func: () => setCollectionEditing((prev) => !prev),
                  },
                ].map((item, index) => {
                  if (item?.condition)
                    return (
                      <button key={index} onClick={() => item?.func()}>
                        <span
                          className={`${tabButtonStyles} ${
                            item?.name === tab ? `` : ``
                          }`}
                        >
                          {item?.text}
                        </span>
                      </button>
                    );
                })}
              </div>

              <div className="max-h-370 h-370 overflow-y-scroll">
                {tab === "comments" &&
                  !sideLoading &&
                  !collectionComments?.length && (
                    <h2 className="flex justify-center items-center h-370 text-xl font-bold">{`No Comments Yet, Be the first one to comment...`}</h2>
                  )}
                {tab === "comments" &&
                  sideLoading &&
                  !collectionComments?.length && (
                    <Spinner
                      title={loadingMessage}
                      // message={`Please Do Not Leave This Page...`}
                    />
                  )}
                {tab === "comments" &&
                  collectionComments?.length > 0 &&
                  collectionComments?.map((item) => (
                    <div
                      key={`${item?._id}`}
                      className="p-2 bg-gradient-to-r from-secondTheme to-themeColor flex gap-2 mt-5 items-center bg-secondTheme rounded-lg"
                    >
                      {item?.user?._id && (
                        <Link href={`/user-profile/${item?.user?._id}`}>
                          <div>
                            {item?.user?.image && (
                              <Image
                                height={45}
                                width={45}
                                src={item?.user?.image}
                                className="w-12 h-12 rounded-full cursor-pointer"
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
                        <p className="font-semibold">{item.comment}</p>
                      </div>
                    </div>
                  ))}
              </div>
              {tab === "comments" && (
                <div className="flex flex-wrap mt-6 gap-3">
                  {user?._id && (
                    <Link href={`/user-profile/${user?._id}`}>
                      <div>
                        {user?.image && (
                          <Image
                            height={45}
                            width={45}
                            src={user?.image}
                            className="w-14 h-14 rounded-full cursor-pointer pt-2"
                            alt="user-profile"
                          />
                        )}
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
            {createdBy?._id && (
              <Link href={`/user-profile/${createdBy?._id}`}>
                <div className="cursor-pointer flex items-center mb-4 lg:mb-0 w-full lg:w-auto mr-2 transition transition duration-500 ease transform hover:-translate-y-1">
                  <Image
                    alt={collectionDetail.createdBy.userName}
                    height={35}
                    width={35}
                    className="align-middle rounded-full"
                    src={createdBy?.image}
                  />

                  <p className="inline align-middle text-sm ml-2 font-bold">
                    {getUserName(createdBy?.userName)}
                  </p>
                </div>
              </Link>
            )}

            {/* <div className="font-bold text-sm mr-2 mb-1">
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
                  test
                </span>
              </div> */}

            {/* <div
              onClick={() => {
                navigator.clipboard.writeText(`${nftContract}`);
                toast.info(contractAddressCopiedMessage);
              }}
              className="font-bold text-sm mr-2 mb-1 cursor-pointer transition transition duration-500 ease transform hover:-translate-y-1"
            >
              <FaCopy className="inline mr-2" size={20} />
              <span className="align-middle">
                {`NFT Contract Address`}
              </span>
            </div> */}

            {/* <div className="font-bold text-sm mr-2 mb-1">
              <FaDiceD20 className="inline mr-2" size={20} />
              <span className="align-middle">{`Token ID: #${tokenId}`}</span>
            </div> */}

            {/* <div className="font-bold text-sm mr-2">
              <a href={`${image}`} target="_blank">
                <FaLink className="inline mr-2" size={20} />
                <span className="align-middle">{`IPFS`}</span>
              </a>
            </div> */}

            {/* <div className="font-bold text-sm mr-2 mb-1">
              <a
                href={`https://ropsten.etherscan.io/token/${nftContract}?a=${tokenId}`}
                target="_blank"
              >
                <FaLink className="inline mr-2" size={20} />
                <span className="align-middle">{`Etherscan`}</span>
              </a>
            </div> */}
          </div>
          <h1 className="transition duration-700 text-center mb-2 cursor-pointer hover:text-pink-600 text-2xl font-semibold">
            <p>{`${title}`}</p>
          </h1>
          <p className="text-center text-md text-gray-700 font-bold px-4 lg:px-20 mb-5">
            {about}
          </p>
          <div className="p-2 mt-3 bg-gradient-to-r from-themeColor to-secondTheme rounded-lg drop-shadow-lg flex flex-wrap text-center justify-evenly">
            {/* {buttonArray?.map((item, index) => {
              if (item?.condition) {
                return (
                  <button key={index} onClick={item?.function}>
                    <span className={tabButtonStyles}>{item?.text} </span>
                  </button>
                );
              }
            })} */}
            <button className={tabButtonStyles}>
              <div className="flex gap-2 items-center">
                <p className="font-semibold hover:font-extrabold hover:cursor-pointer">
                  {savedLength}
                </p>
                {!alreadySaved && (
                  <AiOutlineHeart
                    onClick={(e) => {
                      e.stopPropagation();
                      saveCollection();
                    }}
                    className="text-[#ffffff] transition transition duration-500 ease transform hover:-translate-y-1 drop-shadow-lg cursor-pointer"
                    size={25}
                  />
                )}
                {alreadySaved && (
                  <AiFillHeart
                    onClick={(e) => {
                      e.stopPropagation();
                      saveCollection();
                    }}
                    className="text-[#a83f39] transition transition duration-500 ease transform hover:-translate-y-1 drop-shadow-lg cursor-pointer"
                    size={25}
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
                      `https:nft-nation.vercel.app/collection-detail/${collectionId}`
                    );
                    toast.info(shareInfoMessage);
                  }}
                  className="text-[#ffffff] transition transition duration-500 ease transform hover:-translate-y-1 drop-shadow-lg cursor-pointer"
                  size={25}
                />
              </div>
            </button>
          </div>
        </div>
      )}
      <>
        <div className="flex flex-wrap justify-evenly mt-2 mb-2">
          {[
            {
              name: `Items`,
              text: `Items (${collection?.pins?.length})`,
              query: {
                collection: _id,
              },
              condition: true,
            },
            {
              name: "Customize",
              text: "Customize Collection",
              query: {
                postedBy: true,
              },
              condition: user?._id === createdBy?._id,
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
                          collectionId,
                          ...item?.query,
                        },
                      },
                      undefined,
                      { shallow: true }
                    );
                  }}
                  className={`${
                    activeBtn === item?.name
                      ? activeBtnStyles
                      : notActiveBtnStyles
                  }`}
                >
                  {/* <span
                    className={`${tabButtonStyles} ${
                      item?.name === tab ? `` : ``
                    }`}
                  > */}
                  {item?.text}
                  {/* </span> */}
                </button>
              );
          })}
        </div>
        {/* <h2 className="text-center font-bold text-2xl mt-8 mb-4">
          {`Collection Items ${pins?.length}`}
        </h2> */}
        {/* <MasonryLayout pins={pins} /> */}
        <Feed />
        {/* <CollectionFeed /> */}
      </>
    </>
  );
};

export default CollectionDetail;
