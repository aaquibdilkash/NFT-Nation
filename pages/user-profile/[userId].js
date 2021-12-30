import React, { useEffect, useState } from "react";
import { AiOutlineLogout } from "react-icons/ai";
// import { GoogleLogout } from 'react-google-login';

import {
  getUserName
} from "../../utils/data";
import MasonryLayout from "../../components/MasonryLayout";
import Spinner from "../../components/Spinner";
import { useRouter } from "next/router";
import { USER_GET_SUCCESS } from "../../redux/constants/UserTypes";
import { useDispatch } from "react-redux";
import { profileGet, userGet, userOwnGet, userSaleGet, userSaveGet } from "../../redux/actions/userActions";
import ProfileEdit from "../../components/ProfileEdit";

const activeBtnStyles =
  "bg-red mr-4 text-white font-semibold text-sm p-2 rounded-full w-20 outline-none";
const notActiveBtnStyles =
  "bg-primary mr-4 text-black font-semibold text-sm p-2 rounded-full w-20 outline-none";

const UserProfile = () => {
  const router = useRouter()
  const dispatch = useDispatch()
  const {userId} = router.query
  const [user, setUser] = useState();
  const [pins, setPins] = useState();
  const [text, setText] = useState("Owned");
  const [activeBtn, setActiveBtn] = useState("Owned");

  useEffect(() => {
    userId && dispatch(profileGet(userId, (data) => {
      setUser(data)
    }, (e) => {
    }))
  }, [userId]);

  useEffect(() => {
    if (text === "Owned") {
      dispatch(userOwnGet(user?.address, (data) => {
        setPins(data)
      }, (e) => {

      }))
    } else if (text === "On Sale") {
      dispatch(userSaleGet(user?.address, (data) => {
        setPins(data)
      }, (e) => {
        
      }))
    } else {
      dispatch(userSaveGet(user?._id, (data) => {
        setPins(data)
      }, (e) => {
        
      }))
    }
  }, [text, userId]);

  const logout = () => {
    localStorage.clear();
    dispatch({
      type: USER_GET_SUCCESS,
      payload: {}
    })

    router.push("/");
  };

  if (!user) return <Spinner message="Loading profile" />;

  return (
    <div className="relative pb-2 h-full justify-center items-center">
      <div className="flex flex-col pb-5">
        <div className="relative flex flex-col mb-7">
          <div className="flex flex-col justify-center items-center">
            {/* <img
              className=" w-full h-370 2xl:h-510 shadow-lg object-cover"
              src="https://source.unsplash.com/1600x900/?nature,photography,technology"
              alt="user-pic"
            /> */}
            <ProfileEdit userId={userId}/>
            <img
              className="rounded-full w-23 h-23 -mt-20 shadow-xl object-cover"
              src={user.image}
              alt="user-pic"
            />
          </div>
          <h1 className="font-bold text-3xl text-center mt-3">
          {getUserName(user?.userName)}
          </h1>
          <div className="absolute top-0 z-1 right-0 p-2">
            <button
              type="button"
              className=" bg-white p-2 rounded-full cursor-pointer outline-none shadow-md"
              onClick={logout}
            >
              <AiOutlineLogout color="red" fontSize={21} />
            </button>
          </div>
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
          <div className="flex justify-center font-bold items-center w-full text-1xl mt-2">
            No Pins Found!
          </div>
        )}
      </div>
    </div>
  );
};

export default UserProfile;
