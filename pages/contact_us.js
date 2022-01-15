import axios from "axios";
import React, { useState } from "react";
import {
  FaDiscord,
  FaInstagram,
  FaReddit,
  FaTelegram,
  FaTwitter,
} from "react-icons/fa";
import { MdEmail } from "react-icons/md";
import { useSelector } from "react-redux";
import { toast } from "react-toastify";
import { errorMessage } from "../utils/messages";
import { sidebarCategories } from "../utils/sidebarCategories";

const wayToReach = [
  "Email",
  "Instagram",
  "Twitter",
  "Telegram",
  "Discord",
  "Reddit"
]

const messageCategory = [
  "Mint NFT",
  "Mint and Sell",
  "Mint and Auct",
  "Buy NFT",
  "Sell NFT",
  "Auct NFT",
  "Bid",
  "Withdraw Bid",
  "End Auction",
  "Feedback",
  "Suggession"
]

const ContactUs = () => {
  const { user } = useSelector((state) => state.userReducer);
  const [state, setState] = useState({
    name: "",
    subject: "",
    description: "",
    category: "",
    image: "",
    wayToReach: "",
    reachId: "",
  });

  const handleSubmit = () => {
    axios
      .post(`/api/messages`, {
        ...state,
        postedBy: user?._id
      })
      .then((res) => {
        console.log(res);
        toast.success("Your Feedback has been submitted successfuly!");
        setState({
          name: "",
          subject: "",
          description: "",
          category: "",
          image: "",
          wayToReach: "",
          reachId: "",
        })
      })
      .catch((e) => {
        console.log(e);
        toast.error(errorMessage);
      });
  };

  return (
    <div>
      <section className="text-gray-600 body-font relative">
        <div className="container px-5 py-6 mx-auto">
          <div className="flex flex-col text-center w-full mb-12">
            <h1 className="sm:text-3xl text-2xl font-medium title-font mb-4 text-gray-900">
              Contact Us
            </h1>
            <p className="lg:w-2/3 mx-auto leading-relaxed text-base">
              Any thoughts you wanna share with us...?
            </p>
          </div>
          <div className="lg:w-1/2 md:w-2/3 mx-auto">
            <div className="flex flex-wrap -m-2">
              <div className="p-2 w-full">
                <div className="relative">
                  <label
                    htmlFor="name"
                    className="leading-7 text-sm text-gray-600"
                  >
                    Name
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={state.name}
                    onChange={(e) => {
                      setState((state) => ({
                        ...state,
                        name: e.target.value,
                      }));
                    }}
                    className="w-full bg-gray-100 bg-opacity-50 rounded border border-gray-300 focus:border-indigo-500 focus:bg-white focus:ring-2 focus:ring-indigo-200 text-base outline-none text-gray-700 py-1 px-3 leading-8 transition-colors duration-200 ease-in-out"
                  />
                </div>
              </div>
              <div className="p-2 w-1/2">
                <div className="relative">
                  <label
                    htmlFor="wayToReach"
                    className="leading-7 text-sm text-gray-600"
                  >
                    Way To Reach
                  </label>
                  <select
                    onChange={(e) => {
                      setState((state) => ({
                        ...state,
                        wayToReach: e.target.value,
                      }));
                    }}
                    value={state.wayToReach}
                    className="outline-none w-full h-10 text-base border-b-0 border-gray-200 p-2 rounded cursor-pointer bg-[#ffffff]"
                  >
                    <option value="" className="sm:text-bg bg-white">
                      Select an Option
                    </option>
                    {wayToReach.map((item) => (
                      <option
                        key={`${item}`}
                        className="text-base border-0 outline-none capitalize bg-[#ffffff] text-textColor "
                        value={item}
                      >
                        {item}
                      </option>
                    ))}
                    <option
                      value="other"
                      className="sm:text-bg bg-secondTheme"
                    >
                      Other
                    </option>
                  </select>
                </div>
              </div>
              <div className="p-2 w-1/2">
                <div className="relative">
                  <label
                    htmlFor="reachId"
                    className="leading-7 text-sm text-gray-600"
                  >
                    How To Reach
                  </label>
                  <input
                    type="text"
                    id="reachId"
                    name="reachId"
                    value={state.reachId}
                    placeholder={`eg: @nftnation`}
                    onChange={(e) => {
                      setState((state) => ({
                        ...state,
                        reachId: e.target.value,
                      }));
                    }}
                    className="w-full bg-gray-100 bg-opacity-50 rounded border border-gray-300 focus:border-indigo-500 focus:bg-[#ffffff] focus:ring-2 focus:ring-indigo-200 text-base outline-none text-gray-700 py-1 px-3 leading-8 transition-colors duration-200 ease-in-out"
                  />
                </div>
              </div>
              <div className="p-2 w-1/2">
                <div className="relative">
                  <label
                    htmlFor="category"
                    className="leading-7 text-sm text-gray-600"
                  >
                    Category
                  </label>
                  <select
                    onChange={(e) => {
                      setState((state) => ({
                        ...state,
                        category: e.target.value,
                      }));
                    }}
                    value={state.category}
                    className="outline-none w-full h-10 text-base border-b-0 border-gray-200 p-2 rounded cursor-pointer bg-[#ffffff]"
                  >
                    <option value="" className="sm:text-bg bg-white">
                      Select Category
                    </option>
                    {messageCategory.map((item) => (
                      <option
                        key={`${item}`}
                        className="text-base border-0 outline-none capitalize bg-white text-textColor "
                        value={item}
                      >
                        {item}
                      </option>
                    ))}
                    <option
                      value="other"
                      className="sm:text-bg bg-secondTheme"
                    >
                      Other
                    </option>
                  </select>
                </div>
              </div>
              <div className="p-2 w-1/2">
                <div className="relative">
                  <label
                    htmlFor="image"
                    className="leading-7 text-sm text-gray-600"
                  >
                    Screenshot
                  </label>
                  <input
                    type="file"
                    id="image"
                    name="image"
                    value={state.image}
                    onChange={(e) => {
                      setState((state) => ({
                        ...state,
                        image: e.target.value,
                      }));
                    }}
                    className="w-full bg-gray-100 bg-opacity-50 rounded border border-gray-300 focus:border-[#000000] bg-[#ffffff] focus:ring-0 focus:ring-[#000000] text-base outline-none text-gray-700 py-1 px-3 leading-8 transition-colors duration-200 ease-in-out"
                  />
                </div>
              </div>
              <div className="p-2 w-full">
                <div className="relative">
                  <label
                    htmlFor="subject"
                    className="leading-7 text-sm text-gray-600"
                  >
                    Subject
                  </label>
                  <input
                    type="text"
                    id="subject"
                    name="subject"
                    value={state.subject}
                    onChange={(e) => {
                      setState((state) => ({
                        ...state,
                        subject: e.target.value,
                      }));
                    }}
                    className="w-full bg-gray-100 bg-opacity-50 rounded border border-gray-300 focus:border-indigo-500 focus:bg-white focus:ring-2 focus:ring-indigo-200 text-base outline-none text-gray-700 py-1 px-3 leading-8 transition-colors duration-200 ease-in-out"
                  />
                </div>
              </div>
              <div className="p-2 w-full">
                <div className="relative">
                  <label
                    htmlFor="message"
                    className="leading-7 text-sm text-gray-600"
                  >
                    Message
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    value={state.description}
                    onChange={(e) => {
                      setState((state) => ({
                        ...state,
                        description: e.target.value,
                      }));
                    }}
                    className="w-full bg-gray-100 bg-opacity-50 rounded border border-gray-300 focus:border-indigo-500 focus:bg-white focus:ring-2 focus:ring-indigo-200 h-32 text-base outline-none text-gray-700 py-1 px-3 resize-none leading-6 transition-colors duration-200 ease-in-out"
                  ></textarea>
                </div>
              </div>
              <div className="p-2 w-full">
                <button
                  onClick={() => {
                    handleSubmit();
                  }}
                  className="transition transition duration-500 ease transhtmlForm hover:-translate-y-1 flex mx-auto text-[#ffffff] bg-themeColor border-0 py-2 px-8 focus:outline-none drop-shadow-lg rounded text-lg"
                >
                  Button
                </button>
              </div>
              <div className="p-2 w-full pt-8 mt-8 border-t border-gray-200 text-center">
                <a className="text-indigo-500">example@email.com</a>
                <div className="flex justify-between my-5">
                  <a href="mailto:abc@example.com" target="_blank">
                    <MdEmail
                      size={28}
                      className="transition transition duration-500 ease transhtmlForm hover:-translate-y-1 text-black text-bold cursor-pointer"
                    />
                  </a>
                  <a href="#" target="_blank">
                    <FaDiscord
                      size={28}
                      className="transition transition duration-500 ease transhtmlForm hover:-translate-y-1 text-black text-bold cursor-pointer"
                    />
                  </a>
                  <a href="#" target="_blank">
                    <FaTelegram
                      size={28}
                      className="transition transition duration-500 ease transhtmlForm hover:-translate-y-1 text-black text-bold cursor-pointer"
                    />
                  </a>
                  <a href="#" target="_blank">
                    <FaTwitter
                      size={28}
                      className="transition transition duration-500 ease transhtmlForm hover:-translate-y-1 text-black text-bold cursor-pointer"
                    />
                  </a>
                  <a href="#" target="_blank">
                    <FaInstagram
                      size={28}
                      className="transition transition duration-500 ease transhtmlForm hover:-translate-y-1 text-black text-bold cursor-pointer"
                    />
                  </a>
                  <a href="#" target="_blank">
                    <FaReddit
                      size={28}
                      className="transition transition duration-500 ease transhtmlForm hover:-translate-y-1 text-black text-bold cursor-pointer"
                    />
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default ContactUs;
