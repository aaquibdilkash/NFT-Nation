import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { useSelector } from "react-redux";
import { useDispatch } from "react-redux";
import {
  buttonStyle,
  getImage,
  getUserName,
  sendNotifications,
} from "../utils/data";
import {
  followErrorMessage,
  followSuccessMessage,
  loginMessage,
  saveErrorMessage,
  unFollowErrorMessage,
  unFollowSuccessMessage,
} from "../utils/messages";
import axios from "axios";
import Image from "next/image";
import {
  AiFillHeart,
  AiOutlineHeart,
  AiOutlineLoading3Quarters,
} from "react-icons/ai";
import { toast } from "react-toastify";
import moment from "moment";
import { USER_GET_SUCCESS } from "../redux/constants/UserTypes";
import Link from "next/link";

const Collection = ({ collection }) => {
  const {
    title,
    about,
    createdBy,
    image,
    _id,
    category,
    pinsCount,
    destination,
    saved,
    commentsCount,
    ownersCount,
    onSaleCount,
    onAuctionCount,
    volume,
    change,
    createdAt,
  } = collection;

  const router = useRouter();
  const dispatch = useDispatch();

  const { user } = useSelector((state) => state.userReducer);

  const [alreadySaved, setAlreadySaved] = useState(
    saved?.find((item) => item === user?._id)
  );
  const [savingPost, setSavingPost] = useState(false);
  const [savedLength, setSavedLenth] = useState(saved?.length);

  const [following, setFollowing] = useState(false);
  const [alreadyFollowed, setAlreadyFollowed] = useState(
    user?.followings?.find((item) => item === createdBy?._id)
  );

  useEffect(() => {
    setAlreadyFollowed(
      user?.followings?.find((item) => item === createdBy?._id)
    );
  }, [user]);

  const followUser = () => {
    if (!user?._id) {
      toast.info(loginMessage);
      return;
    }

    if (following) {
      return;
    }

    setFollowing(true);
    axios
      .put(`/api/users/follow/${createdBy?._id}`, {
        user: user?._id,
      })
      .then((res) => {
        if (!alreadyFollowed) {
          let to = [createdBy?._id, ...user?.followers];
          to = [...new Set(to)];
          to = to.filter((item) => item !== user?._id);
          to = to.map((item) => ({ user: item }));
          const obj = {
            type: "New Follow",
            byUser: user?._id,
            toUser: createdBy?._id,
            to,
          };
          sendNotifications(
            obj,
            (res) => {
              // console.log(res)
            },
            (e) => {
              // console.log(e)
            }
          );
        }

        setFollowing(false);
        toast.success(
          alreadyFollowed ? unFollowSuccessMessage : followSuccessMessage
        );

        const filteredFollowings = alreadyFollowed
          ? user?.followings.filter((item, index) => item !== createdBy?._id)
          : [...user?.followings, createdBy?._id];

        dispatch({
          type: USER_GET_SUCCESS,
          payload: {
            ...user,
            followings: filteredFollowings,
            followingsCount: filteredFollowings.length,
          },
        });
      })
      .catch((e) => {
        console.log(e);
        setFollowing(false);
        toast.error(
          alreadyFollowed ? unFollowErrorMessage : followErrorMessage
        );
      });
  };

  const saveCollection = () => {
    if (!user?._id) {
      toast.info(loginMessage);
      return;
    }

    if (savingPost) {
      return;
    }

    setSavingPost(true);
    axios
      .put(`/api/collections/save/${_id}`, {
        user: user?._id,
      })
      .then((res) => {
        if (!alreadySaved) {
          let to = [...user?.followers, createdBy?._id];
          to = [...new Set(to)];
          to = to.filter((item) => item !== user?._id);
          to = to.map((item) => ({ user: item }));
          const obj = {
            type: "New Save",
            byUser: user?._id,
            pinCollection: _id,
            to,
          };
          sendNotifications(
            obj,
            (res) => {
              // console.log(res);
            },
            (e) => {
              // console.log(e);
            }
          );
        }

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

  return (
    <div className="transition duration-200 ease transform hover:-translate-y-3 bg-gradient-to-r from-secondTheme to-themeColor rounded-xl shadow-xl hover:shadow-2xl transform transition-all ease duration-500 m-4">
      <Link href={`/collections/${_id}`}>
        <div
          // onClick={() => router.push(`/collections/${_id}`)}
          className="relative cursor-pointer w-25"
        >
          <div className="flex items-center justify-between px-4">
            <div
              onClick={(e) => {
                e.stopPropagation();
                router.push(`/users/${createdBy?.userName}`);
              }}
              className="flex justify-between items-center py-4 transition transition duration-500 ease transform hover:scale-1.5"
            >
              <Image
                height={45}
                width={45}
                className="w-12 rounded-full"
                src={getImage(createdBy?.image)}
                alt={`${getUserName(createdBy?.userName)}`}
              />
              <div className="ml-3">
                <h1 className="text-sm font-bold text-gray-800 cursor-pointer">
                  {getUserName(createdBy?.userName)}
                </h1>
                <p className="text-sm font-semibold text-gray-800">
                  Created {moment(createdAt).fromNow()}
                </p>
              </div>
            </div>

            <div>
              {user?._id !== createdBy?._id && (
                <span
                  onClick={(e) => {
                    e.stopPropagation();
                    // addPinToCollection();
                    followUser();
                  }}
                  className={buttonStyle}
                >
                  {!following ? (
                    `${alreadyFollowed ? `UnFollow` : `Follow`}`
                  ) : (
                    <AiOutlineLoading3Quarters
                      onClick={(e) => {
                        e.stopPropagation();
                        // savePin();
                      }}
                      className="mx-6 font-bold animate-spin text-[#ffffff] drop-shadow-lg cursor-pointer"
                      size={15}
                    />
                  )}{" "}
                </span>
              )}
            </div>
          </div>
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
          <div className="py-6 px-4 pb-0">
            <h2 className="text-sm text-gray-800 font-semibold">{`${title}`}</h2>
            <p className="text-sm font-semibold">{about}</p>
          </div>
          <div className="flex flex-row px-2 py-2">
            <span className={buttonStyle}>{`NFTs: ${pinsCount}`}</span>
            <span className={buttonStyle}>{`Owners: ${ownersCount}`}</span>
            <span
              className={buttonStyle}
            >{`On Auction: ${onAuctionCount}`}</span>
          </div>
          <div className="flex flex-row px-2 pb-1">
            <span className={buttonStyle}>{`On Sale: ${onSaleCount}`}</span>
            <span className={buttonStyle}>{`Volume: ${volume}`}</span>
            <span className={buttonStyle}>{`Change: ${change}%`}</span>
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
                {!savingPost ? (
                  <span>
                    {!alreadySaved ? (
                      <AiOutlineHeart
                        onClick={(e) => {
                          e.stopPropagation();
                          saveCollection();
                        }}
                        className="text-[#000000] transition transition duration-500 ease transform hover:-translate-y-1 drop-shadow-lg cursor-pointer"
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
                    className="animate-spin text-[#000000] drop-shadow-lg cursor-pointer"
                    size={22}
                  />
                )}
                <span>{savedLength}</span>
              </div>
            </div>
          </div>
        </div>
      </Link>
    </div>
  );
};

export default Collection;
