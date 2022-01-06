import { nftaddress, nftmarketaddress } from "../config";
import NFT from "../artifacts/contracts/NFT.sol/NFT.json";
import Market from "../artifacts/contracts/NFTMarket.sol/NFTMarket.json";
import React, { useEffect, useState } from "react";
import Web3Modal from "web3modal";
import { ethers } from "ethers";
import { create as ipfsHttpClient } from "ipfs-http-client";
import { AiOutlineCloudUpload } from "react-icons/ai";
import { MdDelete } from "react-icons/md";
import {
  approvalLoadingMessage,
  confirmLoadingMessage,
  createAuctionLoadingMessage,
  createItemLoadingMessage,
  createSaleLoadingMessage,
  fileUploadErrorMessage,
  finalErrorMessage,
  finalSuccessMessage,
  getEventData,
  getUserName,
  isValidAmount,
  loginMessage,
  marketItemErrorMessage,
  MarketItemSuccessMessage,
  mintLoadingMessage,
  sidebarCategories,
  tokenApproveErrorMessage,
  tokenApproveSuccessMessage,
  tokenAuctionErrorMessage,
  tokenAuctionSuccessMessage,
  tokenMintErrorMessage,
  tokenMintSuccessMessage,
  tokenSaleErrorMessage,
  tokenSaleSuccessMessage,
  validAmountErrorMessage,
} from "../utils/data";
import Spinner from "../components/Spinner";
import { useRouter } from "next/router";
import { useSelector } from "react-redux";
import axios from "axios";
import Head from "next/head";
import Image from "next/image";
import Link from "next/link";
import { toast } from "react-toastify";

const ipfsClient = ipfsHttpClient("https://ipfs.infura.io:5001/api/v0");

