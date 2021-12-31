import React from "react";
import Link from "next/link";
import { IoMdAdd, IoMdSearch } from "react-icons/io";
import { useRouter } from "next/router";
import { useSelector } from "react-redux";
import { useDispatch } from "react-redux";
import { SEARCH_TERM_SET } from "../redux/constants/UserTypes";
import { AiOutlineLogin } from "react-icons/ai";

const Navbar = ({connectToMetamask}) => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.userReducer);
  const { searchTerm } = useSelector((state) => state.userReducer);
  const router = useRouter();

  return (
    <div className="flex gap-2 md:gap-5 w-full mt-5 pb-7">
      <div className="flex justify-start items-center w-full px-2 rounded-md bg-white border-none outline-none shadow-lg hover:drop-shadow-lg focus-within:drop-shadow-lg">
        <IoMdSearch fontSize={21} className="ml-1 " />
        <input
          type="text"
          onChange={(e) => {
            dispatch({
              type: SEARCH_TERM_SET,
              payload: e.target.value,
            });
          }}
          placeholder="Search"
          value={searchTerm}
          onFocus={() => router.push("/search")}
          autoFocus={router.pathname === "/search"}
          className="p-2 w-full bg-white outline-none"
        />
      </div>
      <div className="flex gap-3 ">
        {user?._id && (
          <Link href={`/user-profile/${user?._id}`} className="hidden md:block">
            <img
              src={user?.image}
              alt="user-pic"
              className="w-14 h-12 rounded-lg shadow-lg hover:drop-shadow-lg hover:cursor-pointer"
            />
          </Link>
        )}
        {!user?._id && (
          // <Link 
          // // href="/create-pin"
          // onClick={addToNetwork}
          // >
            <div onClick={connectToMetamask} className="bg-black text-white rounded-lg w-12 h-12 md:w-14 md:h-12 flex justify-center items-center shadow-lg hover:drop-shadow-lg hover:cursor-pointer">
            <AiOutlineLogin color="#00ff00" fontSize={21}/>
            </div>
          // </Link>
        )}
        <Link href="/create-pin">
          <div className="bg-black text-white rounded-lg w-12 h-12 md:w-14 md:h-12 flex justify-center items-center shadow-lg hover:drop-shadow-lg hover:cursor-pointer">
            <IoMdAdd className="" />
          </div>
        </Link>
      </div>
    </div>
  );
};

export default Navbar;
