import React, { useEffect } from "react";
import { FaGoogleWallet } from "react-icons/fa";
import { utils } from "ethers";
import { useRouter } from "next/router";
import { useDispatch } from "react-redux";
import { USER_GET_SUCCESS } from "../redux/constants/UserTypes";
import Web3 from "web3";
import axios from "axios";

const Login = () => {
  const router = useRouter();
  const dispatch = useDispatch();

  const chainData = [
    {
      name: "Polygon Mainnet",
      chain: "Polygon",
      network: "mainnet",
      rpc: [
        "https://polygon-rpc.com/",
        "https://rpc-mainnet.matic.network",
        "https://matic-mainnet.chainstacklabs.com",
        "https://rpc-mainnet.maticvigil.com",
        "https://rpc-mainnet.matic.quiknode.pro",
        "https://matic-mainnet-full-rpc.bwarelabs.com",
      ],
      faucets: [],
      nativeCurrency: {
        name: "MATIC",
        symbol: "MATIC",
        decimals: 18,
      },
      infoURL: "https://polygon.technology/",
      shortName: "MATIC",
      chainId: 137,
      networkId: 137,
      slip44: 966,
      explorers: [
        {
          name: "polygonscan",
          url: "https://polygonscan.com/",
          standard: "EIP3091",
        },
      ],
    },

    {
      name: "Polygon Testnet Mumbai",
      chain: "Polygon",
      network: "testnet",
      rpc: [
        "https://matic-mumbai.chainstacklabs.com",
        "https://rpc-mumbai.maticvigil.com",
        "https://matic-testnet-archive-rpc.bwarelabs.com",
      ],
      faucets: ["https://faucet.polygon.technology/"],
      nativeCurrency: {
        name: "MATIC",
        symbol: "MATIC",
        decimals: 18,
      },
      infoURL: "https://polygon.technology/",
      shortName: "maticmum",
      chainId: 80001,
      networkId: 80001,
      explorers: [
        {
          name: "polygonscan",
          url: "https://mumbai.polygonscan.com/",
          standard: "EIP3091",
        },
      ],
    },
  ];

  const chain = chainData[1];

  const toHex = (num) => {
    return "0x" + num.toString(16);
  };

  const addToNetwork = async () => {
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
            
            axios
              .post("/api/users", {
                address: accounts[0],
                userName: accounts[0],
                image:
                  "https://aaquibdilkashdev.web.app/images/AaquibDilkash.jpeg",
              })
              .then((res) => {
                console.log(res, "dfjdkfjdkfjkdjfdf")
                localStorage.setItem("user", JSON.stringify(res.data.user));
                dispatch({
                  type: USER_GET_SUCCESS,
                  payload: res.data.user,
                });
                router.push("/");
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


  useEffect(() => {
    window.ethereum.on("accountsChanged", (account) => {
      console.log(account);
      // router.push("/login");
      console.log("account changed");
    });

    window.ethereum.on("chainChanged", (chain) => {
      console.log(chain);
      // router.push("/login");
      console.log("account changed");
    });
  }, []);

  return (
    <div className="flex justify-start items-center flex-col h-screen">
      <div className=" relative w-full h-full">
        <video
          src="../assets/share.mp4"
          type="video/mp4"
          loop
          controls={false}
          muted
          autoPlay
          className="w-full h-full object-cover"
        />

        <div className="absolute flex flex-col justify-center items-center top-0 right-0 left-0 bottom-0    bg-blackOverlay">
          <div className="p-5">
            <img src="../assets/logowhite.png" width="130px" alt="logo" />
          </div>

          <div className="shadow-2xl">
            <button
              type="button"
              className="bg-mainColor flex justify-center items-center p-3 rounded-lg cursor-pointer outline-none"
              onClick={addToNetwork}
            >
              <FaGoogleWallet className="mr-2" /> Connect and Get In
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
