import { useEffect, useState } from "react";
import Link from "next/link";
import Spinner from "../../components/Spinner";
import { useDispatch, useSelector } from "react-redux";
import { buttonStyle, getImage, getUserName } from "../../utils/data";
import {
  commentAddErrorMessage,
  commentAddSuccessMessage,
  errorMessage,
  loginMessage,
  saveErrorMessage,
  shareInfoMessage,
} from "../../utils/messages";
import { useRouter } from "next/router";
import axios from "axios";
import Head from "next/head";
import Image from "next/image";
import { FaShareAlt } from "react-icons/fa";
import { toast } from "react-toastify";
import { Feed } from "../../components";
import { AiFillHeart, AiOutlineEdit, AiOutlineHeart, AiOutlineLoading3Quarters } from "react-icons/ai";
import { COLLECTION_SET } from "../../redux/constants/UserTypes";
import CollectionEdit from "../../components/CollectionEdit";
import { MdDeleteForever } from "react-icons/md";
import moment from "moment";

const tabButtonStyles =
  "m-2 shadow-lg hover:drop-shadow-lg transition duration-500 ease transform hover:-translate-y-1 inline-block bg-themeColor text-md font-semibold rounded-full text-secondTheme px-4 py-2 cursor-pointer";

const CollectionDetail = () => {
  const router = useRouter();
  const dispatch = useDispatch();
  const { pathname, query } = router;
  const { collectionId } = query;
  const { user, collection } = useSelector((state) => state.userReducer);
  const [refresh, setRefresh] = useState(false);
  const [collectionComments, setCollectionComments] = useState([]);
  const [activeBtn, setActiveBtn] = useState("Items");
  const [sideLoading, setSideLoading] = useState(true);
  const [collectionEditing, setCollectionEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [comment, setComment] = useState("");
  const [addingComment, setAddingComment] = useState(false);
  const [savingPost, setSavingPost] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState("Fetching Comments...");
  const [alreadySaved, setAlreadySaved] = useState(false);
  const [savedLength, setSavedLenth] = useState(0);
  const [tab, setTab] = useState("comments");

  const {
    _id,
    title,
    about,
    category,
    saved,
    image,
    createdBy,
    pins,
    ownersCount,
    onSaleCount,
    onAuctionCount,
    volume,
    change,
    createdAt,
  } = collection;

  const deleteComment = (id) => {
    setSideLoading(true)
    setLoadingMessage("Deleting Comment...")
    axios
      .delete(`/api/collections/comments/${collectionId}/${id}`)
      .then((res) => {
        fetchCollectionComments();
        setSideLoading(false)
      })
      .catch((e) => {
        toast.error(errorMessage);
        setSideLoading(false)
        // console.log(e);
      });
  };

  const fetchCollectionComments = () => {
    setSideLoading(true);
    setLoadingMessage("Fetching Comments...")
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
    setLoading(true);
    axios
      .get(`/api/collections/${collectionId}`)
      .then((res) => {
        dispatch({
          type: COLLECTION_SET,
          payload: res?.data?.collection,
        });
        setAlreadySaved(
          res?.data?.collection?.saved?.find((item) => item === user?._id)
        );
        setSavedLenth(res?.data?.collection?.saved?.length);

        setActiveBtn("Items");
        setLoading(false);

        router.replace(
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
  }, [user, collection]);

  useEffect(() => {
    collectionId && fetchCollectionDetails();
    collectionId && fetchCollectionComments();
  }, [collectionId, refresh]);

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

    if(savingPost) {
      return
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

  if (loading) {
    return <Spinner message="Showing Collection..." />;
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
      {collection && !collectionEditing && (
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
                src={getImage(image)}
              />

            <div className="w-full px-5 flex-1 xl:min-w-620 mt-4">
              <div className="flex flex-wrap justify-center lg:gap-2">
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
                    condition: user?._id === collection?.createdBy?._id,
                    func: () => setCollectionEditing((prev) => !prev),
                  },
                ].map((item, index) => {
                  if (item?.condition)
                    return (
                      <button className="mt-1" key={index} onClick={() => item?.func()}>
                        <span
                          className={`${buttonStyle} text-xl`}
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
            {createdBy?._id && (
              <Link href={`/user-profile/${createdBy?._id}`}>
                <div className="cursor-pointer flex items-center mb-4 lg:mb-0 w-full lg:w-auto mr-2 transition transition duration-500 ease transform hover:-translate-y-1">
                  <Image
                    alt={collection.createdBy.userName}
                    height={35}
                    width={35}
                    className="align-middle rounded-full"
                    src={getImage(createdBy?.image)}
                  />

                  <p className="inline align-middle text-sm ml-2 font-bold">
                    {getUserName(createdBy?.userName)}
                  </p>
                </div>
              </Link>
            )}
          </div>

          
          <h1 className="transition duration-700 text-center mb-2 cursor-pointer hover:text-pink-600 text-2xl font-semibold">
            <p>{`${title}`}</p>
          </h1>
          <p className="text-center text-md text-gray-700 font-bold px-4 lg:px-20 mb-5">
            {about}
          </p>

          <div className="flex flex-wrap justify-center">
          {
              [
                {
                  text: `Created ${moment(createdAt).fromNow()}`
                },
                {
                  text: `NFTs: ${collection?.pins?.length}`
                },
                {
                  text: `Owners: ${ownersCount}`
                },
                {
                  text: `on Auction: ${onAuctionCount}`
                },
                {
                  text: `On Sale: ${onSaleCount}`
                },
                {
                  text: `Volume: ${volume}`
                },
                {
                  text: `Change: ${change}%`
                },
              ].map((item, index) => {
                return (
                  <div key={index} className="font-bold text-sm mr-2 mb-1">
                  <span className={buttonStyle}>{item?.text}</span>
                  </div>
                )
              })
            }
          </div>
          <div className="p-2 mt-3 bg-gradient-to-r from-themeColor to-secondTheme rounded-lg drop-shadow-lg flex flex-wrap text-center justify-evenly">
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
                        saveCollection();
                      }}
                      className="text-[#ffffff] transition transition duration-500 ease transform hover:-translate-y-1 drop-shadow-lg cursor-pointer"
                      size={25}
                    />
                  ) : (
                    <AiFillHeart
                      onClick={(e) => {
                        e.stopPropagation();
                        saveCollection();
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
              )
            }
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
                type: "pins",
                collection: true,
              },
              condition: true,
            },
            {
              name: "Customize",
              text: "Customize Collection",
              query: {
                type: "pins",
                createdBy: true,
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
                  className={`${buttonStyle} ${activeBtn === item?.name ? `` : `bg-transparent text-[#000000]`}`}

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

export default CollectionDetail;
