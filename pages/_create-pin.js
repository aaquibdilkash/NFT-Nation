import { nftaddress, nftmarketaddress } from "../config";
import NFT from "../artifacts/contracts/NFT.sol/NFT.json";
import Market from "../artifacts/contracts/NFTMarket.sol/NFTMarket.json";
import React, { useState } from "react";
import Web3Modal from "web3modal";
import { ethers } from "ethers";
import { create as ipfsHttpClient } from "ipfs-http-client";
import { AiOutlineCloudUpload } from "react-icons/ai";
import { MdDelete } from "react-icons/md";
import { getUserName, isValidAmount, loginMessage, sidebarCategories } from "../utils/data";
import Spinner from "../components/Spinner";
import { useRouter } from "next/router";
import { useSelector } from "react-redux";
import axios from "axios";
import Head from "next/head";
import Image from "next/image";

const ipfsClient = ipfsHttpClient("https://ipfs.infura.io:5001/api/v0");

const CreatePin = () => {
  const { user } = useSelector((state) => state.userReducer);
  const [title, setTitle] = useState("");
  const [about, setAbout] = useState("");
  const [price, setPrice] = useState("0");
  const [loading, setLoading] = useState(false);
  const [destination, setDestination] = useState();
  const [fields, setFields] = useState();
  const [category, setCategory] = useState();
  const [fileUrl, setFileUrl] = useState("");
  const [sellOrAuct, setSellOrAuct] = useState("")
  const [wrongImageType, setWrongImageType] = useState(false);

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
      setLoading(true);
      try {
        const added = await ipfsClient.add(selectedFile, {
          progress: (prog) => console.log(`received: ${prog}`),
        });
        const url = `https://ipfs.infura.io/ipfs/${added.path}`;
        setFileUrl(url);
        setLoading(false);
      } catch (error) {
        console.log("Error uploading file: ", error);
      }
    } else {
      setLoading(false);
      setWrongImageType(true);
    }
  };

  const submitHandler = async () => {
    if(!user?._id) {
      alert(loginMessage)
      return
    }
    if (!title || !about || (sellOrAuct === "Mint NFT and Put on Sale" && !price.length) || !fileUrl || !category || !sellOrAuct) {
      setFields(true);

      setTimeout(() => {
        setFields(false);
      }, 2000);

      return;
    }

    if(sellOrAuct === "Mint NFT and Put on Sale" && !isValidAmount(price)) {
      alert("Please enter a valid amount")
      return
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
      if(sellOrAuct === "Only Mint NFT") {
        createMarketItem(url);
      } else if (sellOrAuct === "Mint NFT and Put on Sale") {
        createMarketItemForSale(url);
      } else if (sellOrAuct === "Mint NFT and Put on Auction") {
        createMarketItemForAuction(url);
      } else {
        alert("Please Select Your Choice...")
      }
    } catch (error) {
      console.log("Error in Creating NFT: ", error);
    }
  };

  const createMarketItemForSale = async (url) => {
    const web3Modal = new Web3Modal();
    const connection = await web3Modal.connect();
    const provider = new ethers.providers.Web3Provider(connection);
    const signer = provider.getSigner();

    /* next, create the item */
    let contract = new ethers.Contract(nftaddress, NFT.abi, signer);
    let transaction = await contract.createToken(url);

    let tx = await transaction.wait();
    // console.log(tx.evens, "ddddddddddddddddddddddddddddddd")
    let event = tx.events[0];
    let value = event.args[2];
    let tokenId = value.toNumber();

    // console.log(contract, "^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^")
    // approving NFT to marketplace
    transaction = await contract.approve(nftmarketaddress, tokenId);

    await transaction.wait();
    // console.log(tx, "DDDDDDDDDDDDDDDDDDDDDDDD")

    const auctionPrice = ethers.utils.parseUnits(price, "ether");

    /* then list the item for sale on the marketplace */
    contract = new ethers.Contract(nftmarketaddress, Market.abi, signer);
    transaction = await contract.createMarketItemForSale(
      nftaddress,
      tokenId,
      auctionPrice
    );
    tx = await transaction.wait();

    console.log(tx.events, "kdjddddddddddddddddddddddddddddddddddddd");
    event = tx.events[2];
    const { args } = event;
    let itemId = args[0].toString();
    let nftContract = args[1].toString();
    tokenId = args[2].toString();
    let newSeller = args[3].toString();
    let newOwner = args[4].toString();
    // return
    savePin({
      itemId,
      nftContract,
      tokenId,
      seller: newSeller,
      owner: newOwner,
      price,
      title,
      about,
      postedBy: user?._id,
      destination: "https://nft-nation.vercel.app",
      image: fileUrl,
      category,
      auctionEnded: true
    });
  };

  const createMarketItemForAuction = async (url) => {
    const web3Modal = new Web3Modal();
    const connection = await web3Modal.connect();
    const provider = new ethers.providers.Web3Provider(connection);
    const signer = provider.getSigner();

    /* next, create the item */
    let contract = new ethers.Contract(nftaddress, NFT.abi, signer);
    let transaction = await contract.createToken(url);

    let tx = await transaction.wait();
    // console.log(tx.evens, "ddddddddddddddddddddddddddddddd")
    let event = tx.events[0];
    let value = event.args[2];
    let tokenId = value.toNumber();

    // console.log(contract, "^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^")
    // approving NFT to marketplace
    transaction = await contract.approve(nftmarketaddress, tokenId);

    await transaction.wait();
    // console.log(tx, "DDDDDDDDDDDDDDDDDDDDDDDD")

    /* then list the item for sale on the marketplace */
    contract = new ethers.Contract(nftmarketaddress, Market.abi, signer);
    transaction = await contract.createMarketItemForAuction(
      nftaddress,
      tokenId,
    );
    tx = await transaction.wait();

    console.log(tx.events, "kdjddddddddddddddddddddddddddddddddddddd");
    event = tx.events[2];
    const { args } = event;
    let itemId = args[0].toString();
    let nftContract = args[1].toString();
    tokenId = args[2].toString();
    let newSeller = args[3].toString();
    let newOwner = args[4].toString();
    // return
    savePin({
      itemId,
      nftContract,
      tokenId,
      seller: newSeller,
      owner: newOwner,
      price: "0",
      title,
      about,
      postedBy: user?._id,
      destination: "https://nft-nation.vercel.app",
      image: fileUrl,
      category,
      auctionEnded: false
    });
  };

  const createMarketItem = async (url) => {
    const web3Modal = new Web3Modal();
    const connection = await web3Modal.connect();
    const provider = new ethers.providers.Web3Provider(connection);
    const signer = provider.getSigner();

    /* next, create the item */
    let contract = new ethers.Contract(nftaddress, NFT.abi, signer);
    let transaction = await contract.createToken(url);

    let tx = await transaction.wait();
    // console.log(tx.evens, "ddddddddddddddddddddddddddddddd")
    let event = tx.events[0];
    let value = event.args[2];
    let tokenId = value.toNumber();

    // console.log(contract, "^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^")
    // approving NFT to marketplace
    transaction = await contract.approve(nftmarketaddress, tokenId);

    await transaction.wait();
    // console.log(tx, "DDDDDDDDDDDDDDDDDDDDDDDD")

    /* then list the item for sale on the marketplace */
    contract = new ethers.Contract(nftmarketaddress, Market.abi, signer);
    transaction = await contract.createMarketItemForAuction(
      nftaddress,
      tokenId,
    );
    tx = await transaction.wait();

    console.log(tx.events, "kdjddddddddddddddddddddddddddddddddddddd");
    event = tx.events[2];
    const { args } = event;
    let itemId = args[0].toString();
    let nftContract = args[1].toString();
    tokenId = args[2].toString();
    let newOwner = args[3].toString();
    let newSeller = args[4].toString();
    // return
    savePin({
      itemId,
      nftContract,
      tokenId,
      seller: newSeller,
      owner: newOwner,
      price: "0",
      title,
      about,
      postedBy: user?._id,
      destination: "https://nft-nation.vercel.app",
      image: fileUrl,
      category,
      auctionEnded: true
    });
  };

  const savePin = (obj) => {
    axios
      .post("/api/pins", obj)
      .then((res) => {
        router.push("/");
      })
      .catch((e) => {});
  };

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
          <p className="text-[#EF4444] mb-5 text-xl transition-all duration-150 ease-in ">
            Please add all fields.
          </p>
        )}
        <div className="rounded-lg flex lg:flex-row flex-col justify-center items-center bg-secondTheme lg:p-5 p-3 lg:w-4/5  w-full">
          <div className="rounded-lg bg-gradient-to-r from-[themeColor] to-secondTheme bg-secondaryColor p-3 flex flex-0.7 w-full">
            <div className=" flex justify-center items-center flex-col border-2 border-dotted border-gray-300 p-3 w-full h-420">
              {loading && <Spinner />}
              {wrongImageType && <p>It&apos;s wrong file type.</p>}
              {!fileUrl ? (
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
                      or TIFF less than 20MB
                    </p>
                  </div>
                  <input
                    type="file"
                    name="upload-image"
                    onChange={uploadImage}
                    className="w-0 h-0"
                  />
                </label>
              ) : (
                <div className="relative h-full">
                  <img
                    src={fileUrl}
                    alt="uploaded-pic"
                    className="h-full w-full"
                  />
                  <button
                    type="button"
                    className="absolute bottom-3 right-3 p-3 rounded-full bg-secondTheme text-xl cursor-pointer outline-none hover:shadow-md transition-all duration-500 ease-in-out"
                    onClick={() => setFileUrl(null)}
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
              className="outline-none text-2xl sm:text-3xl font-bold border-b-2 border-gray-200 p-2"
            />
            {user?._id && (
              <div className="flex gap-2 mt-2 mb-2 items-center bg-secondTheme rounded-lg ">
                <Image
                  height={40}
                  width={40}
                  src={user.image}
                  className="w-10 h-10 rounded-full"
                  alt="user-profile"
                />
                <p className="font-bold">{getUserName(user?.userName)}</p>
              </div>
            )}
            <textarea
              type="text"
              multiple
              value={about}
              onChange={(e) => setAbout(e.target.value)}
              maxLength={80}
              placeholder="Tell everyone what your NFT is about"
              className="outline-none text-base sm:text-lg border-b-2 border-gray-200 p-2"
            />

            <div className="flex flex-col">
              <div>
                <p className="mb-2 font-semibold text:lg sm:text-xl">
                  Choose Pin Category
                </p>
                <select
                  onChange={(e) => {
                    setCategory(e.target.value);
                  }}
                  className="outline-none w-4/5 text-base border-b-2 border-gray-200 p-2 rounded-md cursor-pointer"
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
                  className="outline-none w-4/5 text-base border-b-2 border-gray-200 p-2 rounded-md cursor-pointer"
                >
                  <option value="others" className="sm:text-bg bg-secondTheme">
                    Select Your Choice
                  </option>
                  {["Only Mint NFT", "Mint NFT and Put on Sale", "Mint NFT and Put on Auction"].map((item) => (
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
              {
                sellOrAuct === "Mint NFT and Put on Sale" && (
                  <input
              type="text"
              vlaue={price}
              maxLength={10}
              onChange={(e) => setPrice(e.target.value)}
              placeholder="Add a price for sale (in MATIC)"
              className="mt-2 outline-none text-base sm:text-lg border-b-2 border-gray-200 p-2"
            />
                )
              }
              <div className="flex justify-end items-end mt-5">
                <button
                  type="button"
                  onClick={submitHandler}
                  className="w-auto transition transition duration-500 ease transform hover:-translate-y-1 inline-block drop-shadow-lg bg-themeColor text-secondTheme font-bold p-2 rounded-full w-28 outline-none"
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
