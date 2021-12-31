import React, { useState, useRef, useEffect } from "react";
import { HiMenu } from "react-icons/hi";
import Link from "next/link";
import { Navbar, Sidebar } from "../components";
import { useDispatch, useSelector } from "react-redux";
import { USER_GET_SUCCESS } from "../redux/constants/UserTypes";
import { chainData, toHex } from "../utils/data";
import axios from "axios";
import Web3 from "web3";
import Web3Modal from "web3modal";

const HomeLayout = ({ children, ...pageProps }) => {
  const [toggleSidebar, setToggleSidebar] = useState(false);
  const { searchTerm, setSearchTerm } = pageProps;
  const scrollRef = useRef(null);
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.userReducer);

  const connectToMetamask = async () => {

    const providerOptions = {
      /* See Provider Options Section */
    };
  
    const web3Modal = new Web3Modal({
      network: "mainnet", // optional
      cacheProvider: true, // optional
      providerOptions, // required
    });

    const provider = await web3Modal.connect();

    if(!provider) {
      alert("Web3 is not enabled in this browser, Checkout Metamask!")
    }

    const web3 = new Web3(provider);

    const chainId = await web3.eth.getChainId()

    const accounts = await web3.eth.getAccounts();
    
    if(chainId != 80001) {
      alert("Wrong network! Switch to Polygon (Matic)");

      const chain = chainData.test

      const params = {
        chainId: toHex(chain.chainId), // A 0x-prefixed hexadecimal string
        chainName: chain.name,
        nativeCurrency: {
          name: chain.nativeCurrency.name,
          symbol: chain.nativeCurrency.symbol, // 2-6 characters long
          decimals: chain.nativeCurrency.decimals,
        },
        rpcUrls: chain.rpc,
        blockExplorerUrls: [
          chain.explorers &&
          chain.explorers.length > 0 &&
          chain.explorers[0].url
            ? chain.explorers[0].url
            : chain.infoURL,
        ],
      };

      window.ethereum
          .request({
            method: "wallet_addEthereumChain",
            params: [params, accounts[0]],
          }).then(() => {
            login(accounts[0])
          }).catch((e) => {
            console.log(e)
          })

      return;
    }

    login(accounts[0])


    // Subscribe to accounts change
    provider.on("accountsChanged", async (accounts) => {
      let address = await web3.eth.getAccounts();
      // console.log(address, "on accountChaged");
      login(address)
    });

    // Subscribe to chainId change
    provider.on("chainChanged", (chainId) => {
      // console.log(chainId, "chain Changed");
    });

    // Subscribe to provider connection
    provider.on("connect", (info) => {
      // console.log(info, "on Connect");
    });

    // Subscribe to provider disconnection
    provider.on("disconnect", (error) => {
      // console.log(error, "on disconnect");
    });
  };

  const login = (address) => {
    const obj = {
      address: address,
      userName: address,
      image:
        "https://aaquibdilkashdev.web.app/images/AaquibDilkash.jpeg",
    };
    axios
      .post("/api/users", obj)
      .then((res) => {
        localStorage.setItem("user", JSON.stringify(res.data.user));
        dispatch({
          type: USER_GET_SUCCESS,
          payload: res.data.user,
        });
      })
      .catch((e) => {
        console.log(e);
      });
  }

  useEffect(() => {
    scrollRef.current.scrollTo(0, 0);
    connectToMetamask()
  }, []);

  return (
    <div className="flex bg-gradient-to-r from-[#ffffff] to-[#009387] md:flex-row flex-col h-screen transition-height duration-75 ease-out">
      <div className="hidden md:flex h-screen flex-initial">
        <Sidebar user={user && user} connectToMetamask={connectToMetamask} />
      </div>
      <div className="flex md:hidden flex-row">
        <div className="p-2 w-full flex flex-row justify-between items-center shadow-md">
          <HiMenu
            fontSize={40}
            className="cursor-pointer hover:drop-shadow-lg"
            onClick={() => setToggleSidebar(true)}
          />
          <Link href="/">
            <img src="../assets/logo.png" alt="logo" className="w-28" />
          </Link>
          {user?._id && (
            <Link href={`user-profile/${user?._id}`}>
              <img
                src={user?.image}
                alt="user-pic"
                className="w-9 h-9 rounded-full shadow-lg hover:drop-shadow-lg cursor-pointer"
              />
            </Link>
          )}
        </div>
        {toggleSidebar && (
          <div className="fixed w-3/5 bg-white h-screen overflow-y-auto shadow-md z-10 animate-slide-in">
            <Sidebar
              closeToggle={setToggleSidebar}
              user={user && user}
              connectToMetamask={connectToMetamask}
            />
          </div>
        )}
      </div>
      <div className="pb-2 flex-1 h-screen overflow-y-scroll" ref={scrollRef}>
        <div className="px-2 md:px-5">
          <div className="bg-gray-50">
            <Navbar
              searchTerm={searchTerm}
              setSearchTerm={setSearchTerm}
              connectToMetamask={connectToMetamask}
            />
          </div>
          <div className="h-full">{children}</div>
        </div>
      </div>
    </div>
  );
};

export default HomeLayout;
