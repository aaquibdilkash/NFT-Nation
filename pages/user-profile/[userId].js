import React, { useEffect, useState } from "react";
import { AiOutlineEdit } from "react-icons/ai";
import {
  getUserName
} from "../../utils/data";
import MasonryLayout from "../../components/MasonryLayout";
import Spinner from "../../components/Spinner";
import { useRouter } from "next/router";
import { useDispatch, useSelector } from "react-redux";
import ProfileEdit from "../../components/ProfileEdit";
import axios from "axios";
import Head from "next/head";
import Image from "next/image";

const activeBtnStyles =
  "bg-red mr-4 text-white font-semibold p-2 rounded-full w-auto outline-noned shadow-lg hover:drop-shadow-lg transition duration-500 ease transform hover:-translate-y-1 inline-block";
const notActiveBtnStyles =
  "bg-primary mr-4 text-black font-semibold p-2 rounded-full w-auto outline-none shadow-lg hover:drop-shadow-lg transition duration-500 ease transform hover:-translate-y-1 inline-block";

const UserProfilePage = () => {
  const router = useRouter()
  const dispatch = useDispatch()
  const {user, refresh} = useSelector(state => state.userReducer)
  const {userId} = router.query
  const [userProfile, setUserProfile] = useState();
  const [editing, setEditing] = useState(false)

  const [pins, setPins] = useState();
  const [text, setText] = useState("Owned");
  const [activeBtn, setActiveBtn] = useState("Owned");

  useEffect(() => {
    userId && axios.get(`/api/users/${userId}`).then((res) => {
      setUserProfile(res.data.user)
    }).catch((e) => {

    })
  }, [userId, refresh]);

  useEffect(() => {
    if(userProfile?.address) {
      if (text === "Owned") {
        axios.get(`/api/pins?owner=${userProfile?.address}`).then((res) => {
          setPins(res.data.pins)
        }).catch((e) => {
          console.log(e)
        })
      } else if (text === "On Sale") {
        axios.get(`/api/pins?seller=${userProfile?.address}&auctionEnded=${true}`).then((res) => {
          setPins(res.data.pins)
        }).catch((e) => {
          console.log(e)
        })
      } else if (text === "On Auction") {
        axios.get(`/api/pins?seller=${userProfile?.address}&auctionEnded=${false}`).then((res) => {
          setPins(res.data.pins)
        }).catch((e) => {
          console.log(e)
        })
      } else {
        axios.get(`/api/pins?saved=${userId}`).then((res) => {
          setPins(res.data.pins)
        }).catch((e) => {
          console.log(e)
        })
      }
    }
  }, [text, userId, refresh, userProfile]);


  if (!userProfile) return <Spinner message="Loading profile" />;

  return (
    <>
    <Head>
    <title>{`${userProfile?.userName}'s Profile  | NFT Nation`}</title>
        <meta
          name="description"
          content={`${userProfile?.about}`}
        />
        <meta property="og:title" content={`${userProfile?.userName}'s Profile  | NFT Nation`} />
        <meta
          property="og:description"
          content={`${userProfile?.about}`}
        />
        <meta
          property="og:url"
          content={`https://nft-nation.vercel.app/user-profile/${userProfile?._id}`}
        />
        <meta property="og:type" content="website" />
        <link rel="icon" href="/favicon.png" />
    </Head>
    <div className="relative pb-2 h-full justify-center items-center">
      <div className="flex flex-col pb-5">
        <div className="relative flex flex-col mb-7 ">
          <div className="flex flex-col justify-center items-center">
            {
              !editing && (
                <img
              className=" w-full h-370 2xl:h-510 shadow-lg object-cover rounded-lg"
              src="https://source.unsplash.com/1600x900/?nature,photography,technology"
              alt="userProfile-pic"
            />
              )
            }
            {
              editing && <ProfileEdit userId={userId}/>
            }
            <img
              className="rounded-full w-20 h-20 -mt-10 shadow-xl object-cover"
              src={userProfile.image}
              alt="userProfile-pic"
            />
          </div>
          <h1 className="font-bold text-3xl text-center mt-3">
          {getUserName(userProfile?.userName)}
          </h1>
          {
            user?._id === userProfile?._id && (
              <div className="absolute top-0 z-1 right-0 p-2">
            <button
              type="button"
              className="transition transition duration-500 ease transform hover:-translate-y-1 drop-shadow-lg bg-white p-2 rounded-full cursor-pointer outline-none shadow-md"
              onClick={() => {
                setEditing((editing) => !editing)
              }}
            >
              <AiOutlineEdit color="red" fontSize={21} />
            </button>
          </div>
            )
          }
        </div>
        <div className="text-center mb-7">
          <button
            type="button"
            onClick={(e) => {
              setText(e.target.textContent);
              setActiveBtn("Owned");
            }}
            className={`${
              activeBtn === "Owned" ? activeBtnStyles : notActiveBtnStyles
            }`}
          >
            Owned
          </button>
          <button
            type="button"
            onClick={(e) => {
              setText(e.target.textContent);
              setActiveBtn("On Sale");
            }}
            className={`${
              activeBtn === "On Sale" ? activeBtnStyles : notActiveBtnStyles
            }`}
          >
            On Sale
          </button>
          <button
            type="button"
            onClick={(e) => {
              setText(e.target.textContent);
              setActiveBtn("On Auction");
            }}
            className={`${
              activeBtn === "On Auction" ? activeBtnStyles : notActiveBtnStyles
            }`}
          >
            On Auction
          </button>
          <button
            type="button"
            onClick={(e) => {
              setText(e.target.textContent);
              setActiveBtn("saved");
            }}
            className={`${
              activeBtn === "saved" ? activeBtnStyles : notActiveBtnStyles
            }`}
          >
            Saved
          </button>
        </div>

        <div className="px-2">
          <MasonryLayout pins={pins} />
        </div>

        {pins?.length === 0 && (
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
