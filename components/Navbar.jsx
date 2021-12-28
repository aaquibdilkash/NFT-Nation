import React from 'react';
import Link from "next/link"
import { IoMdAdd, IoMdSearch } from 'react-icons/io';
import { useRouter } from 'next/router';
import { useSelector } from 'react-redux';

const Navbar = ({ searchTerm, setSearchTerm }) => {
  const {user} = useSelector(state => state.userReducer)
  const router = useRouter()

  if (user) {
    return (
      <div className="flex gap-2 md:gap-5 w-full mt-5 pb-7">
        <div className="flex justify-start items-center w-full px-2 rounded-md bg-white dark:bg-black border-none outline-none shadow-lg hover:drop-shadow-lg focus-within:drop-shadow-lg">
          <IoMdSearch fontSize={21} className="ml-1 dark:text-white" />
          <input
            type="text"
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search"
            value={searchTerm}
            onFocus={() => router.push('/search')}
            autoFocus={router.pathname === "/search"}
            className="p-2 w-full bg-white dark:bg-black outline-none dark:text-white"
          />
        </div>
        <div className="flex gap-3 ">
          <Link href={`/user-profile/${user?._id}`} className="hidden md:block">
            <img src={user.image} alt="user-pic" className="w-14 h-12 rounded-lg shadow-lg hover:drop-shadow-lg hover:cursor-pointer" />
          </Link>
          <Link href="/create-pin" >
            <div className="bg-black text-white rounded-lg w-12 h-12 md:w-14 md:h-12 flex justify-center items-center shadow-lg hover:drop-shadow-lg hover:cursor-pointer">
            <IoMdAdd className=''/>
            </div>
          </Link>
        </div>
      </div>
    );
  }

  return null;
};

export default Navbar;
