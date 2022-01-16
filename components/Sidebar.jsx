import React from "react";
import Link from "next/link";
import { FaArtstation, FaHome, FaUserCircle } from "react-icons/fa";
import { IoIosArrowForward } from "react-icons/io";
import { AiFillCloseCircle, AiOutlineLogin } from "react-icons/ai";
import { getUserName, isSubset } from "../utils/data";
import { sidebarCategories } from "../utils/sidebarCategories";
import { useRouter } from "next/router";
import Image from "next/image";

const isNotActiveStyle =
  "font-semibold transition transition duration-500 ease transform hover:-translate-y-1 inline-block drop-shadow-lg flex items-center px-5 gap-3 text-gray-500  hover:font-extrabold hover:text-textColor transition-all duration-200 ease-in-out capitalize hover:cursor-pointer";
const isActiveStyle =
  "text-[#ffffff] transition transition duration-500 ease transform hover:-translate-y-1 inline-block drop-shadow-lg flex items-center px-5 py-2 gap-3 font-extrabold border-r-2 border-[#ffffff] transition-all duration-200 ease-in-out capitalize hover:cursor-pointer bg-themeColor";

const isNotActiveArrowStyle =
  "text-[#000000] font-semibold transition transition duration-500 ease transform hover:-translate-y-1 inline-block drop-shadow-lg flex items-center gap-3 text-gray-500  hover:font-extrabold hover:text-textColor transition-all duration-200 ease-in-out capitalize hover:cursor-pointer";
const isActiveArrowStyle =
  "text-[#ffffff] transition transition duration-500 ease transform hover:-translate-y-1 inline-block drop-shadow-lg flex items-center gap-3 font-extrabold transition-all duration-200 ease-in-out capitalize hover:cursor-pointer bg-themeColor";

const Sidebar = ({ user, connectToMetamask, setToggleSidebar = () => {} }) => {
  const router = useRouter();
  const { query, asPath, pathname } = router;
  const { category } = query;
  const handleCloseSidebar = () => {
    setToggleSidebar(false);
  };

  return (
    <div className="flex flex-col justify-between bg-secondTheme bg-gradient-to-r from-secondTheme to-themeColor h-full overflow-y-scroll min-w-210 hide-scrollbar drop-shadow-lg">
      <div className="flex flex-col">
        <Link href="/">
          <div
            onClick={() => {
              router.push(
                {
                  pathname: "/",
                  query: {},
                },
                undefined,
                { shallow: true }
              );
              handleCloseSidebar();
            }}
            className="flex px-5 gap-2 my-6 pt-1 w-190 items-center hover:cursor-pointer"
          >
            <div className="transition transition duration-500 ease transform hover:-translate-y-1 drop-shadow-lg flex gap-2 items-center">
              <FaArtstation className="" size={25} />{" "}
              <p className="font-bold text-lg">NFT Nation</p>
            </div>
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
          <div
            onClick={() => {
              router.push(
                {
                  pathname: "/",
                  query: {},
                },
                undefined,
                { shallow: true }
              );
              handleCloseSidebar();
            }}
            className={
              asPath === "/" ||
              (pathname === "/" &&
                query?.page &&
                Object.keys(query).length <= 1)
                ? isActiveStyle
                : isNotActiveStyle
            }
          >
            <FaHome className="" size={25} />
            Home
          </div>
          {user?._id && (
            <div
              onClick={() => {
                router.push(
                  {
                    pathname: "/",
                    query: {
                      feed: user?._id,
                    },
                  },
                  undefined,
                  { shallow: true }
                );
                handleCloseSidebar();
              }}
              className={query.feed ? isActiveStyle : isNotActiveStyle}
            >
              <FaUserCircle className="" size={25} />
              My Feed
            </div>
          )}
          <div className="flex flex-col gap-4">
            <h3 className="mt-1 px-5 text-base 2xl:text-xl font-bold">
              Discover Categories
            </h3>
            {sidebarCategories[`Discover Categories`].map((cat, index) => {
              const { link, name, icon } = cat;
              return (
                <div
                  key={index}
                  onClick={() => {
                    router.push(
                      {
                        pathname: pathname,
                        query: {
                          ...query,
                          ...cat.query,
                        },
                      },
                      undefined,
                      { shallow: true }
                    );
                    handleCloseSidebar();
                  }}
                  className={
                    isSubset(query, cat?.query)
                      ? isActiveStyle
                      : isNotActiveStyle
                  }
                >
                  {icon}
                  {name}
                </div>
              );
            })}
          </div>

          <div className="flex flex-col gap-4">
            <h3 className="mt-1 px-5 text-base 2xl:text-xl font-bold">
              Sort By
            </h3>
            {sidebarCategories[`Sort By`].map((cat, index) => {
              const { link, name, icon, array } = cat;
              const [query1, query2] = array;
              return (
                <div
                  key={index}
                  onClick={() => {
                    router.push(
                      {
                        pathname: pathname,
                        query: {
                          ...query,
                          ...query1.query,
                        },
                      },
                      undefined,
                      { shallow: true }
                    );
                    handleCloseSidebar();
                  }}
                  className={
                    // isSubset(query, cat?.query)
                    query?.sort?.includes(array[1].query.sort)
                      ? isActiveStyle
                      : isNotActiveStyle
                  }
                >
                  {icon}
                  {name}
                  <div className="flex inline-block justify-between ml-auto gap-2">
                    {array.map((item, index) => {
                      return (
                        <div
                          key={index}
                          onClick={(e) => {
                            e.stopPropagation();
                            router.push(
                              {
                                pathname: pathname,
                                query: {
                                  ...query,
                                  ...item.query,
                                },
                              },
                              undefined,
                              { shallow: true }
                            );
                            handleCloseSidebar();
                          }}
                          className={
                            // isSubset(query, cat?.query)
                            query?.sort == item.query.sort
                              ? isActiveArrowStyle
                              : isNotActiveArrowStyle
                          }
                        >
                          {item.icon}
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
      {user?._id && (
        <Link href={`/user-profile/${user?._id}`}>
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
