import React, { useState, useRef, useEffect } from "react";
import { HiMenu } from "react-icons/hi";
import Link from "next/link";
import { Navbar, Sidebar } from "../components";
import { useDispatch, useSelector } from "react-redux";
import { userGet } from "../redux/actions/userActions";
import Web3 from "web3"
import { USER_GET_SUCCESS } from "../redux/constants/UserTypes";
import { chainData, toHex } from "../utils/data";
import axios from "axios"
// import PinsLayout from "./PinsLayout";

const HomeLayout = ({ children, ...pageProps }) => {
  const [toggleSidebar, setToggleSidebar] = useState(false);
  const { searchTerm, setSearchTerm } = pageProps;
  const scrollRef = useRef(null);
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.userReducer);
  const ISSERVER = typeof window === "undefined";

  const addToNetwork = async () => {
    const chain = chainData.test
    if (window.ethereum && window.ethereum.isMetaMask) {
      window.web3 = new Web3(ethereum);
      console.log("MetaMask Here!");
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

      window.web3.eth.getAccounts((error, accounts) => {
        window.ethereum
          .request({
            method: "wallet_addEthereumChain",
            params: [params, accounts[0]],
          })
          .then((result) => {
            const obj = {
              address: accounts[0],
              userName: accounts[0],
              image:
                "https://aaquibdilkashdev.web.app/images/AaquibDilkash.jpeg",
            }
            axios
              .post("/api/users", obj)
              .then((res) => {
                console.log(res, "dfjdkfjdkfjkdjfdf")
                localStorage.setItem("user", JSON.stringify(res.data.user));
                dispatch({
                  type: USER_GET_SUCCESS,
                  payload: res.data.user,
                });
              }).catch((e) => {
                console.log(e)
              })
          })
          .catch((error) => {
            console.log(error);
          });
      });
    } else {
      alert("Please install MetaMask browser extension to interact");
    }
  };

  // useEffect(() => {
  //   addToNetwork()
  // }, [])

  // !ISSERVER && window.ethereum.on("accountsChanged", (account) => {
  //   console.log(account);
  //   // router.push("/login");
  //   addToNetwork()
  //   console.log("account changed");
  // });

  // !ISSERVER && window.ethereum.on("chainChanged", (chain) => {
  //   console.log(chain);
  //   // router.push("/login");
  //   addToNetwork()
  //   console.log("account changed");
  // });

  // let userInfo;

  // useEffect(() => {
    
  //   if (!ISSERVER) {
  //     userInfo = localStorage.getItem("user") !== "undefined"
  //         ? JSON.parse(localStorage.getItem("user"))
  //         : localStorage.clear();
  //   }

  //   !ISSERVER && userInfo?._id && dispatch(userGet(userInfo?._id, (res) => {

  //   }, (e) => {

  //   }));
  // }, [userInfo]);

  useEffect(() => {
    scrollRef.current.scrollTo(0, 0);
  }, []);

  return (
    <div className="flex bg-gradient-to-r from-[#ffffff] to-[#009387] md:flex-row flex-col h-screen transition-height duration-75 ease-out">
      <div className="hidden md:flex h-screen flex-initial">
        <Sidebar user={user && user} addToNetwork={addToNetwork}/>
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
          {
            user?._id && <Link href={`user-profile/${user?._id}`}>
            <img
              src={user?.image}
              alt="user-pic"
              className="w-9 h-9 rounded-full shadow-lg hover:drop-shadow-lg cursor-pointer"
            />
          </Link>
          }
        </div>
        {toggleSidebar && (
          <div className="fixed w-3/5 bg-white h-screen overflow-y-auto shadow-md z-10 animate-slide-in">
            <Sidebar closeToggle={setToggleSidebar} user={user && user} addToNetwork={addToNetwork}/>
          </div>
        )}
      </div>
      <div className="pb-2 flex-1 h-screen overflow-y-scroll" ref={scrollRef}>
        <div className="px-2 md:px-5">
          <div className="bg-gray-50">
            <Navbar searchTerm={searchTerm} setSearchTerm={setSearchTerm} addToNetwork={addToNetwork}/>
          </div>
          <div className="h-full">{children}</div>
        </div>
      </div>
    </div>
  );
};

export default HomeLayout;
