import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { useSelector } from "react-redux";
import { useDispatch } from "react-redux";
import {
  buttonStyle,
  etherAddress,
  getImage,
  getIpfsImage,
  getMaxBid,
  getUserName,
} from "../utils/data";
import {
  contractAddressCopiedMessage,
  followErrorMessage,
  followSuccessMessage,
  loginMessage,
  saveCollectionErrorMessage,
  saveErrorMessage,
  unFollowErrorMessage,
  unFollowSuccessMessage,
} from "../utils/messages";
import axios from "axios";
import {
  COLLECTION_SET,
  USER_GET_SUCCESS,
} from "../redux/constants/UserTypes";
import Image from "next/image";
import { AiFillHeart, AiOutlineHeart } from "react-icons/ai";
import { toast } from "react-toastify";
import moment from "moment";

const Pin = ({ pin }) => {
  const dispatch = useDispatch();

  const {
    postedBy,
    image,
    _id,
    title,
    about,
    category,
    destination,
    createdAt,
    itemId,
    tokenId,
    nftContract,
    price,
    seller,
    saved,
    owner,
    commentsCount,
    bids,
    auctionEnded,
  } = pin;

  const priceShowCondition =
    price !== "0.0" && owner === etherAddress && auctionEnded;

  const highestBidShowCondition =
    price === "0.0" && owner === etherAddress && !auctionEnded;

  const router = useRouter();
  const { query } = router;
  const { collectionId } = query;

  const { user, collection } = useSelector((state) => state.userReducer);

  const [alreadySaved, setAlreadySaved] = useState(
    saved?.find((item) => item === user?._id)
  );
  const [savedLength, setSavedLenth] = useState(saved?.length);
  const [savingPost, setSavingPost] = useState(false);

  const savePin = () => {
    if (!user?._id) {
      toast.info(loginMessage);
      return;
    }
    setSavingPost(true);
    axios
      .put(`/api/pins/save/${_id}`, {
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

  const [alreadyAdded, setAlreadyAdded] = useState(
    collection?.pins?.find((item) => item === _id)
  );

  const [addedLength, setAddedLenth] = useState(collection?.pins?.length);
  const [addingPost, setAddingPost] = useState(false);

  const [following, setFollowing] = useState(false);
  const [alreadyFollowed, setAlreadyFollowed] = useState(
    user?.followings?.find((item) => item === postedBy?._id)
  );

  useEffect(() => {
    setAlreadyFollowed(
      user?.followings?.find((item) => item === postedBy?._id)
    );
  }, [user]);

  const followUser = () => {
    if (!user?._id) {
      toast.info(loginMessage);
      return;
    }
    setFollowing(true);
    axios
      .put(`/api/users/follow/${postedBy?._id}`, {
        user: user?._id,
      })
      .then((res) => {
        setFollowing(false);
        toast.success(
          alreadyFollowed ? unFollowSuccessMessage : followSuccessMessage
        );
        // setFollowingsLength((prev) => (alreadyFollowed ? prev - 1 : prev + 1));

        const filteredFollowings = alreadyFollowed
          ? user?.followings.filter((item, index) => item !== postedBy?._id)
          : [...user?.followings, postedBy?._id];

        dispatch({
          type: USER_GET_SUCCESS,
          payload: {
            ...user,
            followings: filteredFollowings,
            followingsCount: filteredFollowings.length,
          },
        });

        // setAlreadyFollowed((prev) => !prev);
      })
      .catch((e) => {
        console.log(e);
        setFollowing(false);
        toast.error(
          alreadyFollowed ? unFollowErrorMessage : followErrorMessage
        );
      });
  };

  const addPinToCollection = () => {
    if (!user?._id) {
      toast.info(loginMessage);
      return;
    }
    setAddingPost(true);
    axios
      .put(`/api/collections/pins/${collection?._id}`, {
        pinId: _id,
      })
      .then((res) => {
        setAddingPost(false);
        // toast.success(alreadySaved ? unsaveSuccessMessage : saveSuccessMessage);
        const filteredCollectionPins = alreadyAdded
          ? collection.pins.filter((item, index) => item !== _id)
          : [...collection.pins, _id];
        const filteredCollectionPinsCount = alreadyAdded
          ? collection.pinsCount - 1
          : collection.pinsCount + 1;
        dispatch({
          type: COLLECTION_SET,
          payload: {
            ...collection,
            pins: filteredCollectionPins,
            pinsCount: filteredCollectionPinsCount,
          },
        });

        setAddedLenth((prev) => (alreadyAdded ? prev - 1 : prev + 1));
        setAlreadyAdded((prev) => !prev);
      })
      .catch((e) => {
        console.log(e);
        setAddingPost(false);
        toast.error(saveCollectionErrorMessage);
      });
  };

  return (
    <div className="bg-gradient-to-r from-secondTheme to-themeColor rounded-xl shadow-xl hover:shadow-2xl hover:subpixel-antialiased transform transition-all ease duration-500 m-4">
      <div
        onClick={() =>
          router.push(`/pin-detail/${_id}?type=pins&category=${category}`)
        }
        className="relative cursor-pointer w-25"
      >
        <div className="flex items-center justify-between px-4">
          <div
            onClick={(e) => {
              e.stopPropagation();
              router.push(`/user-profile/${postedBy?._id}`);
            }}
            className="flex justify-between items-center py-4 transition transition duration-500 ease transform hover:scale-1.5"
          >
            <Image
              height={45}
              width={45}
              className="w-12 rounded-full"
              src={getImage(postedBy?.image)}
              alt={`${getUserName(postedBy?.userName)}`}
            />
            <div className="ml-3">
              <h1 className="text-sm font-bold text-gray-800 cursor-pointer">
                {getUserName(postedBy?.userName)}
              </h1>
              <p className="text-sm font-semibold text-gray-800">
                Minted {moment(createdAt).fromNow()}
              </p>
            </div>
          </div>

          <div>
            {user?._id !== postedBy?._id && (
              <span
                onClick={(e) => {
                  e.stopPropagation();
                  // addPinToCollection();
                  followUser();
                }}
                className={buttonStyle}
              >
                {alreadyFollowed ? `UnFollow` : `Follow`}
              </span>
            )}
          </div>
        </div>
        {image && (
          <Image
            placeholder="blur"
            blurDataURL="/favicon.png"
            height={200}
            width={180}
            layout="responsive"
            className="rounded-lg w-full"
            src={getImage(image)}
            alt={`${title}`}
          />
        )}
        <div className="p-6 pb-0">
          <h2 className="text-sm text-gray-800 font-semibold">{`#${tokenId} ${title}`}</h2>
          <p className="text-sm font-semibold">{about}</p>
        </div>
        <div className="flex flex-row px-2 pb-1">
          {(priceShowCondition || highestBidShowCondition) && (
            <span className={buttonStyle}>
              {priceShowCondition ? `On Sale` : `On Auction`}
            </span>
          )}
          {(priceShowCondition || highestBidShowCondition) && (
            <span className={buttonStyle}>
              {priceShowCondition
                ? `${price} MATIC`
                : `Current Bid: ${
                    bids?.length
                      ? `${getMaxBid(bids)?.bid} Matic`
                      : `No Bids Yet`
                  }`}
            </span>
          )}
        </div>

        <div className="flex flex-row px-2 pb-1">
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

          <a
            onClick={(e) => {
              e.stopPropagation();
            }}
            href={getIpfsImage(image)}
            target="_blank"
          >
            <span className={buttonStyle}>{`IPFS`}</span>
          </a>

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

        <div className="p-6 pt-2">
          <div className="flex space-x-4">
            <div className="flex space-x-1 items-center">
              <span>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-7 w-7 text-gray-600 cursor-pointer"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                  />
                </svg>
              </span>
              <span>{commentsCount}</span>
            </div>
            <div className="flex space-x-1 items-center">
              <span>
                {!alreadySaved && (
                  <AiOutlineHeart
                    onClick={(e) => {
                      e.stopPropagation();
                      savePin();
                    }}
                    className="text-[#000000] transition transition duration-500 ease transform hover:-translate-y-1 drop-shadow-lg cursor-pointer"
                    size={25}
                  />
                )}
                {alreadySaved && (
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
              <span>{savedLength}</span>
            </div>
            <div className="flex space-x-1 items-center">
              {collectionId && collection?.createdBy?._id === user?._id && (
                <span
                  onClick={(e) => {
                    e.stopPropagation();
                    addPinToCollection();
                  }}
                  className={buttonStyle}
                >
                  {alreadyAdded ? `Remove` : `Add`}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Pin;
