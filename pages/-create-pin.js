import { nftaddress, nftmarketaddress } from "../config";
import NFT from "../artifacts/contracts/NFT.sol/NFT.json";
import Market from "../artifacts/contracts/NFTMarket.sol/NFTMarket.json";
import React, { useEffect, useState } from "react";
import Web3Modal from "web3modal";
import { ethers } from "ethers";
// import { create } from "ipfs-http-client";
import { AiOutlineCloudUpload } from "react-icons/ai";
import { MdDelete } from "react-icons/md";
import {
  getEventData,
  getUserName,
  isValidAmount,
  pinFileToIPFS,
} from "../utils/data";
import { sidebarCategories } from "../utils/sidebarCategories";
import {
  approvalLoadingMessage,
  confirmLoadingMessage,
  createAuctionLoadingMessage,
  createItemLoadingMessage,
  createSaleLoadingMessage,
  fileUploadErrorMessage,
  finalErrorMessage,
  finalSuccessMessage,
  loginMessage,
  marketItemErrorMessage,
  MarketItemSuccessMessage,
  mintLoadingMessage,
  tokenApproveErrorMessage,
  tokenApproveSuccessMessage,
  tokenAuctionErrorMessage,
  tokenAuctionSuccessMessage,
  tokenMintErrorMessage,
  tokenMintSuccessMessage,
  tokenSaleErrorMessage,
  tokenSaleSuccessMessage,
  validAmountErrorMessage,
} from "../utils/messages";
import Spinner from "../components/Spinner";
import { useRouter } from "next/router";
import { useSelector } from "react-redux";
import axios from "axios";
import Head from "next/head";
import Image from "next/image";
import Link from "next/link";
import { toast } from "react-toastify";

// const projectId = process.env.INFURA_PROJECT_ID
// const projectSecret = process.env.INFURA_PROJECT_SECRET

// const auth =
// 'Basic ' + Buffer.from(projectId + ':' + projectSecret).toString('base64')
// console.log(projectId, projectSecret, auth)

