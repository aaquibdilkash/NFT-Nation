import React, { useEffect, useState } from "react";
import { AiOutlineEdit } from "react-icons/ai";
import { getUserName } from "../../utils/data";
import { shareInfoMessage } from "../../utils/messages";
import Spinner from "../../components/Spinner";
import { useRouter } from "next/router";
import { useSelector } from "react-redux";
import ProfileEdit from "../../components/ProfileEdit";
import axios from "axios";
import Head from "next/head";
import Image from "next/image";
import { toast } from "react-toastify";
import { FaShareAlt } from "react-icons/fa";
import moment from "moment";
import { Feed } from "../../components";

const activeBtnStyles =
  "bg-themeColor mr-4 mt-2 text-secondTheme font-semibold p-2 rounded-full w-auto outline-noned shadow-lg hover:drop-shadow-lg transition duration-500 ease transform hover:-translate-y-1 inline-block";
const notActiveBtnStyles =
  "bg-primary mr-4 mt-2 text-textColor font-semibold p-2 rounded-full w-auto outline-none shadow-lg hover:drop-shadow-lg transition duration-500 ease transform hover:-translate-y-1 inline-block";

const UserProfilePage = () => {
  const router = useRouter();
  const { pathname } = router;
  const { user } = useSelector((state) => state.userReducer);
  const { userId } = router.query;
  const [userProfile, setUserProfile] = useState();
  const [editing, setEditing] = useState(false);
  const [activeBtn, setActiveBtn] = useState("Owned");

  const fetchUserDetails = () => {
    axios
      .get(`/api/users/${userId}`)
      .then((res) => {
        setUserProfile(res.data.user);

        router.push(
          {
            pathname: pathname,
            query: {
              userId,
              owner: res.data.user.address,
            },
          },
          undefined,
          { shallow: true }
        );
      })
      .catch((e) => {
        toast.error("Something went wrong!");
      });
  };

  useEffect(() => {
    userId && fetchUserDetails();
  }, [userId, user]);

  if (!userProfile) return <Spinner message="Loading profile" />;

  const { _id, userName, about, address, image, createdAt } = userProfile;

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
              {!editing && (
                <img
                  className=" w-full h-370 2xl:h-300 shadow-lg object-cover rounded-lg"
                  src="https://source.unsplash.com/1600x900/?nature,photography,technology"
                  alt="userProfile-pic"
                />
              )}
              {editing && (
                <ProfileEdit userId={userId} setEditing={setEditing} />
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
            {!editing && (
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
            {user?._id === _id && (
              <div className="absolute top-0 z-1 right-0 p-2">
                <button
                  type="button"
                  className="transition transition duration-500 ease transform hover:-translate-y-1 drop-shadow-lg bg-secondTheme p-2 rounded-full cursor-pointer outline-none shadow-md"
                  onClick={() => {
                    setEditing((editing) => !editing);
                  }}
                >
                  <AiOutlineEdit color="themeColor" fontSize={21} />
                </button>
              </div>
            )}
          </div>

          <div className="text-center mb-7">
            {[
              {
                name: "Owned",
                query: {
                  owner: address,
                },
              },
              {
                name: "On Sale",
                query: {
                  seller: address,
                  auctionEnded: true,
                },
              },
              {
                name: "On Auction",
                query: {
                  seller: address,
                  auctionEnded: false,
                },
              },
              {
                name: "Bids",
                query: {
                  bids: _id,
                },
              },
              {
                name: "Saved",
                query: {
                  saved: userId,
                },
              },
            ].map((item, index) => {
              return (
                <button
                  key={index}
                  type="button"
                  onClick={(e) => {
                    setActiveBtn(item.name);

                    router.push(
                      {
                        pathname: pathname,
                        query: {
                          userId,
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
                  {item?.name}
                </button>
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
