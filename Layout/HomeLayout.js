import React, { useState, useRef, useEffect } from "react";
import { HiMenu } from "react-icons/hi";
import Link from "next/link";
import { Navbar, Sidebar } from "../components";
import { useDispatch, useSelector } from "react-redux";
import { HAS_MORE, MORE_LOADING, PAGE_SET, USER_GET_SUCCESS } from "../redux/constants/UserTypes";
import { chainData, toHex } from "../utils/data";
import axios from "axios";
import Web3 from "web3";
import Web3Modal from "web3modal";
import Image from "next/image";
import { FaArtstation } from "react-icons/fa";
import { useRouter } from "next/router";

const HomeLayout = ({ children, ...pageProps }) => {
  const [toggleSidebar, setToggleSidebar] = useState(false);
  const { searchTerm, setSearchTerm } = pageProps;
  const scrollRef = useRef(null);
  const dispatch = useDispatch();
  const router = useRouter()
  const { user, page, hasMore } = useSelector((state) => state.userReducer);

  let web3Modal;
  let provider;
  let web3;
  let accounts;
  let chainId;
  const chain = chainData.test;

  const connectToMetamask = async () => {
    const providerOptions = {
      /* See Provider Options Section */
    };

    web3Modal = new Web3Modal({
      network: "mainnet", // optional
      cacheProvider: true, // optional
      providerOptions, // required
    });

    provider = await web3Modal.connect();

    if (!provider) {
      alert("Web3 is not enabled in this browser, Checkout Metamask!");
    }

    web3 = new Web3(provider);

    accounts = await web3.eth.getAccounts();

    chainId = await web3.eth.getChainId();

    if (chainId != chain.chainId) {
      alert("Wrong network! Switch to Polygon (Matic)");

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
        })
        .then((res) => {

        })
        .catch((e) => {
          alert("Something went wrong while selecting Polygon Matic Network");
        });

    } else {
      login(accounts[0]);
    }

    // Subscribe to accounts change
    provider &&
      provider.on("accountsChanged", async (accounts) => {
        // let address = await web3.eth.getAccounts();
        logout()
        console.log(accounts, "on accountChanged");
        // login(address[0])
      });

    // Subscribe to chainId change
    provider &&
      provider.on("chainChanged", (chainId) => {
        if(chainId !== chain.hexChainId) {
          logout()
        } else {
          login(accounts[0])
        }
        console.log(chainId, "chain Changed");
      });

    // Subscribe to provider connection
    provider &&
      provider.on("connect", (info) => {
        // console.log(info, "on Connect");
      });

    // Subscribe to provider disconnection
    provider &&
      provider.on("disconnect", (error) => {
        // console.log(error, "on disconnect");
      });
  };

  const login = (address) => {
    const obj = {
      address: address,
      userName: address,
      image: `https://ipfs.infura.io/ipfs/QmYS1WpWLduEU1i6stmAaCymDS7XsSCoTd4SFfTyK88J6A`,
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
  };

  const logout = () => {
    localStorage.clear();
    dispatch({
      type: USER_GET_SUCCESS,
      payload: {},
    });

    router.push("/");
  };

  useEffect(() => {
    scrollRef.current.scrollTo(0, 0);
    connectToMetamask()
  }, []);

  useEffect(() => {
      dispatch({
        type: PAGE_SET,
        payload: 1
      })
  
      dispatch({
        type: HAS_MORE,
        payload: true
      })
  
      dispatch({
        type: MORE_LOADING,
        payload: false
      })
    
  }, [router])

  const onScroll = (e) => {
    const {scrollTop, clientHeight, scrollHeight} = e.currentTarget;

    if (scrollHeight - scrollTop === clientHeight && hasMore) {
      console.log(page)
      dispatch({
        type: PAGE_SET,
        payload: page+1
      })
    }
  }

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
            <div className="transition transition duration-500 ease transform hover:-translate-y-1 drop-shadow-lg flex gap-2 items-center cursor-pointer">
              <FaArtstation className="" size={25} />{" "}
              <p className="font-bold text-lg">NFT Nation</p>
            </div>
          </Link>
          {user?._id && (
            <Link href={`/user-profile/${user?._id}`}>
              <Image
                height={40}
                width={40}
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
              setToggleSidebar={setToggleSidebar}
              user={user && user}
              connectToMetamask={connectToMetamask}
            />
          </div>
        )}
      </div>
      <div onScroll={onScroll} className="pb-2 flex-1 h-screen overflow-y-scroll" ref={scrollRef}>
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
