import React, { useEffect, useState } from "react";
import { AiOutlineEdit } from "react-icons/ai";
import { getImage, getUserName } from "../../utils/data";
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
import { useDispatch, useSelector } from "react-redux";
import ProfileEdit from "../../components/ProfileEdit";
import axios from "axios";
import Head from "next/head";
import { toast } from "react-toastify";
import { FaShareAlt } from "react-icons/fa";
import moment from "moment";
import { Feed } from "../../components";
import CollectionEdit from "../../components/CollectionEdit";
import Image from "next/image";
import { CURRENT_PROFILE_SET, USER_GET_SUCCESS } from "../../redux/constants/UserTypes";

const UserProfilePage = () => {
  const router = useRouter();
  const dispatch = useDispatch()
  const { pathname, query } = router;
  const { user, currentProfile } = useSelector((state) => state.userReducer);
  const { userId, type } = query;
  const [userProfile, setUserProfile] = useState();
  const [editing, setEditing] = useState(false);
  const [collectionEditing, setCollectionEditing] = useState(false);
  const [activeBtn, setActiveBtn] = useState("Owned NFTs");
  const [dropdown, setDropdown] = useState(null);
  const [dropdownChange, setDropdownChange] = useState(true);
  const [following, setFollowing] = useState(false);
  // const [followingsLength, setFollowingsLength] = useState(0);
  // const [followersLength, setFollowersLength] = useState(0);
  const [alreadyFollowed, setAlreadyFollowed] = useState(user?.followings?.find((item) => item === userId));

  const fetchUserDetails = () => {
    axios
      .get(`/api/users/${userId}`)
      .then((res) => {
        const { followers, followings, address } = res?.data?.user;
        setUserProfile(res?.data?.user);
        dispatch({
          type: CURRENT_PROFILE_SET,
          payload: res?.data?.user
        })
        setAlreadyFollowed(followers?.find((item) => item === user?._id));
        // setFollowersLength(followers?.length);
        // setFollowingsLength(followings?.length);

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
        
        const filteredFollowings = alreadyFollowed
        ? user?.followings.filter((item, index) => item !== userId)
        : [...user?.followings, userId];
        

        dispatch({
          type: USER_GET_SUCCESS,
          payload: {
            ...user,
            followings: filteredFollowings,
            followingsCount: filteredFollowings.length
          },
        });

        const filteredFollowers = alreadyFollowed
        ? currentProfile?.followers.filter((item, index) => item !== user?._id)
        : [...currentProfile?.followers, user?._id];

        dispatch({
          type: CURRENT_PROFILE_SET,
          payload: {
            ...currentProfile,
            followers: filteredFollowers,
            followersCount: filteredFollowers.length
          },
        });

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
        user?.followings?.find((item) => item === userId)
      );
  }, [user, currentProfile]);

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
    followersCount,
    followingsCount,
  } = userProfile;

  const buttonsArray = {
    Users: {
      name: "Users",
      type: "users",
      buttons: [
        {
          name: `Followers`,
          text: `Followers (${currentProfile?.followersCount})`,
          condition: true,
          query: {
            followers: true,
          },
        },
        {
          name: `Followings`,
          text: `Followings (${followingsCount})`,
          condition: true,
          query: {
            followings: true,
          },
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
            createdBy: true,
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
            bids: true,
          },
        },
        {
          name: "Saved NFTs",
          text: "Saved NFTs",
          condition: true,
          query: {
            saved: true,
          },
        },
        {
          name: "Commented NFTs",
          text: "Commented NFTs",
          condition: true,
          query: {
            commented: true,
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
            createdBy: true,
          },
        },
        {
          name: "Saved Collection",
          text: "Saved Collection",
          condition: true,
          query: {
            saved: true,
          },
        },
        {
          name: "Commented Collection",
          text: "Commented Collection",
          condition: true,
          query: {
            commented: true,
          },
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
      <div className="bg-gradient-to-r from-secondTheme to-themeColor relative rounded-lg pb-2 h-full justify-center items-center">
        <div className="flex flex-col pb-5">
          <div className="mb-10">
            {editing && <ProfileEdit userId={userId} setEditing={setEditing} />}
            {collectionEditing && (
              <CollectionEdit setCollectionEditing={setCollectionEditing} />
            )}
          </div>
          {!editing && !collectionEditing && (
            <div className="relative flex flex-col mb-2 pb-10">
              <div className="flex flex-col justify-center items-center z-10">
                <Image
                  className="rounded-lg w-20 h-20 -mt-64"
                  placeholder="blur"
                  blurDataURL="/favicon.png"
                  height={250}
                  width={250}
                  src={getImage(image)}
                  objectFit="cover"
                  alt="userProfile-pic"
                />
              </div>

              <section className="relative pt-16 bg-blueGray-200">
                <div className="container mx-auto px-4">
                  <div className="relative flex flex-col min-w-0 break-words bg-gradient-to-r from-themeColor to-secondTheme w-full mb-6 shadow-xl rounded-lg -mt-32">
                    <div className="px-6">
                      <div className="flex flex-wrap justify-between lg:pt-10">
                        {/* <div className="w-full lg:w-3/12 px-4 lg:order-2 flex justify-center">
                          <div className="relative">
                            <img
                              alt="..."
                              src="https://demos.creative-tim.com/notus-js/assets/img/team-2-800x800.jpg"
                              className="shadow-xl rounded-full h-auto align-middle border-none absolute -m-16 -ml-20 lg:-ml-16 max-w-150-px"
                            />
                          </div>
                        </div> */}
                        <div className="flex justify-center w-full lg:w-4/12 px-4 lg:order-3 lg:text-right lg:self-center">
                          <div className="flex gap-2 py-2 px-3 mt-20 lg:mt-0">
                            {user?._id !== userId && (
                              <button
                                onClick={() => {
                                  followUser();
                                }}
                                className="bg-pink-500 bg-themeColor uppercase text-[#ffffff] font-bold hover:shadow-md shadow text-xs px-4 py-2 rounded outline-none focus:outline-none sm:mr-2 mb-1 ease-linear transition-all duration-150"
                                type="button"
                              >
                                {`${alreadyFollowed ? `Unfollow` : `Follow`}`}
                              </button>
                            )}
                            {user?._id === userId && (
                              <button
                                onClick={() => {
                                  setCollectionEditing(true);
                                  setEditing(false);
                                }}
                                className="bg-pink-500 bg-themeColor uppercase text-[#ffffff] font-bold hover:shadow-md shadow text-xs px-4 py-2 rounded outline-none focus:outline-none sm:mr-2 mb-1 ease-linear transition-all duration-150"
                                type="button"
                              >
                                {`Create Collection`}
                              </button>
                            )}
                            {user?._id === userId && (
                              <button
                                onClick={() => {
                                  setEditing(true);
                                  setCollectionEditing(false);
                                }}
                                className="bg-pink-500 bg-themeColor uppercase text-[#ffffff] font-bold hover:shadow-md shadow text-xs px-4 py-2 rounded outline-none focus:outline-none sm:mr-2 mb-1 ease-linear transition-all duration-150"
                                type="button"
                              >
                                {`Edit`}
                              </button>
                            )}

                            <button
                              onClick={() => {
                                navigator.clipboard.writeText(
                                  `https:nft-nation.vercel.app/user-profile/${userId}`
                                );
                                toast.info(shareInfoMessage);
                              }}
                              className="bg-pink-500 bg-themeColor uppercase text-[#ffffff] font-bold hover:shadow-md shadow text-xs px-4 py-2 rounded outline-none focus:outline-none sm:mr-2 mb-1 ease-linear transition-all duration-150"
                              type="button"
                            >
                              {`Share`}
                            </button>
                          </div>
                        </div>
                        <div className="w-full lg:w-4/12 px-4 lg:order-1">
                          <div className="flex justify-center py-2 lg:pt-4">
                            <div className="mr-4 p-3 text-center">
                              <span className="text-xl font-bold block uppercase tracking-wide text-blueGray-600">
                                {currentProfile?.followersCount}
                              </span>
                              <span className="text-sm text-blueGray-400">
                                Followers
                              </span>
                            </div>
                            <div className="mr-4 p-3 text-center">
                              <span className="text-xl font-bold block uppercase tracking-wide text-blueGray-600">
                                {followingsCount}
                              </span>
                              <span className="text-sm text-blueGray-400">
                                Following
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="text-center mt-2">
                        <h3 className="text-xl font-semibold leading-normal mb-2 text-blueGray-700 mb-2">
                          {getUserName(userName)}
                        </h3>
                        <div className="text-sm leading-normal mt-0 mb-4 text-blueGray-400 font-bold">
                          <i className="fas fa-map-marker-alt mr-2 text-lg text-blueGray-400"></i>
                          {`Joined On: ${moment(createdAt).format(
                            "MMM DD, YYYY"
                          )}`}
                        </div>
                        {/* <div className="mb-2 text-blueGray-600 mt-10">
                        <i className="fas fa-briefcase mr-2 text-lg text-blueGray-400"></i>
                        Solution Manager - Creative Tim Officer
                      </div>
                      <div className="mb-2 text-blueGray-600">
                        <i className="fas fa-university mr-2 text-lg text-blueGray-400"></i>
                        University of Computer Science
                      </div> */}
                      </div>
                      {about && (
                        <div className="mt-10 py-10 border-t border-blueGray-200 text-center">
                          <div className="flex flex-wrap justify-center">
                            <div className="w-full lg:w-9/12 px-4">
                              <p className="mb-4 text-lg leading-relaxed text-blueGray-700">
                                {about}
                              </p>
                              {/* <a
                            href="#pablo"
                            className="font-normal text-pink-500"
                          >
                            Show more
                          </a> */}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </section>

              {!editing && !collectionEditing && (
                <div className="absolute -top-10 z-1 left-0 p-2">
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
                <div className="absolute -top-10 z-1 right-0 p-2">
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
          )}

          <div className="flex flex-col sm:flex-row text-center items-start justify-evenly mb-2 gap-2">
            {Object.keys(buttonsArray).map((item, index) => {
              return (
                <div
                  key={index}
                  className="w-full max-w-sm px-0 py-1 mx-0 font-bold text-sm"
                >
                  <div
                    // onMouseEnter={() => setDropdown(item)}
                    // onMouseLeave={() => setDropdown(null)}
                    onClick={() =>
                      setDropdown((prev) => (prev === item ? null : item))
                    }
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

                      {dropdownChange && dropdown === item && (
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
                                if (ele?.condition)
                                  return (
                                    <div
                                      key={index}
                                      onClick={(e) => {
                                        setDropdownChange(false);
                                        // setDropdown(null);
                                        setDropdownChange(true);
                                        setActiveBtn(ele.name);

                                        router.push(
                                          {
                                            pathname: pathname,
                                            query: {
                                              userId,
                                              type: buttonsArray[`${item}`]
                                                ?.type,
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
