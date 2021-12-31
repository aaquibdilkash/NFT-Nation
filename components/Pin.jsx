import React, { useState } from "react";
import { nftaddress, nftmarketaddress } from "../config";
import NFT from "../artifacts/contracts/NFT.sol/NFT.json";
import Market from "../artifacts/contracts/NFTMarket.sol/NFTMarket.json";
import Web3Modal from "web3modal";
import { ethers } from "ethers";
// import { Link, useNavigate } from "react-router-dom";
import Link from "next/link";
// import { MdDownloadForOffline } from "react-icons/md";
// import { AiTwotoneDelete } from "react-icons/ai";
// import { BsFillArrowUpRightCircleFill } from "react-icons/bs";

import { useRouter } from "next/router";
import { useSelector } from "react-redux";
import { useDispatch } from "react-redux";
import { etherAddress, getUserName } from "../utils/data";
import axios from "axios";
import { REFRESH_SET } from "../redux/constants/UserTypes";
import Image from "next/image";
import blurImage from "../public/favicon.png"

const Pin = ({ pin }) => {
  const [postHovered, setPostHovered] = useState(false);
  const [savingPost, setSavingPost] = useState(false);
  const dispatch = useDispatch()

  const router = useRouter();

  const {
    postedBy,
    image,
    _id,
    destination,
    itemId,
    tokenId,
    price,
    seller,
    owner,
  } = pin;

  let {user, refresh} = useSelector(state => state.userReducer)

  const updatePin = (body) => {
    axios.put(`/api/pins/${pin?._id}`, body).then((res) => {
      router.push("/")
      dispatch({
        type: REFRESH_SET,
        payload: !refresh
      })
    }).catch((e) => {

    })
    
  };

  const buyNft = async (itemId) => {
    const web3Modal = new Web3Modal();
    const connection = await web3Modal.connect();
    const provider = new ethers.providers.Web3Provider(connection);

    const signer = provider.getSigner();
    const contract = new ethers.Contract(nftmarketaddress, Market.abi, signer);

    const auctionPrice = ethers.utils.parseUnits(price, 'ether')

    const transaction = await contract.executeMarketSale(nftaddress, itemId, {
      value: auctionPrice,
    });

    await transaction.wait();
    let newPrice = "0";
    let newSeller = etherAddress;
    let newOwner = user?.address;

    updatePin({
      price: newPrice,
      owner: newOwner,
      seller: newSeller,
      postedBy: user?._id
    })

  }

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

    let newPrice = "0";
    let newOwner = user?.address;
    let newSeller = etherAddress;

    updatePin({
      price: newPrice,
      owner: newOwner,
      seller: newSeller,
      postedBy: user?._id
    })
  };

  const createSale = async (id, itemId, tokenId) => {
    const web3Modal = new Web3Modal();
    const connection = await web3Modal.connect();
    const provider = new ethers.providers.Web3Provider(connection);

    const signer = provider.getSigner();

    let contract = new ethers.Contract(nftaddress, NFT.abi, signer);

    let transaction = await contract.approve(nftmarketaddress, tokenId)

    await transaction.wait()

    contract = new ethers.Contract(nftmarketaddress, Market.abi, signer);


    const auctionPrice = ethers.utils.parseUnits("0.01", 'ether')
    transaction = await contract.createMarketSale(
      nftaddress,
      itemId.toString(),
      auctionPrice
    );

    await transaction.wait();

    let newPrice = "0.01";
    let newOwner = etherAddress;
    let newSeller = user?.address;

    updatePin({
      price: newPrice,
      owner: newOwner,
      seller: newSeller,
      postedBy: user?._id
    })

  
  };

  let alreadySaved = pin?.saved?.find((item) => item === user?._id);

  const savePin = (id) => {
    setSavingPost(true)
      axios.put(`/api/pins/save/${pin?._id}`, {
        user: user?._id
      }).then((res) => {
        setSavingPost(false)
        dispatch(feedPinsGet())
      }).catch((e) => {
        console.log(e)
        setSavingPost(false)
      })
      
  };

  return (
    <div className="m-2">
      <div
        onMouseEnter={() => setPostHovered(true)}
        onMouseLeave={() => setPostHovered(false)}
        onClick={() => router.push(`/pin-detail/${_id}`)}
        className=" relative cursor-pointer w-25 shadow-lg hover:drop-shadow-lg rounded-lg overflow-hidden transition-all duration-500 ease-in-out"
      >
        {image && <Image placeholder="blur" blurDataURL="/favicon.png" height={100} width={100} layout="responsive" className="rounded-lg w-full" src={image} alt="user-post" />}
        {true && (
          // {postHovered && (
          <div
            className="absolute top-0 w-full h-full flex flex-col justify-between p-1 pr-2 pt-2 pb-2 z-50"
            style={{ height: "100%" }}
          >
            <div className="flex items-center justify-between">
              <div className="flex gap-2">
                {price !== "0" &&
                  owner === "0x0000000000000000000000000000000000000000" && seller !== user?.address && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        buyNft(itemId);
                      }}
                      type="button"
                      className="bg-red  opacity-70 hover:opacity-100 text-white font-bold px-5 py-1 text-base rounded-3xl shadow-lg hover:drop-shadow-lg outline-none"
                    >
                      Buy
                    </button>
                  )}
                {price === "0" && owner === user?.address && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      createSale(_id, itemId, tokenId);
                    }}
                    type="button"
                    className="bg-red  opacity-70 hover:opacity-100 text-white font-bold px-5 py-1 text-base rounded-3xl shadow-lg hover:drop-shadow-lg outline-none"
                  >
                    Sell
                  </button>
                )}
              </div>
              {alreadySaved ? (
                <button
                  type="button"
                  className="bg-red opacity-70 hover:opacity-100 text-white font-bold px-5 py-1 text-base rounded-3xl shadow-lg hover:drop-shadow-lg outline-none"
                  onClick={(e) => {
                    e.stopPropagation();
                    savePin(_id);
                  }}
                >
                  {pin?.saved?.length} Saved
                </button>
              ) : (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    savePin(_id);
                  }}
                  type="button"
                  className="bg-red opacity-70 hover:opacity-100 text-white font-bold px-5 py-1 text-base rounded-3xl shadow-lg hover:drop-shadow-lg outline-none"
                >
                  {pin?.saved?.length ? pin?.saved?.length : ""} {savingPost ? "Saving" : "Save"}
                </button>
              )}
            </div>
            <div className=" flex justify-between items-center gap-2 w-full">
              {price !== "0" && owner === "0x0000000000000000000000000000000000000000" && seller === user?.address && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    cancelSale(_id, itemId);
                  }}
                  type="button"
                  className="bg-red opacity-70 hover:opacity-100 text-white font-bold px-5 py-1 text-base rounded-3xl shadow-lg hover:drop-shadow-lg outline-none"
                >
                  Unsell
                </button>
              )}
              {price !== "0" &&
                owner === "0x0000000000000000000000000000000000000000" && seller !== user?.address && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      buyNft(itemId);
                    }}
                    type="button"
                    className="bg-red opacity-70 hover:opacity-100 text-white font-bold px-5 py-1 text-base rounded-3xl shadow-lg hover:drop-shadow-lg outline-none"
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
          <Image
            height={35}
            width={35}
            className="w-8 h-8 rounded-full object-cover hover:cursor-pointer"
            src={postedBy?.image}
            alt="user-profile"
          />
          <p className="font-semibold hover:font-extrabold hover:cursor-pointer">{getUserName(postedBy?.userName)}</p>
        </div>
      </Link>
    </div>
  );
};

export default Pin
