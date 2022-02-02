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
  getImage,
  getIpfsImage,
  isValidAmount,
  parseAmount,
  pinFileToIPFS,
  removePinFromIPFS,
} from "../utils/data";
import { sidebarCategories } from "../utils/sidebarCategories";
import {
  approvalLoadingMessage,
  confirmLoadingMessage,
  createAuctionLoadingMessage,
  createItemLoadingMessage,
  createSaleLoadingMessage,
  duplicateFileInfoMessage,
  errorMessage,
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
  const [price, setPrice] = useState("");
  const [nftContract, setNftContract] = useState("");
  const [tokenId, setTokenId] = useState("");
  const [imageLoading, setImageLoading] = useState(false);
  const [destination, setDestination] = useState();
  const [category, setCategory] = useState();
  const [fields, setFields] = useState();
  const [fileUrl, setFileUrl] = useState("");
  const [sellOrAuct, setSellOrAuct] = useState("");
  const [wrongImageType, setWrongImageType] = useState(false);
  const [loading, setLoading] = useState(false);
  const [importing, setImporting] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState(
    "Storing NFT Metadata..."
  );
  const [progress, setProgress] = useState(0);

  const router = useRouter();

  useEffect(() => {
    if (typeof window !== "undefined") {
      const unPinHash = localStorage.getItem("unPinNFTHash");
      if (unPinHash) {
        removePinFromIPFS(
          unPinHash,
          () => {
            localStorage.removeItem("unPinNFTHash");
          },
          (e) => {
            console.log(e);
          }
        );
      }
    }
  }, []);

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
          (hash, isDuplicate) => {
            if (isDuplicate) {
              toast.info(duplicateFileInfoMessage);
              setImageLoading(false);
              return;
            }
            setFileUrl(hash);
            localStorage.setItem("unPinNFTHash", hash);
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

    setLoading(true);

    const data = {
      name: title,
      description: about,
      image: getIpfsImage(fileUrl),
      external_url: destination,
    };

    const metadata = new Blob([JSON.stringify(data)], {
      type: "application/json",
    });

    try {
      pinFileToIPFS(
        metadata,
        setProgress,
        (hash, isDuplicate) => {
          const url = getIpfsImage(hash);
          console.log(url, "DDDDDDDDDDd");
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
      // const auctionPrice = ethers.utils.parseUnits(price, "ether");
      const auctionPrice = parseAmount(price);
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
      createdBy: user?._id,
      history: [
        {
          user: user?._id,
          price: "0.0",
        },
      ],
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
      createdBy: user?._id,
      history: [
        {
          user: user?._id,
          price: "0.0",
        },
      ],
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
      createdBy: user?._id,
      history: [
        {
          user: user?._id,
          price: "0.0",
        },
      ],
      destination: "https://nft-nation.vercel.app",
    });
  };

  const importNFTHandler = () => {
    if (!user?._id) {
      toast.info(loginMessage);
      return;
    }

    if (!nftContract || !tokenId) {
      setFields(true);

      setTimeout(() => {
        setFields(false);
      }, 2000);

      return;
    }

    if (nftContract?.length !== 42) {
      toast.info("Please Enter A Valid NFT Contract Address!");
      return;
    }

    if (isNaN(tokenId)) {
      toast.info("Please Enter A Token ID!");
      return;
    }

    importNFT(nftContract, tokenId);
  };

  const importNFT = async (nftContract, tokenId) => {
    if (!user?._id) {
      toast.info(loginMessage);
      return;
    }

    setLoading(true);
    setLoadingMessage("Verifying Ownership Of This NFT...");

    try {
      await axios.post(`/api/pins/isPinExist`, {
        nftContract,
        tokenId,
      });
    } catch (e) {
      console.log(e.response);
      setLoading(false);
      toast.error("This NFT already Exist In Marketplace!");
      return;
    }
    const web3Modal = new Web3Modal();
    const connection = await web3Modal.connect();
    const provider = new ethers.providers.Web3Provider(connection);
    // const provider = new ethers.providers.JsonRpcProvider(`https://polygon-mumbai.g.alchemy.com/v2/${process.env.PROJECT_ID}`);
    const signer = provider.getSigner();

    /* next, create the item */
    try {
      var contract = new ethers.Contract(nftContract, NFT.abi, provider);
      // const tokenContract = new ethers.Contract(nftaddress, NFT.abi, provider)
      try {
        const owner = await contract.ownerOf(tokenId);
        console.log(owner, user?.address, owner === user?.address);
        if (owner !== user?.address) {
          toast.error("You Are Not The Owner Of This NFT!");
          setLoading(false);
          return;
        }
        toast.success("Ownership Verified!");
      } catch (e) {
        console.log(e);
        toast.error("This NFT Contract Address Doesn't Exist!");
        setLoading(false);
        return;
      }

      try {
        const tokenUri = await contract.tokenURI(tokenId);
        var { data } = await axios.get(tokenUri);
        console.log(data, "DDDDDDDDDDDDDDDd");

        setLoadingMessage("Fetching NFT Metadata...");
      } catch (e) {
        console.log(e);
        toast.error("Metadata For This NFT Could Not Be Fetched!");
        setLoading(false);
        return;
      }
      // var event = tx.events[0];
      // var tokenId = event.args[2].toNumber();
    } catch (e) {
      console.log(e);
      toast.error("Contract Address For This NFT Could Not Be Found!");
      setLoading(false);
      return;
    }

    /* then list the item for sale on the marketplace */
    try {
      setLoadingMessage(confirmLoadingMessage);
      contract = new ethers.Contract(nftmarketaddress, Market.abi, signer);
      const transaction = await contract.createMarketItem(nftContract, tokenId);
      setLoadingMessage(createItemLoadingMessage);
      const tx = await transaction.wait();
      toast.success(MarketItemSuccessMessage);
      console.log(tx, "DDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDD");
      const event = tx.events[0];
      console.log(getEventData(event));
      var eventData = getEventData(event);
    } catch (e) {
      toast.error(marketItemErrorMessage);
      setLoading(false);
      return;
    }

    const { name, image, description } = data;

    savePin({
      ...eventData,
      title: name,
      about: description,
      category: "Art",
      image,
      postedBy: user?._id,
      createdBy: user?._id,
      history: [
        {
          user: user?._id,
          price: "0.0",
        },
      ],
      destination: "https://nft-nation.vercel.app",
    });
  };

  const savePin = (obj) => {
    axios
      .post("/api/pins", obj)
      .then((res) => {
        localStorage.removeItem("unPinNFTHash");
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
            Please Add All The Fields.
          </p>
        )}
        {!importing && (
          <div className="rounded-lg flex lg:flex-row flex-col justify-center items-center bg-secondTheme lg:p-5 p-3 lg:w-4/5  w-full">
            <div className="rounded-lg bg-secondaryColor p-3 flex flex-0.7 w-full">
              <div className=" flex justify-center items-center flex-col border-2 border-dotted rounded-lg border-gray-300 p-3 w-full h-420">
                {imageLoading && (
                  <Spinner
                    title={progress ? `Uploading...` : ``}
                    message={progress ? `${progress}%` : ``}
                  />
                )}
                {wrongImageType && <p>It&apos;s wrong file type.</p>}
                {!fileUrl && !imageLoading && (
                  <label>
                    <div className="flex flex-col items-center justify-center h-full">
                      <div className="flex flex-col justify-center items-center">
                        <p className="font-bold text-2xl">
                          <AiOutlineCloudUpload
                            size={30}
                            className="font-bold"
                          />
                        </p>
                        <p className="text-lg font-bold">Click to upload</p>
                      </div>

                      <p className="mt-32 text-center font-bold">
                        Use high-quality JPG, JPEG, SVG, PNG, GIF or TIFF less
                        than 100MB
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
                      src={getImage(fileUrl)}
                      alt="uploaded-pic"
                      className="h-full w-full rounded-lg drop-shadow-lg"
                    />
                    <button
                      type="button"
                      className="absolute bottom-3 right-3 p-3 rounded-full bg-secondTheme text-xl cursor-pointer outline-none hover:shadow-md transition-all duration-500 ease-in-out"
                      onClick={() => {
                        setProgress(0);
                        setImageLoading(true);
                        removePinFromIPFS(
                          fileUrl,
                          () => {
                            setFileUrl(null);
                            localStorage.removeItem("unPinNFTHash");
                            setImageLoading(false);
                          },
                          () => {
                            toast.error(errorMessage);
                            setImageLoading(false);
                          }
                        );
                        // setFileUrl(null);
                        // setProgress(0);
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
                className="outline-none text-lg font-bold border-b-2 border-gray-200 p-2 focus:drop-shadow-lg"
              />
              {/* {user?._id && (
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
            )} */}
              <textarea
                type="text"
                value={about}
                onChange={(e) => setAbout(e.target.value)}
                maxLength={80}
                placeholder="Tell everyone what your NFT is about"
                className="outline-none text-sm border-b-2 border-gray-200 p-2 focus:drop-shadow-lg"
              />

              <div className="flex flex-col w-full">
                <div>
                  <p className="mb-2 font-semibold text-sm">
                    Choose Pin Category
                  </p>
                  <select
                    onChange={(e) => {
                      setCategory(e.target.value);
                    }}
                    value={category}
                    className="outline-none w-full text-sm border-b-2 border-gray-200 p-2 cursor-pointer focus:drop-shadow-lg"
                  >
                    <option value="others" className="text-sm bg-secondTheme">
                      Select Category
                    </option>
                    {sidebarCategories["Discover Categories"].map((item) => {
                      if (item?.name !== "All")
                        return (
                          <option
                            key={`${item.name}`}
                            className="text-sm border-0 outline-none capitalize bg-secondTheme text-textColor "
                            value={item.name}
                          >
                            {item.name}
                          </option>
                        );
                    })}
                  </select>
                </div>
                <div className="mt-2">
                  <p className="mb-2 font-semibold text-sm">
                    What do you wanna do...?
                  </p>
                  <select
                    onChange={(e) => {
                      setSellOrAuct(e.target.value);
                    }}
                    value={sellOrAuct}
                    className="outline-none w-full text-sm border-b-2 border-gray-200 p-2 cursor-pointer"
                  >
                    <option
                      value="others"
                      className="sm:text-sm bg-secondTheme"
                    >
                      Select Your Choice
                    </option>
                    {[
                      "Only Mint NFT",
                      "Mint NFT and Put on Sale",
                      "Mint NFT and Put on Auction",
                    ].map((item) => (
                      <option
                        key={`${item}`}
                        className="text-sm border-0 outline-none capitalize bg-secondTheme text-textColor "
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
                    value={price}
                    maxLength={10}
                    onChange={(e) => setPrice(e.target.value)}
                    placeholder="Add a price for sale (in MATIC)"
                    className="outline-none mt-2 text-sm border-b-2 border-gray-200 p-2 focus:drop-shadow-lg"
                  />
                )}
                {/* <p className="mt-2 font-semibold text-sm">
                  Attributes
                </p>
              <div className="flex flex-row justify-between">
              <div className="mt-2">
                <p className="mb-2 font-semibold text-sm">
                  Display Type
                </p>
                <select
                  onChange={(e) => {
                    // setSellOrAuct(e.target.value);
                  }}
                  className="outline-none w-full text-base border-b-2 border-gray-200 p-2 cursor-pointer"
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
              <div className="mt-2">
                <p className="mb-2 font-semibold text-sm">
                  Trait Type
                </p>
                <select
                  onChange={(e) => {
                    // setSellOrAuct(e.target.value);
                  }}
                  className="outline-none w-full text-base border-b-2 border-gray-200 p-2 cursor-pointer"
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
              <div className="mt-2">
                <p className="mb-2 font-semibold text-sm">
                  Value
                </p>
                <select
                  onChange={(e) => {
                    // setSellOrAuct(e.target.value);
                  }}
                  className="outline-none w-full text-base border-b-2 border-gray-200 p-2 cursor-pointer"
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
              </div> */}
                <div className="flex justify-end items-end mt-5 gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setImporting(true);
                      // importNFT("0x93010854BF5935fF0dc6DE5Cb4b4aCa2D44260C1", "4")
                    }}
                    className="w-full transition transition duration-500 ease transform hover:-translate-y-1 inline-block drop-shadow-lg bg-themeColor text-secondTheme font-bold p-2 rounded-lg w-auto outline-none"
                  >
                    Import NFT
                  </button>
                  <button
                    type="button"
                    onClick={submitHandler}
                    className="w-full transition transition duration-500 ease transform hover:-translate-y-1 inline-block drop-shadow-lg bg-themeColor text-secondTheme font-bold p-2 rounded-lg w-auto outline-none"
                  >
                    Mint NFT
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {importing && (
          <div className="mt-4 p-2 bg-gradient-to-r from-themeColor to-secondTheme rounded-lg drop-shadow-lg flex flex-col w-4/5 text-center justify-evenly">
            <div className="flex flex-wrap m-2 gap-3">
              <input
                className=" flex-1 border-gray-100 outline-none border-2 p-2 rounded-lg focus:border-gray-300"
                type="text"
                placeholder="Enter NFT Contract Address..."
                maxLength={42}
                value={nftContract}
                onChange={(e) => setNftContract(e.target.value)}
              />
              <input
                className=" flex-2 border-gray-100 outline-none border-2 p-2 rounded-lg focus:border-gray-300"
                type="text"
                placeholder="Enter Token ID..."
                maxLength={6}
                value={tokenId}
                onChange={(e) => setTokenId(e.target.value)}
              />
            </div>
            <div className="flex flex-wrap m-2 gap-3 justify-center">
              <button
                type="button"
                className="w-full transition transition duration-500 ease transform hover:-translate-y-1 inline-block drop-shadow-lg bg-themeColor text-secondTheme font-bold p-2 rounded-lg w-auto outline-none"
                onClick={() => {
                  setImporting(false);
                }}
              >
                {`Cancel`}
              </button>
              <button
                type="button"
                className="w-full transition transition duration-500 ease transform hover:-translate-y-1 inline-block drop-shadow-lg bg-themeColor text-secondTheme font-bold p-2 rounded-lg w-auto outline-none"
                onClick={() => {
                  importNFTHandler();
                }}
              >
                {`Import NFT`}
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default CreatePin;