// const ipfsClient = create({
//   url: 'https://ipfs.infura.io:5001/api/v0',
//   // host: 'ipfs.infura.io',
//   // port: 5001,
//   // path: 'api/v0',
//   // protocol: 'https',
//   headers: {
//     authorization: auth
//   }
// })

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
        // const added = await ipfsClient.add(selectedFile, {
        //   progress: (prog) => setProgress(parseInt((prog/selectedFile.size)*100)),
        // });

        pinFileToIPFS(
          selectedFile,
          setProgress,
          (url) => {
            setFileUrl(url);
            setImageLoading(false);
          },
          (error) => {
            toast.error(fileUploadErrorMessage);
            setImageLoading(false);
          }
        );
      } catch (error) {
        toast.error(fileUploadErrorMessage);
        setImageLoading(false);
      }
    } else {
      setImageLoading(false);
      setWrongImageType(true);
    }
  };

  const submitHandler = async () => {
    console.log(
      "title",
      title,
      "about",
      about,
      "fileUrl",
      fileUrl,
      "category",
      category,
      "sellOrAuct",
      sellOrAuct
    );
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
    const data = {
      name: title,
      description: about,
      image: fileUrl,
      external_url: destination,
    };

    const metadata = new Blob([JSON.stringify(data)], {
      type: "application/json",
      name: "metadata.json",
    });
    try {
      pinFileToIPFS(
        metadata,
        setProgress,
        (url) => {
          /* after file is uploaded to IPFS, pass the URL to save it on Polygon */
          if (sellOrAuct === "Only Mint NFT") {
            createMarketItem(url);
          } else if (sellOrAuct === "Mint NFT and Put on Sale") {
            createMarketItemForSale(url);
          } else if (sellOrAuct === "Mint NFT and Put on Auction") {
            createMarketItemForAuction(url);
          } else {
            toast.info("Please Select Your Choice...");
          }
        },
        (error) => {
          toast.error(fileUploadErrorMessage);
        }
      );
    } catch (error) {
      console.log(error);
      toast.error(fileUploadErrorMessage);
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
      return;
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
      return;
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
      return;
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
      return;
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
      return;
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
      return;
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
    // const provider = new ethers.providers.JsonRpcProvider(`https://polygon-mumbai.g.alchemy.com/v2/${process.env.PROJECT_ID}`);
    const signer = provider.getSigner();

    /* next, create the item */
    try {
      var contract = new ethers.Contract(nftaddress, NFT.abi, signer);
      console.log(url, "DDDDDDDDDDDDDDD");
      var transaction = await contract.createToken(url);
      setLoadingMessage(mintLoadingMessage);
      var tx = await transaction.wait();
      toast.success(tokenMintSuccessMessage);
      var event = tx.events[0];
      var tokenId = event.args[2].toNumber();
    } catch (e) {
      console.log(e);
      toast.error(tokenMintErrorMessage);
      setLoading(false);
      return;
    }

    /* then list the item for sale on the marketplace */
    try {
      setLoadingMessage(confirmLoadingMessage);
      contract = new ethers.Contract(nftmarketaddress, Market.abi, signer);
      transaction = await contract.createMarketItem(nftaddress, tokenId);
      setLoadingMessage(createItemLoadingMessage);
      tx = await transaction.wait();
      toast.success(MarketItemSuccessMessage);
      console.log(tx, "DDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDD");
      event = tx.events[0];
      console.log(getEventData(event));
      var eventData = getEventData(event);
    } catch (e) {
      toast.error(marketItemErrorMessage);
      setLoading(false);
      return;
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

      <section className="relative pt-5 bg-[#ffffff]-50">
        <div className="items-start flex flex-wrap justify-center">
          <div className="w-full md:w-4/12 ml-auto mr-auto px-4">
            <img
              alt="..."
              className="max-w-full rounded-lg shadow-lg"
              src="https://images.unsplash.com/photo-1555212697-194d092e3b8f?ixlib=rb-1.2.1&amp;ixid=eyJhcHBfaWQiOjEyMDd9&amp;auto=format&amp;fit=crop&amp;w=634&amp;q=80"
            />
          </div>
          <div className="w-full md:w-6/12 ml-auto mr-auto px-4">
            <div className="absolute opacity-60 inset-0 z-0"></div>
            <div className="max-w-md w-full space-y-8 p-10 bg-[#ffffff] rounded-xl shadow-lg z-10">
              <div className="grid  gap-8 grid-cols-1">
                <div className="flex flex-col ">
                  {/* <div className="flex flex-col sm:flex-row items-center">
                    <h2 className="font-semibold text-lg mr-auto">Shop Info</h2>
                    <div className="w-full sm:w-auto sm:ml-auto mt-3 sm:mt-0"></div>
                  </div> */}
                  <div className="mt-0">
                    <div className="form">
                      <div className="md:space-y-2 mb-3">
                        <label className="text-xs font-semibold text-gray-600 py-2">
                          Image
                          <abbr className="hidden" title="required">
                            *
                          </abbr>
                        </label>
                        <div className="flex items-center py-0">
                          <div className="w-12 h-12 mr-4 flex-none rounded-xl border overflow-hidden">
                            <img
                              className="w-12 h-12 mr-4 object-cover"
                              src="https://images.unsplash.com/photo-1611867967135-0faab97d1530?ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&amp;ixlib=rb-1.2.1&amp;auto=format&amp;fit=crop&amp;w=1352&amp;q=80"
                              alt="Avatar Upload"
                            />
                          </div>
                          <label className="cursor-pointer ">
                            <span className="focus:outline-none text-[#ffffff] text-sm py-2 px-4 rounded-full bg-themeColor hover:bg-themeColor hover:shadow-lg">
                              Browse
                            </span>
                            <input
                              type="file"
                              name="upload-image"
                              onChange={uploadImage}
                              className="w-0 h-0"
                            />
                          </label>
                        </div>
                      </div>
                      <div className="md:flex flex-row md:space-x-4 w-full text-xs">
                        <div className="mb-3 space-y-2 w-full text-xs">
                          <label className="font-semibold text-gray-600 py-2">
                            Company Name <abbr title="required">*</abbr>
                          </label>
                          <input
                            placeholder="Company Name"
                            className="appearance-none block w-full bg-[#ffffff] text-[#000000] border border-grey-lighter rounded-lg h-10 px-4"
                            // required="required"
                            type="text"
                            // name="integration[shop_name]"
                            // id="integration_shop_name"
                          />
                          <p className="text-red text-xs hidden">
                            Please fill out this field.
                          </p>
                        </div>
                        <div className="mb-3 space-y-2 w-full text-xs">
                          <label className="font-semibold text-gray-600 py-2">
                            Company Mail <abbr title="required">*</abbr>
                          </label>
                          <input
                            placeholder="Email ID"
                            className="appearance-none block w-full bg-[#ffffff] text-[#000000] border border-grey-lighter rounded-lg h-10 px-4"
                            // required="required"
                            type="text"
                            // name="integration[shop_name]"
                            // id="integration_shop_name"
                          />
                          <p className="text-red text-xs hidden">
                            Please fill out this field.
                          </p>
                        </div>
                      </div>
                      <div className="mb-3 space-y-2 w-full text-xs">
                        <label className=" font-semibold text-[#ffffff] py-2">
                          Company Website
                        </label>
                        <div className="flex flex-wrap items-stretch w-full mb-4 relative">
                          <div className="flex">
                            <span className="flex items-center leading-normal bg-grey-lighter border-1 rounded-r-none border border-r-0 border-blue-300 px-3 whitespace-no-wrap text-grey-dark text-sm w-12 h-10 bg-blue-300 justify-center items-center  text-xl rounded-lg text-white">
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="h-6 w-6"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                              >
                                <path
                                  stroke-linecap="round"
                                  stroke-linejoin="round"
                                  stroke-width="2"
                                  d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                                ></path>
                              </svg>
                            </span>
                          </div>
                          <input
                            type="text"
                            className="flex-shrink flex-grow flex-auto leading-normal w-px flex-1 border border-l-0 h-10 border-grey-light rounded-lg rounded-l-none px-3 relative focus:border-blue focus:shadow"
                            placeholder="https://"
                          />
                        </div>
                      </div>
                      <div className="md:flex md:flex-row md:space-x-4 w-full text-xs">
                        <div className="w-full flex flex-col mb-3">
                          <label className="font-semibold text-gray-600 py-2">
                            Company Address
                          </label>
                          <input
                            placeholder="Address"
                            className="appearance-none block w-full bg-grey-lighter text-grey-darker border border-grey-lighter rounded-lg h-10 px-4"
                            type="text"
                            name="integration[street_address]"
                            id="integration_street_address"
                          />
                        </div>
                        <div className="w-full flex flex-col mb-3">
                          <label className="font-semibold text-gray-600 py-2">
                            Location<abbr title="required">*</abbr>
                          </label>
                          <select
                            className="block w-full bg-[#ffffff] text-[#000000] border border-[#000000] rounded-lg h-10 px-4 md:w-full "
                            required="required"
                            name="integration[city_id]"
                            id="integration_city_id"
                          >
                            <option value="">Seleted location</option>
                            <option value="">Cochin,KL</option>
                            <option value="">Mumbai,MH</option>
                            <option value="">Bangalore,KA</option>
                          </select>
                          <p
                            className="text-sm text-red-500 hidden mt-3"
                            id="error"
                          >
                            Please fill out this field.
                          </p>
                        </div>
                      </div>
                      <div className="flex-auto w-full mb-1 text-xs space-y-2">
                        <label className="font-semibold text-gray-600 py-2">
                          Description
                        </label>
                        <textarea
                          required=""
                          name="message"
                          id=""
                          className="w-full min-h-[100px] max-h-[300px] h-28 appearance-none block w-full bg-[#ffffff] text-[#000000] border border-[#000000] rounded-lg  py-4 px-4"
                          placeholder="Enter your comapny info"
                          spellcheck="false"
                        ></textarea>
                        <p className="text-xs text-gray-400 text-left my-3">
                          You inserted 0 characters
                        </p>
                      </div>
                      <p className="text-xs text-red-500 text-right my-3">
                        Required fields are marked with an asterisk{" "}
                        <abbr title="Required field">*</abbr>
                      </p>
                      <div className="mt-5 text-right md:space-x-3 md:block flex flex-col-reverse">
                        <button className="mb-2 md:mb-0 bg-themeColor px-5 py-2 text-sm shadow-sm font-medium tracking-wider border text-[#ffffff] rounded-full hover:shadow-lg hover:bg-themeColor">
                          {" "}
                          Cancel{" "}
                        </button>
                        <button className="mb-2 md:mb-0 bg-themeColor px-5 py-2 text-sm shadow-sm font-medium tracking-wider text-[#ffffff] rounded-full hover:shadow-lg hover:bg-themeColor">
                          Save
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            {/* <div className="md:pr-12">
      <div className="text-pink-600 p-3 text-center inline-flex items-center justify-center w-16 h-16 mb-6 shadow-lg rounded-full bg-pink-300 mt-8">
        <i className="fas fa-rocket text-xl"></i>
      </div>
      <h3 className="text-3xl font-semibold">A growing company</h3>
      <p className="mt-4 text-lg leading-relaxed text-blueGray-500">
        The extension comes with three pre-built pages to help you get
        started faster. You can change the text and images and you're
        good to go.
      </p>
      <ul className="list-none mt-6">
        <li className="py-2">
          <div className="flex items-center">
            <div>
              <span className="text-xs font-semibold inline-block py-1 px-2 uppercase rounded-full text-pink-600 bg-pink-200 mr-3"><i className="fas fa-fingerprint"></i></span>
            </div>
            <div>
              <h4 className="text-blueGray-500">
                Carefully crafted components
              </h4>
            </div>
          </div>
        </li>
        <li className="py-2">
          <div className="flex items-center">
            <div>
              <span className="text-xs font-semibold inline-block py-1 px-2 uppercase rounded-full text-pink-600 bg-pink-200 mr-3"><i className="fab fa-html5"></i></span>
            </div>
            <div>
              <h4 className="text-blueGray-500">Amazing page examples</h4>
            </div>
          </div>
        </li>
        <li className="py-2">
          <div className="flex items-center">
            <div>
              <span className="text-xs font-semibold inline-block py-1 px-2 uppercase rounded-full text-pink-600 bg-pink-200 mr-3"><i className="far fa-paper-plane"></i></span>
            </div>
            <div>
              <h4 className="text-blueGray-500">Dynamic components</h4>
            </div>
          </div>
        </li>
      </ul>
    </div> */}
          </div>
        </div>
        <footer className="relative  pt-8 pb-6 mt-8">
          <div className="container mx-auto px-4">
            <div className="flex flex-wrap items-center md:justify-between justify-center">
              <div className="w-full md:w-6/12 px-4 mx-auto text-center">
                <div className="text-sm text-blueGray-500 font-semibold py-1">
                  Made with{" "}
                  <a
                    href="https://www.creative-tim.com/product/notus-js"
                    className="text-blueGray-500 hover:text-gray-800"
                    target="_blank"
                  >
                    Notus JS
                  </a>{" "}
                  by{" "}
                  <a
                    href="https://www.creative-tim.com"
                    className="text-blueGray-500 hover:text-blueGray-800"
                    target="_blank"
                  >
                    {" "}
                    Creative Tim
                  </a>
                  .
                </div>
              </div>
            </div>
          </div>
        </footer>
      </section>
      {/* <div className="flex flex-col justify-center items-center mt-5 lg:h-4/5">
        {fields && (
          <p className="text-themeColor mb-5 text-xl transition-all duration-150 ease-in ">
            Please add all fields.
          </p>
        )}
        <div className="rounded-lg flex lg:flex-row flex-col justify-center items-center bg-secondTheme lg:p-5 p-3 lg:w-4/5  w-full">
          <div className="rounded-lg bg-gradient-to-r from-themeColor to-secondTheme bg-secondaryColor p-3 flex flex-0.7 w-full">
            <div className=" flex justify-center items-center flex-col border-2 border-dotted border-gray-300 p-3 w-full h-420">
              {imageLoading && (
                <Spinner title="Uploading..." message={`${progress}%`} />
              )}
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
              )}
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
                      setFileUrl(null);
                      setProgress(0);
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
      </div> */}
    </>
  );
};

export default CreatePin;
