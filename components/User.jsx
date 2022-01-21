import React, { useState } from "react";
import Link from "next/link";

import { useRouter } from "next/router";
import { useSelector } from "react-redux";
import { useDispatch } from "react-redux";
import { etherAddress, getMaxBid, getUserName } from "../utils/data";
import {
  followErrorMessage,
  loginMessage,
  saveErrorMessage,
  saveSuccessMessage,
  unFollowErrorMessage,
  unsaveSuccessMessage,
} from "../utils/messages";
import axios from "axios";
import { REFRESH_SET } from "../redux/constants/UserTypes";
import Image from "next/image";
import { FaHeart } from "react-icons/fa";
import { AiFillHeart, AiOutlineHeart } from "react-icons/ai";
import { toast } from "react-toastify";

const buttonStyle = "transition transition duration-500 ease transform hover:-translate-y-1 bg-themeColor opacity-100 text-secondTheme font-semibold text-sm px-2 py-1 rounded-3xl shadow-lg hover:drop-shadow-lg outline-none"

const activeBtnStyles =
  "bg-themeColor mr-4 mt-0 text-secondTheme font-semibold text-sm p-1 px-2 rounded-full w-auto outline-noned shadow-lg hover:drop-shadow-lg transition duration-500 ease transform hover:-translate-y-1 inline-block";
const notActiveBtnStyles =
  "bg-primary mr-4 mt-0 text-textColor font-semibold text-sm p-1 px-2 rounded-full w-auto outline-none shadow-lg hover:drop-shadow-lg transition duration-500 ease transform hover:-translate-y-1 inline-block";

const User = ({ userProfile, setFollowingsLength }) => {
  const [following, setFollowing] = useState(false);
  const dispatch = useDispatch();

  const {
    _id,
    address,
    image,
    about,
    userName,
    followers,
    followings,
    createdAt,
  } = userProfile;

  const router = useRouter();

  const { user, refresh } = useSelector((state) => state.userReducer);

  const [alreadyFollowed, setAlreadyFollowed] = useState(
    followers?.find((item) => item === user?._id)
  );

  const followUser = () => {
    if (!user?._id) {
      toast.info(loginMessage);
      return;
    }
    setFollowing(true);
    axios
      .put(`/api/users/follow/${_id}`, {
        user: user?._id,
      })
      .then((res) => {
        setFollowing(false);
        // toast.success(alreadyFollowed ? unFollowSuccessMessage : followSuccessMessage);
        setFollowingsLength((prev) => (alreadyFollowed ? prev - 1 : prev + 1));
        setAlreadyFollowed((prev) => !prev);
      })
      .catch((e) => {
        console.log(e);
        setFollowing(false);
        toast.error(
          alreadyFollowed ? followErrorMessage : unFollowErrorMessage
        );
      });
  };

  return (
    <div className="transition transition duration-500 ease transform hover:-translate-y-1 m-2">
      <div
        onClick={() => router.push(`/user-profile/${_id}`)}
        className=" relative cursor-pointer w-25 shadow-lg hover:drop-shadow-lg rounded-lg overflow-hidden transition-all duration-500 ease-in-out"
      >
        {image && (
          <Image
            placeholder="blur"
            blurDataURL="/favicon.png"
            height={100}
            width={100}
            layout="responsive"
            className="rounded-lg w-full"
            src={image}
            alt="user-post"
          />
        )}
        <div
          className="absolute top-0 w-full h-full flex flex-col justify-between p-1 pr-2 pt-2 pb-2 z-50"
          style={{ height: "100%" }}
        >
          <div className="flex items-center justify-between">
            <button
              type="button"
              className={buttonStyle}
            >
              {`${followers?.length} Followers`}{" "}
            </button>
          </div>
          <div className=" flex justify-between items-center gap-2 w-full">
            <button
              type="button"
              className={buttonStyle}
            >
              {`${followings.length} Followings`}{" "}
            </button>
          </div>
        </div>
      </div>
      <Link href={`/user-profile/${_id}`}>
        <div className="transition transition duration-500 ease transform hover:-translate-y-1 inline-block flex gap-2 mt-2 items-center justify-between">
          <div className="flex gap-2 items-center">
            <Image
              height={35}
              width={35}
              className="w-8 h-8 rounded-full object-cover hover:cursor-pointer"
              src={image}
              alt="user-profile"
            />
            <p className="font-semibold hover:font-extrabold hover:cursor-pointer">
              {getUserName(userName)}
            </p>
          </div>
          {
              user?._id && _id !== user?._id && (
                <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  followUser();
                }}
                className={`${activeBtnStyles}`}
              >
                {alreadyFollowed ? `Unfollow` : `Follow`}
              </button>
              )
          }
        </div>
      </Link>
    </div>
  );
};

export default User;