const CreatePin = () => {
  const { user } = useSelector((state) => state.userReducer);
  const [title, setTitle] = useState("");
  const [about, setAbout] = useState("");
  const [price, setPrice] = useState("0");
  const [imageLoading, setImageLoading] = useState(false);
  const [destination, setDestination] = useState();
  const [fields, setFields] = useState();
  const [category, setCategory] = useState();
  const [fileUrl, setFileUrl] = useState("");
  const [sellOrAuct, setSellOrAuct] = useState("");
  const [wrongImageType, setWrongImageType] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState(false);
  const [progress, setProgress] = useState(0);

  const router = useRouter();

  const uploadImage = async (e) => {
    const selectedFile = e.target.files[0];
    // uploading asset to sanity
    if (
      selectedFile.type === "image/png" ||
      selectedFile.type === "image/svg" ||
      selectedFile.type === "image/jpeg" ||
      selectedFile.type === "image/gif" ||
      selectedFile.type === "image/tiff"
    ) {
      setWrongImageType(false);
      setImageLoading(true);
      try {
        const added = await ipfsClient.add(selectedFile, {
          progress: (prog) => setProgress(parseInt((prog/selectedFile.size)*100)),
        });
        const url = `https://ipfs.infura.io/ipfs/${added.path}`;
        setFileUrl(url);
        setImageLoading(false);
      } catch (error) {
        toast.error(fileUploadErrorMessage)
        setImageLoading(false);
      }
    } else {
      setImageLoading(false);
      setWrongImageType(true);
    }
  };

  const submitHandler = async () => {
    if (!user?._id) {
      toast.info(loginMessage);
      return;
    }
    if (
      !title ||
      !about ||
      (sellOrAuct === "Mint NFT and Put on Sale" && !price.length) ||
      !fileUrl ||
      !category ||
      !sellOrAuct
    ) {
      setFields(true);

      setTimeout(() => {
        setFields(false);
      }, 2000);

      return;
    }

    if (sellOrAuct === "Mint NFT and Put on Sale" && !isValidAmount(price)) {
      toast.info(validAmountErrorMessage);
      return;
    }
    const data = JSON.stringify({
      name: title,
      description: about,
      image: fileUrl,
      external_url: destination,
    });
    try {
      const added = await ipfsClient.add(data);
      const url = `https://ipfs.infura.io/ipfs/${added.path}`;
      /* after file is uploaded to IPFS, pass the URL to save it on Polygon */
      if (sellOrAuct === "Only Mint NFT") {
        createMarketItem(url);
      } else if (sellOrAuct === "Mint NFT and Put on Sale") {
        createMarketItemForSale(url);
      } else if (sellOrAuct === "Mint NFT and Put on Auction") {
        createMarketItemForAuction(url);
      } else {
        alert("Please Select Your Choice...");
      }
    } catch (error) {
      toast.error(fileUploadErrorMessage)
    }
  };

  const createMarketItemForSale = async (url) => {
    setLoading(true);
    setLoadingMessage(confirmLoadingMessage);
    const web3Modal = new Web3Modal();
    const connection = await web3Modal.connect();
    const provider = new ethers.providers.Web3Provider(connection);
    const signer = provider.getSigner();

    /* next, create the item */
    try {
      var contract = new ethers.Contract(nftaddress, NFT.abi, signer);
      var transaction = await contract.createToken(url);
      setLoadingMessage(mintLoadingMessage);
      var tx = await transaction.wait();
      var event = tx.events[0];
      var tokenId = event.args[2].toNumber();
      toast.success(tokenMintSuccessMessage);
    } catch (e) {
      toast.error(tokenMintErrorMessage);
      setLoading(false);
      return
    }

    // approving NFT to marketplace
    try {
      setLoadingMessage(confirmLoadingMessage);
      transaction = await contract.approve(nftmarketaddress, tokenId);
      setLoadingMessage(approvalLoadingMessage);
      await transaction.wait();
      toast.success(tokenApproveSuccessMessage);
    } catch (e) {
      toast.error(tokenApproveErrorMessage);
      setLoading(false);
      return
    }

    /* then list the item for sale on the marketplace */
    try {
      setLoadingMessage(confirmLoadingMessage);
      const auctionPrice = ethers.utils.parseUnits(price, "ether");
      contract = new ethers.Contract(nftmarketaddress, Market.abi, signer);
      transaction = await contract.createMarketItemForSale(
        nftaddress,
        tokenId,
        auctionPrice
      );
      setLoadingMessage(createSaleLoadingMessage);
      tx = await transaction.wait();
      toast.success(tokenSaleSuccessMessage);
      event = tx.events[2];
      console.log(getEventData(event));
      var eventData = getEventData(event);
    } catch (e) {
      toast.error(tokenSaleErrorMessage);
      setLoading(false);
      return
    }

    savePin({
      ...eventData,
      title,
      about,
      category,
      image: fileUrl,
      postedBy: user?._id,
      destination: "https://nft-nation.vercel.app",
    });
  };

  const createMarketItemForAuction = async (url) => {
    setLoading(true);
    setLoadingMessage(confirmLoadingMessage);
    const web3Modal = new Web3Modal();
    const connection = await web3Modal.connect();
    const provider = new ethers.providers.Web3Provider(connection);
    const signer = provider.getSigner();

    /* next, create the item */
    try {
      var contract = new ethers.Contract(nftaddress, NFT.abi, signer);
      var transaction = await contract.createToken(url);
      setLoadingMessage(mintLoadingMessage);
      var tx = await transaction.wait();
      toast.success(tokenMintSuccessMessage);
      var event = tx.events[0];
      var tokenId = event.args[2].toNumber();
    } catch (e) {
      toast.error(tokenMintErrorMessage);
      setLoading(false);
      return
    }

    // approving NFT to marketplace
    try {
      setLoadingMessage(confirmLoadingMessage);
      transaction = await contract.approve(nftmarketaddress, tokenId);
      setLoadingMessage(approvalLoadingMessage);
      await transaction.wait();
      toast.success(tokenApproveSuccessMessage);
    } catch (e) {
      toast.error(tokenApproveErrorMessage);
      setLoading(false);
      return
    }

    /* then list the item for sale on the marketplace */
    try {
      setLoadingMessage(confirmLoadingMessage);
      contract = new ethers.Contract(nftmarketaddress, Market.abi, signer);
      transaction = await contract.createMarketItemForAuction(
        nftaddress,
        tokenId
      );
      setLoadingMessage(createAuctionLoadingMessage);
      tx = await transaction.wait();
      toast.success(tokenAuctionSuccessMessage);
      event = tx.events[2];
      console.log(getEventData(event));
      var eventData = getEventData(event);
    } catch (e) {
      toast.error(tokenAuctionErrorMessage);
      setLoading(false);
      return
    }

    savePin({
      ...eventData,
      title,
      about,
      category,
      image: fileUrl,
      postedBy: user?._id,
      destination: "https://nft-nation.vercel.app",
    });
  };

  const createMarketItem = async (url) => {
    setLoading(true);
    setLoadingMessage(confirmLoadingMessage);
    const web3Modal = new Web3Modal();
    const connection = await web3Modal.connect();
    const provider = new ethers.providers.Web3Provider(connection);
    const signer = provider.getSigner();

    /* next, create the item */
    try {
      var contract = new ethers.Contract(nftaddress, NFT.abi, signer);
      var transaction = await contract.createToken(url);
      setLoadingMessage(mintLoadingMessage);
      var tx = await transaction.wait();
      toast.success(tokenMintSuccessMessage);
      var event = tx.events[0];
      var tokenId = event.args[2].toNumber();
    } catch (e) {
      toast.error(tokenMintErrorMessage);
      setLoading(false);
      return
    }

    /* then list the item for sale on the marketplace */
    try {
      setLoadingMessage(confirmLoadingMessage);
      contract = new ethers.Contract(nftmarketaddress, Market.abi, signer);
      transaction = await contract.createMarketItem(nftaddress, tokenId);
      setLoadingMessage(createItemLoadingMessage);
      tx = await transaction.wait();
      toast.success(MarketItemSuccessMessage);
      console.log(tx, 'DDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDD')
      event = tx.events[0];
      console.log(getEventData(event));
      var eventData = getEventData(event);
    } catch (e) {
      toast.error(marketItemErrorMessage);
      setLoading(false);
      return
    }

    savePin({
      ...eventData,
      title,
      about,
      category,
      image: fileUrl,
      postedBy: user?._id,
      destination: "https://nft-nation.vercel.app",
    });
  };

  const savePin = (obj) => {
    axios
      .post("/api/pins", obj)
      .then((res) => {
        router.push("/");
        toast.success(finalSuccessMessage);
        setLoading(false);
      })
      .catch((e) => {
        setLoading(false);
        toast.error(finalErrorMessage);
      });
  };

  if (loading) {
    return (
      <Spinner
        title={loadingMessage}
        message={`Please Wait And Do Not Leave This Page...`}
      />
    );
  }

  return (
    <>
      <Head>
        <title>Mint NFTs | NFT Nation</title>
        <meta
          name="description"
          content={`Mint your own ERC721 based NFT Token at NFT Nation which is a Polygon blockchain based Marketplace for trading ERC-21 NFT Tokens with MATIC Tokens`}
        />
        <meta property="og:title" content={`Mint NFTs | NFT Nation`} />
        <meta
          property="og:description"
          content={`Mint your own ERC721 based NFT Token at NFT Nation which is a Polygon blockchain based Marketplace for trading ERC-21 NFT Tokens with MATIC Tokens`}
        />
        <meta
          property="og:url"
          content={`https://nft-nation.vercel.app/create-pin`}
        />
        <meta property="og:type" content="website" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <div className="flex flex-col justify-center items-center mt-5 lg:h-4/5">
        {fields && (
          <p className="text-themeColor mb-5 text-xl transition-all duration-150 ease-in ">
            Please add all fields.
          </p>
        )}
        <div className="rounded-lg flex lg:flex-row flex-col justify-center items-center bg-secondTheme lg:p-5 p-3 lg:w-4/5  w-full">
          <div className="rounded-lg bg-gradient-to-r from-themeColor to-secondTheme bg-secondaryColor p-3 flex flex-0.7 w-full">
            <div className=" flex justify-center items-center flex-col border-2 border-dotted border-gray-300 p-3 w-full h-420">
              {imageLoading && <Spinner title="Uploading..." message={`${progress}%`}/>}
              {wrongImageType && <p>It&apos;s wrong file type.</p>}
              {!fileUrl && !imageLoading && (
                // eslint-disable-next-line jsx-a11y/label-has-associated-control
                <label>
                  <div className="flex flex-col items-center justify-center h-full">
                    <div className="flex flex-col justify-center items-center">
                      <p className="font-bold text-2xl">
                        <AiOutlineCloudUpload />
                      </p>
                      <p className="text-lg">Click to upload</p>
                    </div>

                    <p className="mt-32 text-gray-400">
                      Recommendation: Use high-quality JPG, JPEG, SVG, PNG, GIF
                      or TIFF less than 100MB
                    </p>
                  </div>
                  <input
                    type="file"
                    name="upload-image"
                    onChange={uploadImage}
                    className="w-0 h-0"
                  />
                </label>
              ) } 
              {fileUrl && !imageLoading && (
                <div className="relative h-full">
                  <img
                    src={fileUrl}
                    alt="uploaded-pic"
                    className="h-full w-full"
                  />
                  <button
                    type="button"
                    className="absolute bottom-3 right-3 p-3 rounded-full bg-secondTheme text-xl cursor-pointer outline-none hover:shadow-md transition-all duration-500 ease-in-out"
                    onClick={() => {
                      setFileUrl(null)
                      setProgress(0)
                    }}
                  >
                    <MdDelete />
                  </button>
                </div>
              )}
            </div>
          </div>

          <div className="flex flex-1 flex-col gap-6 lg:pl-5 mt-5 w-full">
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              maxLength={42}
              placeholder="Add Your NFT's Title"
              className="outline-none text-2xl sm:text-3xl font-bold border-b-2 border-gray-200 p-2 rounded-lg focus:drop-shadow-lg"
            />
            {user?._id && (
              <Link href={`/user-profile/${user?._id}`}>
                <div className="flex gap-2 mt-2 mb-2 items-center bg-secondTheme rounded-lg cursor-pointer transition transition duration-500 ease transform hover:-translate-y-1">
                  <Image
                    height={40}
                    width={40}
                    src={user.image}
                    className="w-10 h-10 rounded-full drop-shadow-lg"
                    alt="user-profile"
                  />
                  <p className="font-bold">{getUserName(user?.userName)}</p>
                </div>
              </Link>
            )}
            <textarea
              type="text"
              value={about}
              onChange={(e) => setAbout(e.target.value)}
              maxLength={80}
              placeholder="Tell everyone what your NFT is about"
              className="outline-none text-base sm:text-lg border-b-2 border-gray-200 p-2 rounded-lg focus:drop-shadow-lg"
            />

            <div className="flex flex-col w-full">
              <div>
                <p className="mb-2 font-semibold text:lg sm:text-xl">
                  Choose Pin Category
                </p>
                <select
                  onChange={(e) => {
                    setCategory(e.target.value);
                  }}
                  className="outline-none w-full text-base border-b-2 border-gray-200 p-2 rounded-md cursor-pointer focus:drop-shadow-lg"
                >
                  <option value="others" className="sm:text-bg bg-secondTheme">
                    Select Category
                  </option>
                  {sidebarCategories["Discover Categories"].map((item) => (
                    <option
                      key={`${item.name}`}
                      className="text-base border-0 outline-none capitalize bg-secondTheme text-textColor "
                      value={item.name}
                    >
                      {item.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="mt-2">
                <p className="mb-2 font-semibold text:lg sm:text-xl">
                  What do you wanna do...?
                </p>
                <select
                  onChange={(e) => {
                    setSellOrAuct(e.target.value);
                  }}
                  className="outline-none w-full text-base border-b-2 border-gray-200 p-2 rounded-md cursor-pointer"
                >
                  <option value="others" className="sm:text-bg bg-secondTheme">
                    Select Your Choice
                  </option>
                  {[
                    "Only Mint NFT",
                    "Mint NFT and Put on Sale",
                    "Mint NFT and Put on Auction",
                  ].map((item) => (
                    <option
                      key={`${item}`}
                      className="text-base border-0 outline-none capitalize bg-secondTheme text-textColor "
                      value={item}
                    >
                      {item}
                    </option>
                  ))}
                </select>
              </div>
              {sellOrAuct === "Mint NFT and Put on Sale" && (
                <input
                  type="text"
                  vlaue={price}
                  maxLength={10}
                  onChange={(e) => setPrice(e.target.value)}
                  placeholder="Add a price for sale (in MATIC)"
                  className="mt-2 outline-none text-base sm:text-lg border-b-2 border-gray-200 p-2"
                />
              )}
              <div className="flex justify-end items-end mt-5">
                <button
                  type="button"
                  onClick={submitHandler}
                  className="w-full transition transition duration-500 ease transform hover:-translate-y-1 inline-block drop-shadow-lg bg-themeColor text-secondTheme font-bold p-3 rounded-full w-auto outline-none"
                >
                  Mint Token
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default CreatePin;
