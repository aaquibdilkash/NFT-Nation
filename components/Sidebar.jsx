import React from "react";
import Link from "next/link";
import { FaArtstation, FaHome } from "react-icons/fa";
import { IoIosArrowForward } from "react-icons/io";
import { AiFillCloseCircle, AiOutlineLogin } from "react-icons/ai";
import { getUserName, isSubset } from "../utils/data";
import { sidebarCategories } from "../utils/sidebarCategories";
import { useRouter } from "next/router";
import Image from "next/image";

const isNotActiveStyle =
  "font-semibold transition transition duration-500 ease transform hover:-translate-y-1 inline-block drop-shadow-lg flex items-center px-5 gap-3 text-gray-500  hover:font-extrabold hover:text-textColor transition-all duration-200 ease-in-out capitalize hover:cursor-pointer";
const isActiveStyle =
  "text-[#ffffff] transition transition duration-500 ease transform hover:-translate-y-1 inline-block drop-shadow-lg flex items-center px-5 py-2 gap-3 font-extrabold border-r-2 border-textColor transition-all duration-200 ease-in-out capitalize hover:cursor-pointer bg-themeColor";

const Sidebar = ({ user, connectToMetamask, setToggleSidebar = () => {} }) => {
  const router = useRouter();
  const {query, asPath, pathname} = router
  const {category} = query
  const handleCloseSidebar = () => {
    setToggleSidebar(false);
  };

  return (
    <div className="flex flex-col justify-between bg-secondTheme bg-gradient-to-r from-secondTheme to-themeColor h-full overflow-y-scroll min-w-210 hide-scrollbar drop-shadow-lg">
      <div className="flex flex-col">
        <Link href="/" >
          <div
            onClick={handleCloseSidebar}
            className="flex px-5 gap-2 my-6 pt-1 w-190 items-center hover:cursor-pointer"
          >
            <div className="transition transition duration-500 ease transform hover:-translate-y-1 drop-shadow-lg flex gap-2 items-center"><FaArtstation className="" size={25} /> <p className="font-bold text-lg">NFT Nation</p></div>
            <div className="flex md:hidden absolute w-full flex justify-end items-center p-2">
              <AiFillCloseCircle
                fontSize={30}
                className="cursor-pointer mr-4"
                onClick={handleCloseSidebar}
              />
            </div>
          </div>
        </Link>
        <div className="flex flex-col gap-5">
          <Link
            href="/"
          >
            <div
              onClick={handleCloseSidebar}
              className={
                pathname === "/" ? isActiveStyle : isNotActiveStyle
              }
            >
              <FaHome className="" size={25} />
              Home
            </div>
          </Link>
          {Object.keys(sidebarCategories).map((item) => {
            return (
              <div className="flex flex-col gap-5" key={`${item}`}>
                <h3 className="mt-2 px-5 text-base 2xl:text-xl font-bold">
                  {item}
                </h3>
                {sidebarCategories[`${item}`].map((cat) => {
                  const {link, name, icon} = cat
                  return (
                    // <Link
                    //   key={`${name}`}
                    //   href={`${link}`}
                    // >
                      <div
                        onClick={() => {
                          router.push(
                            {
                              pathname: pathname,
                              query: {
                                ...query,
                                ...cat.query
                              },
                            },
                            undefined,
                            { shallow: true }
                          );
                          handleCloseSidebar()
                        }}
                        className={
                          // (item === "Discover Categories" ? (category === name) : (asPath === link))
                          isSubset(query, cat?.query)
                            ? isActiveStyle
                            : isNotActiveStyle
                        }
                      >
                        {icon}
                        {name}
                      </div>
                    // </Link>
                  );
                })}
              </div>
            );
          })}
        </div>
      </div>
      {user?._id && (
        <Link
          href={`/user-profile/${user?._id}`}
        >
          <div
            onClick={handleCloseSidebar}
            className="bg-gradient-to-r from-themeColor to-secondTheme flex my-5 mb-3 gap-2 p-2 items-center bg-secondTheme rounded-lg shadow-lg hover:drop-shadow-lg mx-3 hover:cursor-pointer justify-between"
          >
            {" "}
            <Image
              height={40}
              width={40}
              src={user?.image}
              className="w-10 h-10 rounded-full"
              alt="user-profile"
            />
            <p className="font-bold">{getUserName(user?.userName)}</p>
            <IoIosArrowForward className="" fontSize={21} />
          </div>
        </Link>
      )}
      {!user?._id && (
        <div
          onClick={(e) => {
            handleCloseSidebar(e);
            connectToMetamask(e);
          }}
          className="bg-gradient-to-r from-themeColor to-secondTheme flex my-5 mb-3 gap-2 p-3 items-center bg-secondTheme rounded-lg shadow-lg hover:drop-shadow-lg mx-3 hover:cursor-pointer justify-between"
        >
          <p className="font-bold">{`Connect and Get In`}</p>
          <AiOutlineLogin className="font-bold" fontSize={21} />
        </div>
      )}
    </div>
  );
};

export default Sidebar;
