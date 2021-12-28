import React, { useState } from "react";
import { nftaddress, nftmarketaddress } from "../config";
// import NFT from "../artifacts/contracts/NFT.sol/NFT.json";
import Market from "../artifacts/contracts/NFTMarket.sol/NFTMarket.json";
import Web3Modal from "web3modal";
import { ethers } from "ethers";
// import { Link, useNavigate } from "react-router-dom";
import Link from "next/link";
import { v4 as uuidv4 } from "uuid";
// import { MdDownloadForOffline } from "react-icons/md";
// import { AiTwotoneDelete } from "react-icons/ai";
// import { BsFillArrowUpRightCircleFill } from "react-icons/bs";

import { client } from "../client";
import { useRouter } from "next/router";
import { useSelector } from "react-redux";
import { feedPinsGet } from "../redux/actions/pinActions";
import { useDispatch } from "react-redux";
import { getUserName } from "../utils/data";

const Pin = ({ pin }) => {
  const [postHovered, setPostHovered] = useState(false);
  const [savingPost, setSavingPost] = useState(false);
  const dispatch = useDispatch()

  // const navigate = useNavigate();
  const router = useRouter();

  const {
    postedBy,
    image,
    _id,
    destination,
    itemId,
    price,
    sellerId,
    ownerId,
  } = pin;

  let {user} = useSelector(state => state.userReducer)
  user = user?._id

  const changePrice = (id, price, ownerId, sellerId) => {
    client
      .patch(id)
      .set({ price, ownerId, sellerId })
      .commit()
      .then(() => {
        // window.location.reload();
        dispatch(feedPinsGet())
        // navigate("/")
      });
  };

  const buyNft = async (itemId) => {
    const web3Modal = new Web3Modal();
    const connection = await web3Modal.connect();
    const provider = new ethers.providers.Web3Provider(connection);

    const signer = provider.getSigner();
    const contract = new ethers.Contract(nftmarketaddress, Market.abi, signer);

    const auctionPrice = ethers.utils.parseUnits(price, 'ether')
    // console.log(price, auctionPrice.toString(), "%%%%%%%%%%%%%%%%%%%%")

    console.log(price, "dkfjdkfjdfjdfjdfk")

    const transaction = await contract.executeMarketSale(nftaddress, itemId, {
      value: auctionPrice,
    });

    await transaction.wait();
    let newPrice = "0";
    let newSellerId = "0x0000000000000000000000000000000000000000";
    let newOwnerId = user;
    client
      .patch(_id)
      .set({
        price: newPrice,
        ownerId: newOwnerId,
        sellerId: newSellerId,
        postedBy: {
          _type: "postedBy",
          _ref: user,
        },
      })
      .commit()
      .then(() => {
        // window.location.reload();
        dispatch(feedPinsGet())
        // navigate("/")
      });
  };

  // const deletePin = (id) => {
  //   client
  //     .delete(id)
  //     .then(() => {
  //       window.location.reload();
  //     });
  // };

  const cancelSale = async (id, itemId) => {
    const web3Modal = new Web3Modal();
    const connection = await web3Modal.connect();
    const provider = new ethers.providers.Web3Provider(connection);

    const signer = provider.getSigner();
    const contract = new ethers.Contract(nftmarketaddress, Market.abi, signer);

    const transaction = await contract.cancelSale(
      nftaddress,
      itemId.toString()
    );

    await transaction.wait();
    changePrice(id, "0", user, "0x0000000000000000000000000000000000000000");
    // router.push('/')
  };

  const createSale = async (id, itemId) => {
    const web3Modal = new Web3Modal();
    const connection = await web3Modal.connect();
    const provider = new ethers.providers.Web3Provider(connection);

    const signer = provider.getSigner();
    const contract = new ethers.Contract(nftmarketaddress, Market.abi, signer);

    const auctionPrice = ethers.utils.parseUnits("115", 'ether')
    const transaction = await contract.createMarketSale(
      nftaddress,
      itemId.toString(),
      auctionPrice
    );

    await transaction.wait();

    let price = "115";
    let ownerId = "0x0000000000000000000000000000000000000000";
    let sellerId = user;
    client
      .patch(id)
      .set({
        price,
        ownerId,
        sellerId,
        postedBy: {
          _type: "postedBy",
          _ref: user,
        },
      })
      .commit()
      .then(() => {
        // window.location.reload();
        dispatch(feedPinsGet())
        // dispatch(feedPinsGet())
        // navigate("/")
      });
    // router.push('/')
  };

  let alreadySaved = pin?.save?.filter((item) => item?.postedBy?._id === user);

  alreadySaved = alreadySaved?.length > 0 ? alreadySaved : [];

  const savePin = (id) => {
    if (alreadySaved?.length === 0) {
      setSavingPost(true);

      client
        .patch(id)
        .setIfMissing({ save: [] })
        .insert("after", "save[-1]", [
          {
            _key: uuidv4(),
            userId: user,
            postedBy: {
              _type: "postedBy",
              _ref: user,
            },
          },
        ])
        .commit()
        .then(() => {
          // window.location.reload();
          dispatch(feedPinsGet())
          setSavingPost(false);
        });
    }
  };

  return (
    <div className="m-2">
      <div
        onMouseEnter={() => setPostHovered(true)}
        onMouseLeave={() => setPostHovered(false)}
        onClick={() => router.push(`/pin-detail/${_id}`)}
        className=" relative cursor-pointer w-auto shadow-lg hover:drop-shadow-lg rounded-lg overflow-hidden transition-all duration-500 ease-in-out"
      >
        <img className="rounded-lg w-full " src={image} alt="user-post" />
        {true && (
          // {postHovered && (
          <div
            className="absolute top-0 w-full h-full flex flex-col justify-between p-1 pr-2 pt-2 pb-2 z-50"
            style={{ height: "100%" }}
          >
            <div className="flex items-center justify-between">
              <div className="flex gap-2">
                {price !== "0" &&
                  ownerId === "0x0000000000000000000000000000000000000000" && sellerId !== user && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        buyNft(itemId);
                      }}
                      type="button"
                      className="bg-red dark:bg-black opacity-70 hover:opacity-100 text-white font-bold px-5 py-1 text-base rounded-3xl shadow-lg hover:drop-shadow-lg outline-none"
                    >
                      Buy
                    </button>
                  )}
                {price === "0" && ownerId === user && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      createSale(_id, itemId);
                    }}
                    type="button"
                    className="bg-red dark:bg-black opacity-70 hover:opacity-100 text-white font-bold px-5 py-1 text-base rounded-3xl shadow-lg hover:drop-shadow-lg outline-none"
                  >
                    Sell
                  </button>
                )}
                {/* <a
                  // href={`${image}`}
                  // download
                  onClick={(e) => {
                    e.stopPropagation();
                    buyNft(itemId)
                  }}
                  className="bg-white w-9 h-9 p-2 rounded-full flex items-center justify-center text-dark text-xl opacity-75 hover:opacity-100 hover:shadow-md outline-none"
                ><MdDownloadForOffline />
                </a> */}
              </div>
              {alreadySaved?.length !== 0 ? (
                <button
                  type="button"
                  className="bg-red dark:bg-black opacity-70 hover:opacity-100 text-white font-bold px-5 py-1 text-base rounded-3xl shadow-lg hover:drop-shadow-lg outline-none"
                >
                  {pin?.save?.length} Saved
                </button>
              ) : (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    savePin(_id);
                  }}
                  type="button"
                  className="bg-red dark:bg-black opacity-70 hover:opacity-100 text-white font-bold px-5 py-1 text-base rounded-3xl shadow-lg hover:drop-shadow-lg outline-none"
                >
                  {pin?.save?.length} {savingPost ? "Saving" : "Save"}
                </button>
              )}
            </div>
            <div className=" flex justify-between items-center gap-2 w-full">
              {/* {destination?.slice(8).length > 0 ? (
                <a
                  href={destination}
                  target="_blank"
                  className="bg-white flex items-center gap-2 text-black font-bold p-2 pl-4 pr-4 rounded-full opacity-70 hover:opacity-100 hover:shadow-md"
                  rel="noreferrer"
                >
                  {' '}
                  <BsFillArrowUpRightCircleFill />
                  {destination?.slice(8, 17)}...
                </a>
              ) : undefined} */}
              {price !== "0" && ownerId === "0x0000000000000000000000000000000000000000" && sellerId === user && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    cancelSale(_id, itemId);
                  }}
                  type="button"
                  className="bg-red dark:bg-black opacity-70 hover:opacity-100 text-white font-bold px-5 py-1 text-base rounded-3xl shadow-lg hover:drop-shadow-lg outline-none"
                >
                  Unsell
                </button>
              )}
              {price !== "0" &&
                ownerId === "0x0000000000000000000000000000000000000000" && sellerId !== user && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      buyNft(itemId);
                    }}
                    type="button"
                    className="bg-red dark:bg-black opacity-70 hover:opacity-100 text-white font-bold px-5 py-1 text-base rounded-3xl shadow-lg hover:drop-shadow-lg outline-none"
                  >
                    {price} MATIC
                  </button>
                )}
            </div>
          </div>
        )}
      </div>
      <Link
        href={`/user-profile/${postedBy?._id}`}
        className="flex gap-2 mt-2 items-center"
      >
        <div className="flex gap-2 mt-2 items-center">
          <img
            className="w-8 h-8 rounded-full object-cover hover:cursor-pointer"
            src={postedBy?.image}
            alt="user-profile"
          />
          <p className="font-semibold dark:text-white hover:font-extrabold hover:cursor-pointer">{getUserName(postedBy?.userName)}</p>
        </div>
      </Link>
    </div>
  );
};

export default Pin;
