import Link from "next/link";
import { useRouter } from "next/router";
import React, { useState } from "react";
import { HiPencilAlt } from "react-icons/hi";
import { IoMdAdd, IoMdSearch } from "react-icons/io";
import { useSelector } from "react-redux";

const blogSearch = [
  "All Blogs",
  "My Blogs",
  "My Saved Blogs",
  "My Unpublished Blogs",
  "My Published Blogs"
]

const blogSort = [
  "Latest",
  "Oldest",
  "Most Viewed",
  "Least Viewed",
  "Most Liked",
  "Least Liked",
  "Most Commented",
  "Least Commented",
]

const blogs = () => {
  const router = useRouter();
  const { user } = useSelector((state) => state.userReducer);
  const [searchTerm, setSearchTerm] = useState("");
  const [sort, setSort] = useState("");
  const [filter, setFilter] = useState("");
  return (
    <>
      <div className="flex gap-2 md:gap-5 w-full mt-0 pb-7">
        <div className="flex justify-start items-center w-full px-2 rounded-md bg-secondTheme border-none outline-none shadow-lg hover:drop-shadow-lg focus-within:drop-shadow-lg">
          <IoMdSearch fontSize={21} className="ml-1 " />
          <input
            type="text"
            onChange={(e) => {}}
            placeholder="Search Blogs..."
            value={searchTerm}
            // onFocus={() => router.push("/search")}
            // autoFocus={router.pathname === "/search"}
            className="p-2 w-full bg-secondTheme outline-none"
          />
        </div>
        <div className="flex gap-3 w-full">
          <select
            onChange={(e) => {
              
            }}
            value={filter}
            className="outline-none w-full h-12 px-3 py-2 text-base border-b-0 border-gray-200 rounded cursor-pointer bg-[#ffffff]"
          >
            <option value="" className="sm:text-bg bg-white">
              Filter Blogs
            </option>
            {blogSearch.map((item) => (
              <option
                key={`${item}`}
                className="text-base border-0 outline-none capitalize bg-[#ffffff] text-textColor"
                value={item}
              >
                {item}
              </option>
            ))}
          </select>
        </div>
        <div className="flex gap-3 w-full">
          <select
            onChange={(e) => {
              
            }}
            value={sort}
            className="outline-none w-full h-12 px-3 py-2 text-base border-b-0 border-gray-200 rounded cursor-pointer bg-[#ffffff]"
          >
            <option value="" className="sm:text-bg bg-white">
              Sort Blogs
            </option>
            {blogSearch.map((item) => (
              <option
                key={`${item}`}
                className="text-base border-0 outline-none capitalize bg-[#ffffff] text-textColor"
                value={item}
              >
                {item}
              </option>
            ))}
          </select>
        </div>
        <div className="flex gap-4">
          <Link href="/blogs/write">
            <div className="font-bold bg-textColor text-secondTheme rounded-lg w-auto h-12 px-3 flex justify-center items-center shadow-lg hover:drop-shadow-lg hover:cursor-pointer">
              {`Write`} <HiPencilAlt className="ml-1" />
            </div>
          </Link>
        </div>
      </div>
      <section className="flex flex-row flex-wrap mx-auto">
        {[1, 2, 3, 4, 5, 6].map((item, index) => {
          return (
            <div
              onClick={() => {
                router.push(`/blogs/1`);
              }}
              key={index}
              className="transition-all duration-150 flex w-full px-4 py-6 md:w-1/2 lg:w-1/3"
            >
              <div className="flex flex-col items-stretch min-h-full pb-4 mb-6 transition-all duration-150 bg-gradient-to-r from-themeColor to-secondTheme rounded-lg shadow-lg hover:shadow-2xl">
                <div className="md:flex-shrink-0">
                  <img
                    src="https://www.unfe.org/wp-content/uploads/2019/04/SM-placeholder-1024x512.png"
                    alt="Blog Cover"
                    className="object-fill w-full rounded-lg rounded-b-none md:h-56"
                  />
                </div>
                <div className="flex items-center justify-between px-4 py-2 overflow-hidden">
                  <span className="text-xs font-medium text-blue-600 uppercase">
                    Web Programming
                  </span>
                  <div className="flex flex-row items-center">
                    <div className="text-xs font-medium text-gray-500 flex flex-row items-center mr-2">
                      <svg
                        className="w-4 h-4 mr-1"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          stroke-width="2"
                          d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                        ></path>
                        <path
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          stroke-width="2"
                          d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                        ></path>
                      </svg>
                      <span>1.5k</span>
                    </div>

                    <div className="text-xs font-medium text-gray-500 flex flex-row items-center mr-2">
                      <svg
                        className="w-4 h-4 mr-1"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          stroke-width="2"
                          d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z"
                        ></path>
                      </svg>
                      <span>25</span>
                    </div>

                    <div className="text-xs font-medium text-gray-500 flex flex-row items-center">
                      <svg
                        className="w-4 h-4 mr-1"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          stroke-width="2"
                          d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5"
                        ></path>
                      </svg>
                      <span>7</span>
                    </div>
                  </div>
                </div>
                <hr className="border-gray-300" />
                <div className="flex flex-wrap items-center flex-1 px-4 py-1 text-center mx-auto">
                  <a href="#" className="hover:underline">
                    <h2 className="text-2xl font-bold tracking-normal text-gray-800">
                      Ho to Yawn in 7 Days
                    </h2>
                  </a>
                </div>
                <hr className="border-gray-300" />
                <p className="flex flex-row flex-wrap w-full px-4 py-2 overflow-hidden text-sm text-justify text-gray-700">
                  Lorem ipsum dolor sit amet consectetur adipisicing elit.
                  Alias, magni fugiat, odit incidunt necessitatibus aut nesciunt
                  exercitationem aliquam id voluptatibus quisquam maiores
                  officia sit amet accusantium aliquid quo obcaecati quasi.
                </p>
                <hr className="border-gray-300" />
                <section className="px-4 py-2 mt-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center flex-1">
                      <img
                        className="object-cover h-10 rounded-full"
                        src="https://thumbs.dreamstime.com/b/default-avatar-photo-placeholder-profile-icon-eps-file-easy-to-edit-default-avatar-photo-placeholder-profile-icon-124557887.jpg"
                        alt="Avatar"
                      />
                      <div className="flex flex-col mx-2">
                        <a
                          href=""
                          className="font-semibold text-gray-700 hover:underline"
                        >
                          Fajrian Aidil Pratama
                        </a>
                        <span className="mx-1 text-xs text-gray-600">
                          28 Sep 2020
                        </span>
                      </div>
                    </div>
                    <p className="mt-1 text-xs text-gray-600">9 minutes read</p>
                  </div>
                </section>
              </div>
            </div>
          );
        })}
      </section>
    </>
  );
};

export default blogs;
