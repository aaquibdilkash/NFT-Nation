import React, { useEffect, useState } from "react";
import Link from "next/link";

import { useRouter } from "next/router";
import { useSelector } from "react-redux";
import { useDispatch } from "react-redux";
import { etherAddress, getMaxBid, getUserName } from "../utils/data";
import { loginMessage, saveErrorMessage, saveSuccessMessage, unsaveSuccessMessage } from "../utils/messages";
import axios from "axios";
import { REFRESH_SET } from "../redux/constants/UserTypes";
import Image from "next/image";
import { FaHeart } from "react-icons/fa";
import { AiFillHeart, AiOutlineHeart } from "react-icons/ai";
import { toast } from "react-toastify";

const Pin = ({ pin }) => {
  const [savingPost, setSavingPost] = useState(false);
  const dispatch = useDispatch();

  const {
    postedBy,
    image,
    _id,
    category,
    destination,
    itemId,
    tokenId,
    price,
    seller,
    saved,
    owner,
    bids,
    auctionEnded,
  } = pin;

  const priceShowCondition =
    price !== "0.0" &&
    owner === etherAddress &&
    auctionEnded;

  const highestBidShowCondition =
    price === "0.0" &&
    owner === etherAddress &&
    !auctionEnded;

  const router = useRouter();

  const { user, refresh } = useSelector((state) => state.userReducer);

  const [alreadySaved, setAlreadySaved] = useState(saved?.find((item) => item === user?._id));
  const [savedLength, setSavedLenth] = useState(saved?.length);

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
        setSavedLenth((prev) => (
          alreadySaved ? prev - 1 : prev + 1
        ))
        setAlreadySaved((prev) => !prev)
      })
      .catch((e) => {
        console.log(e);
        setSavingPost(false);
        toast.error(saveErrorMessage);
      });
  };


  return (
    <div className="transition transition duration-500 ease transform hover:-translate-y-1 m-2">
      <div
        onClick={() => router.push(`/pin-detail/${_id}?category=${category}`)}
        className=" relative cursor-pointer w-25 shadow-lg hover:drop-shadow-lg rounded-lg overflow-hidden transition-all duration-500 ease-in-out"
      >
        {image && (
          <Image
            placeholder="blur"
            blurDataURL="/favicon.png"
            height={200}
            width={180}
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
            {(priceShowCondition || highestBidShowCondition) && (
              <button
                type="button"
                className="transition transition duration-500 ease transform hover:-translate-y-1 bg-themeColor opacity-100 text-secondTheme font-bold px-5 py-1 text-base rounded-3xl shadow-lg hover:drop-shadow-lg outline-none"
              >
                {priceShowCondition ? `On Sale` : `On Auction`}{" "}
              </button>
            )}
            
          </div>
          <div className=" flex justify-between items-center gap-2 w-full">
            {(priceShowCondition || highestBidShowCondition) && (
              <button
                type="button"
                className="transition transition duration-500 ease transform hover:-translate-y-1 bg-themeColor opacity-100 text-secondTheme font-bold px-5 py-1 text-base rounded-3xl shadow-lg hover:drop-shadow-lg outline-none"
              >
                {priceShowCondition
                  ? `${price} MATIC`
                  : `Highest Bid: ${
                      bids?.length
                        ? `${getMaxBid(bids)?.bid} Matic`
                        : `No Bids Yet`
                    }`}{" "}
              </button>
            )}
          </div>
        </div>
      </div>
      <Link
        href={`/user-profile/${postedBy?._id}`}
      >
        <div className="transition transition duration-500 ease transform hover:-translate-y-1 inline-block flex gap-2 mt-2 items-center justify-between">
          <div className="flex gap-2 items-center">
          <Image
            height={35}
            width={35}
            className="w-8 h-8 rounded-full object-cover hover:cursor-pointer"
            src={postedBy?.image}
            alt="user-profile"
          />
          <p className="font-semibold hover:font-extrabold hover:cursor-pointer">
            {getUserName(postedBy?.userName)}
          </p>
          </div>
          <div className="flex gap-2 items-center">
          <p className="font-semibold hover:font-extrabold hover:cursor-pointer">
            {savedLength}
          </p>
          {
            !alreadySaved && <AiOutlineHeart onClick={(e) => {
              e.stopPropagation();
              savePin();
            }} className="text-[#000000] transition transition duration-500 ease transform hover:-translate-y-1 drop-shadow-lg cursor-pointer" size={25}/>
          }
          {
            alreadySaved && <AiFillHeart onClick={(e) => {
              e.stopPropagation();
              savePin();
            }} className="text-[#a83f39] transition transition duration-500 ease transform hover:-translate-y-1 drop-shadow-lg cursor-pointer" size={25}/>
          }
          </div>
        </div>
      </Link>
    </div>
  );
};

export default Pin;
