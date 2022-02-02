import React, { useState, useRef, useEffect } from "react";
import { HiMenu } from "react-icons/hi";
import Link from "next/link";
import { Navbar, Sidebar } from "../components";
import { useDispatch, useSelector } from "react-redux";
import {
  MARKET_CONTRACT,
  USER_GET_SUCCESS,
} from "../redux/constants/UserTypes";
import { getImage, toHex } from "../utils/data";
import { chainData } from "../utils/chainData";
import Market from "./../artifacts/contracts/NFTMarket.sol/NFTMarket.json";
import axios from "axios";
import Web3 from "web3";
import Web3Modal from "web3modal";
import Image from "next/image";
import { FaArtstation } from "react-icons/fa";
import { useRouter } from "next/router";
import { nftmarketaddress } from "../config";
import { toast } from "react-toastify";
import Footer from "../components/Footer";

const HomeLayout = ({ children }) => {
  const [toggleSidebar, setToggleSidebar] = useState(false);
  const dispatch = useDispatch();
  const router = useRouter();
  const { pathname, query } = router;
  const { page, keyword, category, owner, seller, bids, saved, auctionEnded, feed, pinId, sort, commented, type } = query;
  const { user, marketContract, refresh, hasMore, changePage } = useSelector(
    (state) => state.userReducer
  );
  let web3Modal;
  let provider;
  let web3;
  let accounts;
  let chainId;
  const chain = chainData.localhost;

  const connectToMetamask = async () => {

    if (!window?.ethereum) {
      // window.ethereum.isMetaMask
      toast.info(
        "Web3 is Not Enabled. Please Install Metamask Extension For Your Browser to Get Started!",
        {
          autoClose: 3000,
        }
      );
      return;
    }

    
    const providerOptions = {
      /* See Provider Options Section */
    };

    web3Modal = new Web3Modal({
      network: "maticmum", // optional
      cacheProvider: true, // optional
      providerOptions, // required
    });

    provider = await web3Modal.connect();

    web3 = new Web3(provider);

    const contract = new web3.eth.Contract(Market.abi, nftmarketaddress);

    dispatch({
      type: MARKET_CONTRACT,
      payload: contract,
    });

    accounts = await web3.eth.getAccounts();

    chainId = await web3.eth.getChainId();

    if (chainId != chain.chainId) {
      toast.info(`Wrong Network Detected! Please Switch to ${chain?.name}`);

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

      try {
        await ethereum.request({
          method: "wallet_switchEthereumChain",
          params: [{ chainId: chain.hexChainId }],
        });
      } catch (switchError) {
        // This error code indicates that the chain has not been added to MetaMask.
        if (switchError.code === 4902) {
          try {
            await ethereum.request({
              method: "wallet_addEthereumChain",
              params: [params, accounts[0]],
            });
          } catch (addError) {
            // handle "add" error
            toast.error(
              `Something went wrong while adding ${chain?.name} network`
            );
          }
        }
        // handle other "switch" errors
        toast.error(
          `Something went wrong while switching network to ${chain?.name}`
        );
      }
    } else {
      login(accounts[0]);
    }

    // Subscribe to accounts change
    provider &&
      provider.on("accountsChanged", async (accounts) => {
        // let address = await web3.eth.getAccounts();
        logout();
        console.log(accounts, "on accountChanged");
        // login(address[0])
      });

    // Subscribe to chainId change
    provider &&
      provider.on("chainChanged", (chainId) => {
        if (chainId !== chain.hexChainId) {
          logout();
        } else {
          login(accounts[0]);
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
    };
    axios
      .post("/api/users", obj)
      .then((res) => {
        toast.success("Logged In Successfuly!");
        dispatch({
          type: USER_GET_SUCCESS,
          payload: res.data.user,
        });
      })
      .catch((e) => {
        toast.error("Something went wrong while logging you in!");
        // console.log(e);
      });
  };

  const logout = () => {
    localStorage.clear();
    dispatch({
      type: USER_GET_SUCCESS,
      payload: {},
    });

    // router.push("/");
  };

  useEffect(() => {
    connectToMetamask();
  }, []);

  // useEffect(() => {
  //   const listener = () => {
  //     setTimeout(() => {
  //       setRefresh(prev => !prev)
  //       dispatch({
  //         type: REFRESH_SET,
  //         payload: !refresh
  //       })
  //     }, 5000)
  //   }

  //   marketContract && marketContract?.events?.UpdatedMarketItem({}, (error, event) => {
  //     listener()
  //   })

  // }, [])

  useEffect(() => {
    setToggleSidebar(false);
    page && pathname == "/" && router.push(
      {
        pathname: pathname,
        query: {
          ...query,
          page: 1,
        },
      },
      undefined,
      { shallow: true }
    );
  }, [category, owner, seller, bids, saved, auctionEnded, feed, pinId, sort, commented, type, keyword]);

  const onScroll = (e) => {
    const { scrollTop, clientHeight, scrollHeight } = e.currentTarget;
    if (scrollHeight - scrollTop === clientHeight && hasMore && changePage) {
    // if (scrollTop + clientHeight > scrollHeight - 100 && hasMore && changePage) {
      router.push(
        {
          pathname: pathname,
          query: {
            ...query,
            page: page ? parseInt(page) + 1 : 2,
          },
        },
        undefined,
        { shallow: true }
      );
    }
  };

  return (
    <div className="flex bg-gradient-to-r from-secondTheme to-themeColor md:flex-row flex-col h-screen transition-height duration-75 ease-out">
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
              <div>
                <Image
                  height={40}
                  width={40}
                  src={getImage(user?.image)}
                  alt="user-pic"
                  className="w-9 h-9 rounded-full shadow-lg hover:drop-shadow-lg cursor-pointer"
                />
              </div>
            </Link>
          )}
        </div>
        {toggleSidebar && (
          <div className="fixed w-4/5 bg-secondTheme h-screen overflow-y-auto shadow-md z-50 animate-slide-in duration-100">
            <Sidebar
              setToggleSidebar={setToggleSidebar}
              user={user && user}
              connectToMetamask={connectToMetamask}
            />
          </div>
        )}
      </div>
      <div
        onScroll={onScroll}
        className="pb-2 flex-1 h-screen overflow-y-scroll"
        // ref={scrollRef}
      >
        <div className="px-2 md:px-5">
          <div className="transparent sticky top-4 z-40">
            <Navbar connectToMetamask={connectToMetamask} />
          </div>
          <div className="h-full">{children}</div>
          {/* <div className="sticky transparent w-auto bottom-0">
            <Footer />
          </div> */}
        </div>
      </div>
    </div>
  );
};

export default HomeLayout;
