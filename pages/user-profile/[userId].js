import React, { useEffect, useState } from "react";
import { AiOutlineEdit } from "react-icons/ai";
import { getUserName } from "../../utils/data";
import {
  errorMessage,
  followErrorMessage,
  followSuccessMessage,
  loginMessage,
  shareInfoMessage,
  unFollowErrorMessage,
  unFollowSuccessMessage,
} from "../../utils/messages";
import Spinner from "../../components/Spinner";
import { useRouter } from "next/router";
import { useSelector } from "react-redux";
import ProfileEdit from "../../components/ProfileEdit";
import axios from "axios";
import Head from "next/head";
import { toast } from "react-toastify";
import { FaShareAlt } from "react-icons/fa";
import moment from "moment";
import { Feed } from "../../components";
import CollectionEdit from "../../components/CollectionEdit";

const UserProfilePage = () => {
  const router = useRouter();
  const { pathname } = router;
  const { user } = useSelector((state) => state.userReducer);
  const { userId } = router.query;
  const [userProfile, setUserProfile] = useState();
  const [editing, setEditing] = useState(false);
  const [collectionEditing, setCollectionEditing] = useState(false);
  const [activeBtn, setActiveBtn] = useState("Owned NFTs");
  const [dropdown, setDropdown] = useState(null);
  const [following, setFollowing] = useState(false);
  const [followingsLength, setFollowingsLength] = useState(0);
  const [followersLength, setFollowersLength] = useState(0);
  const [alreadyFollowed, setAlreadyFollowed] = useState(false);

  const fetchUserDetails = () => {
    axios
      .get(`/api/users/${userId}`)
      .then((res) => {
        const { followers, followings, address } = res?.data?.user;
        setUserProfile(res?.data?.user);
        setAlreadyFollowed(followers?.find((item) => item === user?._id));
        setFollowersLength(followers?.length);
        setFollowingsLength(followings?.length);

        router.push(
          {
            pathname: pathname,
            query: {
              userId,
              owner: address,
            },
          },
          undefined,
          { shallow: true }
        );
      })
      .catch((e) => {
        toast.error(errorMessage);
      });
  };

  const followUser = () => {
    if (!user?._id) {
      toast.info(loginMessage);
      return;
    }
    setFollowing(true);
    axios
      .put(`/api/users/follow/${userId}`, {
        user: user?._id,
      })
      .then((res) => {
        setFollowing(false);
        toast.success(
          alreadyFollowed ? unFollowSuccessMessage : followSuccessMessage
        );
        setAlreadyFollowed((prev) => !prev);
      })
      .catch((e) => {
        console.log(e);
        setFollowing(false);
        toast.error(
          alreadyFollowed ? unFollowErrorMessage : followErrorMessage
        );
      });
  };

  useEffect(() => {
    setActiveBtn("Owned NFTs");
    userId && fetchUserDetails();
  }, [userId]);

  useEffect(() => {
    user?._id &&
      setAlreadyFollowed(
        userProfile?.followers?.find((item) => item === user?._id)
      );
  }, [user, userProfile]);

  if (!userProfile) return <Spinner message="Loading profile..." />;

  const {
    _id,
    userName,
    about,
    address,
    image,
    createdAt,
    followers,
    followings,
  } = userProfile;

  const buttonsArray = {
    Users: {
      name: "Users",
      type: "users",
      buttons: [
        {
          name: `Followers`,
          text: `Followers (${followersLength})`,
          condition: true,
          query: {
            followers: _id,
          },
        },
        {
          name: `Followings`,
          text: `Followings (${followingsLength})`,
          condition: true,
          query: {
            followings: _id,
          },
        },
        {
          name: `${alreadyFollowed ? `Unfollow` : `Follow`}`,
          text: `${alreadyFollowed ? `Unfollow` : `Follow`}`,
          condition: user?._id !== userId,
          func: () => {
            followUser()
          }
        },
      ],
    },

    Pins: {
      name: "NFTs",
      type: "pins",
      buttons: [
        {
          name: "Minted NFTs",
          text: "Minted NFTs",
          condition: true,
          query: {
            createdBy: _id,
          },
        },
        {
          name: "Owned NFTs",
          text: "Owned NFTs",
          condition: true,
          query: {
            owner: address,
          },
        },
        {
          name: "On Sale NFTs",
          text: "On Sale NFTs",
          condition: true,
          query: {
            seller: address,
            auctionEnded: true,
          },
        },
        {
          name: "On Auction NFTs",
          text: "On Auction NFTs",
          condition: true,
          query: {
            seller: address,
            auctionEnded: false,
          },
        },
        {
          name: "Bid NFTs",
          text: "Bid NFTs",
          condition: true,
          query: {
            bids: _id,
          },
        },
        {
          name: "Saved NFTs",
          text: "Saved NFTs",
          condition: true,
          query: {
            saved: _id,
          },
        },
        {
          name: "Commented NFTs",
          text: "Commented NFTs",
          condition: true,
          query: {
            commented: _id,
          },
        },
      ],
    },

    Collections: {
      name: "Collections",
      type: "collections",
      buttons: [
        {
          name: `Created Collection`,
          text: `Created Collection`,
          condition: true,
          query: {
            createdBy: _id,
          },
        },
        {
          name: "Saved Collection",
          text: "Saved Collection",
          condition: true,
          query: {
            saved: _id,
          },
        },
        {
          name: "Commented Collection",
          text: "Commented Collection",
          condition: true,
          query: {
            commented: _id,
          },
        },
        {
          name: "Create Collection",
          text: "Create Collection",
          condition: user?._id === userId,
          func: () => {
            setCollectionEditing(true)
          }
        },
      ],
    },
  };

  return (
    <>
      <Head>
        <title>{`${userName}'s Profile  | NFT Nation`}</title>
        <meta name="description" content={`${about}`} />
        <meta
          property="og:title"
          content={`${userName}'s Profile  | NFT Nation`}
        />
        <meta property="og:description" content={`${about}`} />
        <meta
          property="og:url"
          content={`https://nft-nation.vercel.app/user-profile/${_id}`}
        />
        <meta property="og:type" content="website" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <div className="relative pb-2 h-full justify-center items-center">
        <div className="flex flex-col pb-5">
          <div className="relative flex flex-col mb-7 ">
            <div className="flex flex-col justify-center items-center">
              {!editing && !collectionEditing && (
                <img
                  className=" w-full h-370 2xl:h-300 shadow-lg object-cover rounded-lg"
                  src="https://source.unsplash.com/1600x900/?nature,photography,technology"
                  alt="userProfile-pic"
                />
              )}
              {editing && (
                <ProfileEdit userId={userId} setEditing={setEditing} />
              )}
              {collectionEditing && (
                <CollectionEdit setCollectionEditing={setCollectionEditing} />
              )}
              <img
                className="rounded-full w-20 h-20 -mt-10 shadow-xl object-cover"
                src={image}
                alt="userProfile-pic"
              />
            </div>
            <h1 className="font-bold text-3xl text-center mt-3">
              {getUserName(userName)}
            </h1>
            <p className="font-semibold text-center mt-1">
              {`Joined On: ${moment(createdAt).format("MMM DD, YYYY")}`}
            </p>
            <p className="font-bold text-center mt-1">{about}</p>
            {!editing && !collectionEditing && (
              <div className="absolute top-0 z-1 left-0 p-2">
                <button
                  type="button"
                  className="transition transition duration-500 ease transform hover:-translate-y-1 drop-shadow-lg bg-secondTheme p-2 rounded-full cursor-pointer outline-none shadow-md"
                  onClick={() => {
                    navigator.clipboard.writeText(
                      `https:nft-nation.vercel.app/user-profile/${userId}`
                    );
                    toast.info(shareInfoMessage);
                  }}
                >
                  <FaShareAlt color="themeColor" fontSize={21} />
                </button>
              </div>
            )}
            {user?._id === _id && !collectionEditing && (
              <div className="absolute top-0 z-1 right-0 p-2">
                <button
                  type="button"
                  className="transition transition duration-500 ease transform hover:-translate-y-1 drop-shadow-lg bg-secondTheme p-2 rounded-full cursor-pointer outline-none shadow-md"
                  onClick={() => {
                    setEditing((editing) => !editing);
                    setCollectionEditing(false);
                  }}
                >
                  <AiOutlineEdit color="themeColor" fontSize={21} />
                </button>
              </div>
            )}
          </div>

          <div className="flex flex-col sm:flex-row text-center items-start justify-evenly mb-2 gap-2">
            {Object.keys(buttonsArray).map((item, index) => {
              return (
                <div
                  key={index}
                  className="w-full max-w-sm px-0 py-1 mx-0 font-bold text-sm"
                >
                  <div
                    onMouseEnter={() => setDropdown(item)}
                    onMouseLeave={() => setDropdown(null)}
                    onClick={() => setDropdown(prev => !prev ? item : prev === item ? null : item)}
                    className="max-w-sm mx-0 space-y-6"
                  >
                    <div className="dropdown-menu">
                      <div
                        className={`${
                          buttonsArray[`${item}`].buttons.find(
                            (item) => item.name === activeBtn
                          )
                            ? `bg-themeColor`
                            : ``
                        } rounded-lg shadow-xl flex items-center px-4 py-2 cursor-pointer`}
                      >
                        <input
                          type="text"
                          placeholder={`${
                            buttonsArray[`${item}`].buttons.find(
                              (item) => item.name === activeBtn
                            )
                              ? activeBtn
                              : buttonsArray[`${item}`].name
                          }`}
                          readOnly
                          className={`${
                            buttonsArray[`${item}`].buttons.find(
                              (item) => item.name === activeBtn
                            )
                              ? `bg-themeColor placeholder-[#ffffff]`
                              : `bg-transparent placeholder-[#000000]`
                          } pointer-events-none font-bold outline-none w-full h-full flex-1`}
                        />
                        <svg
                          width="20"
                          height="10"
                          viewBox="0 0 20 10"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <line
                            x1="0"
                            y1="0"
                            x2="10"
                            y2="10"
                            stroke={`${
                              buttonsArray[`${item}`].buttons.find(
                                (item) => item.name === activeBtn
                              )
                                ? `#ffffff`
                                : `#000000`
                            }`}
                            strokeWidth="2"
                          />
                          <line
                            x1="20"
                            y1="0"
                            x2="10"
                            y2="10"
                            stroke={`${
                              buttonsArray[`${item}`].buttons.find(
                                (item) => item.name === activeBtn
                              )
                                ? `#ffffff`
                                : `#000000`
                            }`}
                            strokeWidth="2"
                          />
                        </svg>
                      </div>

                      {dropdown === item && (
                        <>
                          <div className="animation-slide-in bg-white rounded-lg shadow-xl px-2 py-2 relative mt-8 z-10">
                            <svg
                              className="absolute bottom-full right-4"
                              width="30"
                              height="20"
                              viewBox="0 0 30 20"
                              xmlns="http://www.w3.org/2000/svg"
                            >
                              <polygon
                                points="15, 0 30, 20 0, 20"
                                fill="transparent"
                              />
                            </svg>

                            {buttonsArray[`${item}`].buttons.map(
                              (ele, index) => {
                                if(ele?.condition) return (
                                  <div
                                    key={index}
                                    onClick={(e) => {
                                      setDropdown(null);
                                      if(!ele?.query) {
                                        ele.func()
                                        return
                                      }
                                      setActiveBtn(ele.name);

                                      router.push(
                                        {
                                          pathname: pathname,
                                          query: {
                                            userId,
                                            type: buttonsArray[`${item}`]?.type,
                                            ...ele?.query,
                                          },
                                        },
                                        undefined,
                                        { shallow: true }
                                      );
                                    }}
                                    className="py-2 rounded-lg flex items-center w-full hover:bg-themeColor hover:text-[#ffffff]"
                                  >
                                    <a href="#" className="flex-1">
                                      <div className="text-gray-400">
                                        {ele?.text}
                                      </div>
                                    </a>
                                  </div>
                                );
                              }
                            )}
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
          <div className="px-2">
            <Feed />
          </div>
        </div>
      </div>
    </>
  );
};

export default UserProfilePage;
