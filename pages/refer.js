import { useState } from "react";
import Market from "../artifacts/contracts/NFTMarket.sol/NFTMarket.json";
import Web3Modal from "web3modal";
import { ethers } from "ethers";
import { Spinner } from "../components";
import {
  confirmLoadingMessage,
  getNNTErrorMessage,
  getNNTLoadingMessage,
  getNNTSuccessMessage,
  loginMessage,
  validAmountErrorMessage,
} from "../utils/messages";
import { toast } from "react-toastify";
import { useSelector } from "react-redux";
import { parseAmount, tabButtonStyles } from "../utils/data";
import { nftmarketaddress } from "../config";
import Head from "next/head";
import ShareButtons from "../components/ShareButtons";

const Refer = () => {
  const { user } = useSelector((state) => state.userReducer);
  const [amount, setAmount] = useState("");
  const [loading, setLoading] = useState("");
  const [loadingMessage, setLoadingMessage] = useState("");

  const earn = async (url) => {
    if (!user?._id) {
      toast.info(loginMessage);
      return;
    }

    setLoading(true);
    setLoadingMessage(confirmLoadingMessage);
    const web3Modal = new Web3Modal();
    const connection = await web3Modal.connect();
    const provider = new ethers.providers.Web3Provider(connection);
    const signer = provider.getSigner();

    /* then list the item for sale on the marketplace */
    try {
      const auctionPrice = parseAmount("10");
      const contract = new ethers.Contract(
        nftmarketaddress,
        Market.abi,
        signer
      );
      const transaction = await contract.earn(auctionPrice);
      setLoadingMessage(getNNTLoadingMessage);
      const tx = await transaction.wait();
      toast.success(getNNTSuccessMessage);
      const event = tx.events;
      setLoading(false);
      setAmount("");
      console.log(event);
    } catch (e) {
      toast.error(getNNTErrorMessage);
      console.log(e, "DDDDDDDDDd");
      setLoading(false);
      return;
    }
  };

  return (
    <>
      <Head>
        <title>{`Refer & Earn | NFT Nation`}</title>
        <meta name="description" content={`Refer & Earn NFT Nation Tokens`} />
        <meta property="og:title" content={`Refer & Earn | NFT Nation`} />
        <meta
          property="og:description"
          content={`Refer & Earn NFT Nation Tokens`}
        />
        <meta
          property="og:image"
          content={`https://nft-nation.vercel.app/favicon.png`}
        />
        <meta
          property="og:url"
          content={`https://nft-nation.vercel.app/refer`}
        />
        <meta name="twitter:card" content="summary" />
        <meta property="og:type" content="website" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <div>
        <section className="text-gray-700 body-font flex md:flex-row flex-col items-center bg-white items-center justify-center">
          <div className="lg:flex-grow lg:pl-24 flex flex-col md:items-center mb-16 items-center text-center">
            <h1 className="title-font sm:text-4xl text-3xl mb-4 font-bold text-gray-900">
              {`Refer & Earn`}
            </h1>
            <p className="mb-8 leading-relaxed flex-wrap font-bold">
              {`Refer & Earn NFT Nation Tokens`}
            </p>
            <p className="mb-2 leading-relaxed flex-wrap font-bold">
              {`After you refer someone to NFT Nation you both earn 10 NFT Nation Tokens when the referred user get verified`}
            </p>
            <p className="mb-8 leading-relaxed flex-wrap font-bold">
              {`A user will only be verified by obtaining the ownership of an NFT in a Sale or in an Auction.`}
            </p>
            <h2 className="mb-2 leading-relaxed flex-wrap font-bold">
              {`Share Your Refferal Link`}
            </h2>
            {/* <div className="flex flex-row justify-start w-full max-w-md shadow-xl border-gray-200">
              <input
                className="border-l-4 border-red-700 bg-white focus:outline-none px-4 w-full m-0"
                placeholder="NNT Amount To Buy"
                value={amount}
                onChange={(e) => {
                  setAmount(e.target.value);
                }}
                type="text"
              />
              <button
                onClick={() => {
                  crowdSale();
                }}
                className="inline-flex text-[#ffffff] py-2 px-6 focus:outline-none text-lg m-0 h-12 bg-themeColor rounded-tr-lg rounded-br-lg"
              >
                Buy
              </button>
            </div>
            <p className="text-sm mt-2 text-gray-500 mb-8 w-full font-bold">
              {amount ? `${amount} NNT will cost ${amount} Matic` : ``}
            </p>
            {loading && <Spinner title={loadingMessage} />} */}
            <ShareButtons
              title={`Refer & Earn`}
              shareUrl={`https://nft-nation.vercel.app/?refer=${user?._id}`}
            />

            <button onClick={() => {
                earn()
            }}>
              <span className={tabButtonStyles}>{`Claim Your Referral Joining NNT`} </span>
            </button>
          </div>
          {/* <div className="md:w-1/2 w-5/6">
          <img
            className="object-cover object-center"
            alt="hero"
            src="https://images.unsplash.com/photo-1518272417499-b6ebd5fab96a?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=800&q=60"
          />
        </div> */}
        </section>
      </div>
    </>
  );
};

export default Refer;
