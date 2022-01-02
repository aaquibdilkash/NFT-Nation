import React, { useState } from "react";
import Link from "next/link";

import { useRouter } from "next/router";
import { useSelector } from "react-redux";
import { useDispatch } from "react-redux";
import { getMaxBid, getUserName } from "../utils/data";
import axios from "axios";
import { REFRESH_SET } from "../redux/constants/UserTypes";
import Image from "next/image";

const Pin = ({ pin }) => {
  const [postHovered, setPostHovered] = useState(false);
  const [savingPost, setSavingPost] = useState(false);
  const dispatch = useDispatch();

  const {
    postedBy,
    image,
    _id,
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
    price !== "0" &&
    owner === "0x0000000000000000000000000000000000000000" &&
    auctionEnded;

  const highestBidShowCondition =
    price === "0" &&
    owner === "0x0000000000000000000000000000000000000000" &&
    !auctionEnded;

  const router = useRouter();

  let { user, refresh } = useSelector((state) => state.userReducer);

  let alreadySaved = pin?.saved?.find((item) => item === user?._id);

  const savePin = (id) => {
    setSavingPost(true);
    axios
      .put(`/api/pins/save/${pin?._id}`, {
        user: user?._id,
      })
      .then((res) => {
        setSavingPost(false);
        dispatch({
          type: REFRESH_SET,
          payload: !refresh,
        });
      })
      .catch((e) => {
        console.log(e);
        setSavingPost(false);
      });
  };

  return (
    <div className="transition transition duration-500 ease transform hover:-translate-y-1 m-2">
      <div
        onClick={() => router.push(`/pin-detail/${_id}`)}
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
            <div className="flex gap-2"></div>
            <button
              type="button"
              className="transition transition duration-500 ease transform hover:-translate-y-1 bg-red opacity-100 text-white font-bold px-5 py-1 text-base rounded-3xl shadow-lg hover:drop-shadow-lg outline-none"
              onClick={(e) => {
                e.stopPropagation();
                savePin(_id);
              }}
            >
              {alreadySaved
                ? `${saved?.length} Saved`
                : savingPost
                ? `Saving...`
                : `Save`}{" "}
            </button>
          </div>
          <div className=" flex justify-between items-center gap-2 w-full">
            {highestBidShowCondition && (
              <button
                type="button"
                className="transition transition duration-500 ease transform hover:-translate-y-1 bg-red opacity-100 text-white font-bold px-5 py-1 text-base rounded-3xl shadow-lg hover:drop-shadow-lg outline-none"
              >
                {`Highest Bid: ${
                  getMaxBid(bids)?.bid
                    ? `${getMaxBid(bids)?.bid} Matic`
                    : `No Bids Yet`
                }`}
              </button>
            )}
            {priceShowCondition && (
              <button
                type="button"
                className="bg-red opacity-100 text-white font-bold px-5 py-1 text-base rounded-3xl shadow-lg hover:drop-shadow-lg outline-none"
              >
                {price} MATIC
              </button>
            )}
          </div>
        </div>
      </div>
      <Link
        href={`/user-profile/${postedBy?._id}`}
        className="flex gap-2 mt-2 items-center"
      >
        <div className="transition transition duration-500 ease transform hover:-translate-y-1 inline-block flex gap-2 mt-2 items-center">
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
      </Link>
    </div>
  );
};

export default Pin;
