import React from "react";
// import { NavLink, Link } from 'react-router-dom';
import Link from "next/link";
import { FaHome } from "react-icons/fa";
import { IoIosArrowForward } from "react-icons/io";
import { AiFillCloseCircle, AiOutlineLogin } from "react-icons/ai";
import logo from "../public/assets/logo.png";
import { categories, getUserName } from "../utils/data";
import { useRouter } from "next/router";
import Image from "next/image";

const isNotActiveStyle =
  "font-semibold transition transition duration-500 ease transform hover:-translate-y-1 inline-block drop-shadow-lg flex items-center px-5 gap-3 text-gray-500  hover:font-extrabold hover:text-black transition-all duration-200 ease-in-out capitalize hover:cursor-pointer";
const isActiveStyle =
  "transition transition duration-500 ease transform hover:-translate-y-1 inline-block drop-shadow-lg flex items-center px-5 py-2 gap-3 font-extrabold border-r-2 border-black transition-all duration-200 ease-in-out capitalize hover:cursor-pointer bg-[#009387]";

const Sidebar = ({ user, connectToMetamask, setToggleSidebar = () => {} }) => {
  const router = useRouter()
  const handleCloseSidebar = () => {
    setToggleSidebar(false)
  };

  return (
    <div className="flex flex-col justify-between bg-white bg-gradient-to-r from-[#f9f9f9] to-[#009387] h-full overflow-y-scroll min-w-210 hide-scrollbar drop-shadow-lg">
      <div className="flex flex-col">
        <Link
          href="/"
          className="flex px-5 gap-2 my-6 pt-1 w-190 items-center"
        >
          <div onClick={handleCloseSidebar}  className="flex px-5 gap-2 my-6 pt-1 w-190 items-center hover:cursor-pointer">
          <Image height={30} width={150} src= "/assets/logo.png" alt="logo" className="w-full" />
          <div className="flex md:hidden absolute w-full flex justify-end items-center p-2">
            <AiFillCloseCircle fontSize={30} className="cursor-pointer mr-4" onClick={handleCloseSidebar} />
          </div>
          </div>
        </Link>
        <div className="flex flex-col gap-5">
          <Link
            href="/"
            className={router.pathname === "/" ? isActiveStyle : isNotActiveStyle }
          >
            <div onClick={handleCloseSidebar} className={router.pathname === "/" ? isActiveStyle : isNotActiveStyle }>
              <FaHome className="" size={25} />
              Home
            </div>
          </Link>
          <h3 className="mt-2 px-5 text-base 2xl:text-xl font-bold">
            Discover cateogries
          </h3>
          {categories.slice(0, categories.length - 1).map((category) => {
            return (
              <Link
                key={`${category.name}`}
                href={`/category/${category.name}`}
                className={router.pathname === "/" ? isActiveStyle : isNotActiveStyle }
              >
  
                <div onClick={handleCloseSidebar} className={router.query.categoryId === category.name ? isActiveStyle : isNotActiveStyle }>
                  <Image
                    height={30}
                    width={30}
                    alt={`${category.name.substring(0,1)}`}
                    src={category.image}
                    className="w-8 h-8 rounded-full shadow-sm"
                  />
                  {category.name}
                </div>
              </Link>
            )
          })}
        </div>
      </div>
      {user?._id && (
        <Link
          href={`/user-profile/${user?._id}`}
          className="flex my-5 mb-3 gap-2 p-2 items-center bg-white rounded-lg shadow-lg mx-3"
          onClick={handleCloseSidebar}
        >
          <div className="bg-gradient-to-r from-[#009387] to-[#f9f9f9] flex my-5 mb-3 gap-2 p-2 items-center bg-white rounded-lg shadow-lg hover:drop-shadow-lg mx-3 hover:cursor-pointer justify-between">

            {" "}
            <Image
              height={40}
              width={40}
              src={user?.image}
              className="w-10 h-10 rounded-full"
              alt="user-profile"
            />
            <p className="font-bold">{getUserName(user?.userName)}</p>
            <IoIosArrowForward className="" fontSize={21}/>
          </div>
        </Link>
      )}
      {!user?._id && (
          <div onClick={(e) => {
            handleCloseSidebar(e)
            connectToMetamask(e)
          }} className="bg-gradient-to-r from-[#009387] to-[#f9f9f9] flex my-5 mb-3 gap-2 p-3 items-center bg-white rounded-lg shadow-lg hover:drop-shadow-lg mx-3 hover:cursor-pointer justify-between">
            <p className="font-bold">{`Connect and Get In`}</p>
            <AiOutlineLogin className="font-bold" fontSize={21}/>
          </div>
      )}
    </div>
  );
};

export default Sidebar;
