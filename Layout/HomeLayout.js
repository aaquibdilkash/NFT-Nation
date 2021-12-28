import React, { useState, useRef, useEffect } from "react";
import { HiMenu } from "react-icons/hi";
import Link from "next/link";
import { Sidebar } from "../components";
import { useDispatch, useSelector } from "react-redux";
import { userGet } from "../redux/actions/userActions";
import PinsLayout from "./PinsLayout";

const HomeLayout = ({children, ...pageProps}) => {
  const [toggleSidebar, setToggleSidebar] = useState(false);
  const scrollRef = useRef(null);
  const dispatch = useDispatch()
  const {user} = useSelector(state => state.userReducer)

  useEffect(() => {
    
    const ISSERVER = typeof window === "undefined";
    let userInfo;
    if (!ISSERVER) {
      userInfo =
        localStorage.getItem("user") !== "undefined"
          ? localStorage.getItem("user")
          : localStorage.clear();
    }

    dispatch(userGet(userInfo))
  }, []);

  useEffect(() => {
    scrollRef.current.scrollTo(0, 0);
  }, []);

  return (
    <div className="flex bg-gradient-to-r from-[#009387] to-[#ffffff] md:flex-row flex-col h-screen transition-height duration-75 ease-out">
      <div className="hidden md:flex h-screen flex-initial">
        <Sidebar user={user && user} />
      </div>
      <div className="flex md:hidden flex-row">
        <div className="p-2 w-full flex flex-row justify-between items-center shadow-md">
          <HiMenu
            fontSize={40}
            className="cursor-pointer hover:drop-shadow-lg dark:text-white"
            onClick={() => setToggleSidebar(true)}
          />
          <Link href="/">
            <img src="../assets/logo.png" alt="logo" className="w-28" />
          </Link>
          <Link href={`user-profile/${user?._id}`}>
            <img
              src={user?.image}
              alt="user-pic"
              className="w-9 h-9 rounded-full shadow-lg hover:drop-shadow-lg cursor-pointer"
            />
          </Link>
        </div>
        {toggleSidebar && (
        <div className="fixed w-3/5 bg-white h-screen overflow-y-auto shadow-md z-10 animate-slide-in">
          <Sidebar closeToggle={setToggleSidebar} user={user && user} />
        </div>
        )}
      </div>
      <div
        className="pb-2 flex-1 h-screen overflow-y-scroll"
        ref={scrollRef}
      >
          <PinsLayout {...pageProps}>
            {children}
          </PinsLayout>
      </div>
    </div>
  );
};

export default HomeLayout;
