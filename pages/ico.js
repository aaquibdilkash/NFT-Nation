import { useState } from "react";
import Market from "../artifacts/contracts/NFTMarket.sol/NFTMarket.json";
import Web3Modal from "web3modal";
import { ethers } from "ethers";
import { Spinner } from "../components";
import { confirmLoadingMessage, getNNTErrorMessage, getNNTLoadingMessage, getNNTSuccessMessage, loginMessage, validAmountErrorMessage } from "../utils/messages";
import { toast } from "react-toastify";
import { useSelector } from "react-redux";
import { isValidAmount } from "../utils/data";
import { nftmarketaddress } from "../config";


const ICO = () => {
    const {user} = useSelector(state => state.userReducer)
    const [amount, setAmount] = useState("")
    const [loading, setLoading] = useState("")
    const [loadingMessage, setLoadingMessage] = useState("")

    const crowdSale = async (url) => {
        if (!user?._id) {
            toast.info(loginMessage);
            return;
          }

          if (!isValidAmount(amount)) {
            toast.info(validAmountErrorMessage);
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
          const auctionPrice = ethers.utils.parseUnits(amount, "ether");
          const contract = new ethers.Contract(nftmarketaddress, Market.abi, signer);
          const transaction = await contract.crowdSale({value: auctionPrice});
          setLoadingMessage(getNNTLoadingMessage)
          const tx = await transaction.wait();
          toast.success(getNNTSuccessMessage);
          const event = tx.events;
          setLoading(false)
          setAmount("")
          console.log(event);

        } catch (e) {
          toast.error(getNNTErrorMessage);
        console.log(e, "DDDDDDDDDd")
          setLoading(false);
          return;
        }

      };
    
  return (
    <div>
      <section className="text-gray-700 body-font flex md:flex-row flex-col items-center bg-white items-center justify-center">
        <div className="lg:flex-grow lg:pl-24 flex flex-col md:items-center mb-16 items-center text-center">
          <h1 className="title-font sm:text-4xl text-3xl mb-4 font-bold text-gray-900">
            NFT Nation Token ICO
          </h1>
          <p className="mb-8 leading-relaxed flex-wrap font-bold">
            Initial Coin Offering for NFT Nation Token
          </p>
          <div className="flex flex-row justify-start w-full max-w-md shadow-xl border-gray-200">
            <input
              className="border-l-4 border-red-700 bg-white focus:outline-none px-4 w-full m-0"
              placeholder="Amount"
              value={amount}
              onChange={(e) => {
                  setAmount(e.target.value)
              }}
              type="text"
            />
            <button onClick={() => {
                crowdSale()
            }} className="inline-flex text-[#ffffff] py-2 px-6 focus:outline-none text-lg m-0 h-12 bg-themeColor rounded-tr-lg rounded-br-lg">
              Buy
            </button>
          </div>
          <p className="text-sm mt-2 text-gray-500 mb-8 w-full font-bold">
            {amount ? `${amount} NNT will cost ${amount} Matic`: ``}
          </p>
          {loading && <Spinner title={loadingMessage} />}
          {/* <div className="flex lg:flex-row md:flex-col">
            <a className="mx-2 text-gray-600 p-3 text-center inline-flex items-center justify-center w-16 h-16 mb-6 shadow-lg rounded-full bg-white">
              <i className="fab fa-linkedin-in"></i>
            </a>
            <a className="mx-2 text-gray-600 p-3 text-center inline-flex items-center justify-center w-16 h-16 mb-6 shadow-lg rounded-full bg-white">
              <i className="fab fa-facebook-f"></i>
            </a>
            <a className="mx-2 text-gray-600 p-3 text-center inline-flex items-center justify-center w-16 h-16 mb-6 shadow-lg rounded-full bg-white">
              <i className="fab fa-twitter"></i>
            </a>
            <a className="mx-2 text-gray-600 p-3 text-center inline-flex items-center justify-center w-16 h-16 mb-6 shadow-lg rounded-full bg-white">
              <i className="fab fa-youtube"></i>
            </a>
          </div> */}
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
  );
};

export default ICO;
