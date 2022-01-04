import React, { useEffect, useState } from "react";
import { AiOutlineEdit } from "react-icons/ai";
import { getUserName } from "../../utils/data";
import MasonryLayout from "../../components/MasonryLayout";
import Spinner from "../../components/Spinner";
import { useRouter } from "next/router";
import { useDispatch, useSelector } from "react-redux";
import ProfileEdit from "../../components/ProfileEdit";
import axios from "axios";
import Head from "next/head";
import Image from "next/image";
import { HAS_MORE, MORE_LOADING, PAGE_SET } from "../../redux/constants/UserTypes";

const activeBtnStyles =
  "bg-themeColor mr-4 mt-2 text-secondTheme font-semibold p-2 rounded-full w-auto outline-noned shadow-lg hover:drop-shadow-lg transition duration-500 ease transform hover:-translate-y-1 inline-block";
const notActiveBtnStyles =
  "bg-primary mr-4 mt-2 text-textColor font-semibold p-2 rounded-full w-auto outline-none shadow-lg hover:drop-shadow-lg transition duration-500 ease transform hover:-translate-y-1 inline-block";

const UserProfilePage = () => {
  const router = useRouter();
  const dispatch = useDispatch();
  const { user, page } = useSelector((state) => state.userReducer);
  const { userId } = router.query;
  const [loading, setLoading] = useState(false);
  const [userProfile, setUserProfile] = useState();
  const [editing, setEditing] = useState(false);

  const [pins, setPins] = useState();
  const [text, setText] = useState("Owned");
  const [activeBtn, setActiveBtn] = useState("Owned");

  const fetchUserDetails = () => {
    axios
      .get(`/api/users/${userId}`)
      .then((res) => {
        setUserProfile(res.data.user);
      })
      .catch((e) => {});
  };

  const userPinQuery = (query) => {
    page === 1 && setLoading(true)
    dispatch({
      type: MORE_LOADING,
      payload: page !== 1
    });
    axios
      .get(query)
      .then((res) => {
        const { pins, resultPerPage, filteredPinsCount } = res.data;
          setLoading(false);
          page === 1 ? setPins(pins) : setPins((prev) => [...prev, ...pins]);
          dispatch({
            type: MORE_LOADING,
            payload: false
          });
          dispatch({
            type: HAS_MORE,
            payload: page * resultPerPage < filteredPinsCount,
          });
      })
      .catch((e) => {
        setLoading(false);
        dispatch({
          type: MORE_LOADING,
          payload: false
        });
        console.log(e);
      });
  };

  const fetchUserPins = () => {
    if (text === "Owned") {
      userPinQuery(`/api/pins?page=${page}&owner=${userProfile?.address}`)
    } else if (text === "On Sale") {
      userPinQuery(`/api/pins?page=${page}&seller=${userProfile?.address}&auctionEnded=${true}`)
    } else if (text === "On Auction") {
      userPinQuery(`/api/pins?page=${page}&seller=${userProfile?.address}&auctionEnded=${false}`)
    } else if (text === "Bids") {
      userPinQuery(`/api/pins?page=${page}&bids=${userProfile?._id}&auctionEnded=${false}`)
    } else {
      userPinQuery(`/api/pins?page=${page}&saved=${userId}`)
    }
  };

  useEffect(() => {
    userId && fetchUserDetails();
  }, [userId]);

  useEffect(() => {
    if (userProfile?._id) {
      fetchUserPins()
    }
  }, [userProfile, page]);

  useEffect(() => {
    setPins([])
    dispatch({
      type: PAGE_SET,
      payload: 1
    })
    if (userProfile?._id) {
      fetchUserPins()
    }
  }, [text])

  if (!userProfile) return <Spinner message="Loading profile" />;

  return (
    <>
      <Head>
        <title>{`${userProfile?.userName}'s Profile  | NFT Nation`}</title>
        <meta name="description" content={`${userProfile?.about}`} />
        <meta
          property="og:title"
          content={`${userProfile?.userName}'s Profile  | NFT Nation`}
        />
        <meta property="og:description" content={`${userProfile?.about}`} />
        <meta
          property="og:url"
          content={`https://nft-nation.vercel.app/user-profile/${userProfile?._id}`}
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
                src={userProfile.image}
                alt="userProfile-pic"
              />
            </div>
            <h1 className="font-bold text-3xl text-center mt-3">
              {getUserName(userProfile?.userName)}
            </h1>
            {user?._id === userProfile?._id && (
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
            {["Owned", "On Sale", "On Auction", "Bids", "Saved"].map((item) => {
              return (
                <button
                  type="button"
                  onClick={(e) => {
                    setText(item);
                    setActiveBtn(item);
                  }}
                  className={`${
                    activeBtn === item ? activeBtnStyles : notActiveBtnStyles
                  }`}
                >
                  {item}
                </button>
              );
            })}
          </div>

          <div className="px-2">
            {pins?.length > 0 && <MasonryLayout pins={pins} />}
            {loading && <Spinner message={`Loading ${text} Pins`} />}
          </div>

          {pins?.length === 0 && !loading && (
            <div className="flex justify-center font-bold items-center w-full text-1xl font-bold mt-2">
              No Pins Found!
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default UserProfilePage;
