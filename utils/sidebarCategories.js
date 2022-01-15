import {
  FaBaseballBall,
    FaBook,
    FaCat,
    FaDollarSign,
    FaGamepad,
    FaLaugh,
    FaMoneyBill,
    FaPaintBrush,
    FaPaperclip,
    FaPencilAlt,
    FaPhone,
    FaQuestion,
    FaReadme,
    FaSalesforce,
    FaShoppingBag,
    FaSign,
    FaSmile,
    FaUser,
  } from "react-icons/fa";
import { HiPhotograph } from "react-icons/hi";
import { IoIosAperture, IoMdAperture, IoMdArrowDropdown, IoMdArrowDropdownCircle, IoMdArrowDropupCircle } from "react-icons/io";
import { MdArrowDropDownCircle, MdArrowDropUp, MdCardGiftcard, MdCardMembership, MdSports } from "react-icons/md";
import { etherAddress } from "./data";
  
  export const sidebarCategories = {
    "Discover Categories": [
      {
        name: "All",
        link: "/",
        query: {
          category: ""
        },
        icon: <IoIosAperture className="" size={25} />,
      },
      {
        name: "Art",
        link: "/",
        query: {
          category: "Art"
        },
        icon: <FaPaintBrush className="" size={25} />,
      },
      {
        name: "Gaming",
        link: "/",
        query: {
          category: "Gaming"
        },
        icon: <FaGamepad className="" size={25} />,
      },
      {
        name: "Collectibles",
        link: "/",
        query: {
          category: "Collectibles"
        },
        icon: <FaCat className="" size={25} />,
      },
      {
        name: "Photography",
        link: "/",
        query: {
          category: "Photography"
        },
        icon: <HiPhotograph className="" size={25} />,
      },
      {
        name: "Sports",
        link: "/",
        query: {
          category: "Sports"
        },
        icon: <FaBaseballBall className="" size={25} />,
      },
      // {
      //   name: "Trading Cards",
      //   link: "/",
      //   query: {
      //     category: "Trading Cards"
      //   },
      //   icon: <MdCardGiftcard className="" size={25} />,
      // },
      {
        name: "Memes",
        link: "/",
        query: {
          category: "Memes"
        },
        icon: <FaLaugh className="" size={25} />,
      },
      // {
      //   name: "Gifs",
      //   link: "/",
      //   query: {
      //     category: "Gifs"
      //   },
      //   icon: <FaSmile className="" size={25} />,
      // },
    ],
    "Sort By": [
      {
        name: "Time: Recent",
        link: "/",
        query: {
          sort: "-createdAt"
        },
        icon: <IoMdArrowDropdownCircle className="" size={25} />,
      },
      {
        name: "Time: Oldest",
        link: "/",
        query: {
          sort: "createdAt"
        },
        icon: <IoMdArrowDropupCircle className="" size={25} />,
      },
      {
        name: "Price: Highest",
        link: "/",
        query: {
          sort: "-price"
        },
        icon: <IoMdArrowDropdownCircle className="" size={25} />,
      },
      {
        name: "Price: Lowest",
        link: "/",
        query: {
          sort: "price"
        },
        icon: <IoMdArrowDropupCircle className="" size={25} />,
      },
      {
        name: "Bid: Highest",
        link: "/",
        query: {
          sort: "-bids"
        },
        icon: <IoMdArrowDropdownCircle className="" size={25} />,
      },
      {
        name: "Bid: Lowest",
        link: "/",
        query: {
          sort: "bids"
        },
        icon: <IoMdArrowDropupCircle className="" size={25} />,
      },
    ],
    // "Sort By": [
    //   {
    //     name: "Highest Price",
    //     link: "/",
    //     query: {
    //       sort: "price"
    //     },
    //     icon: <FaMoneyBill className="" size={25} />,
    //   },
    //   {
    //     name: "Highest Bid (High)",
    //     link: "/",
    //     query: {
    //       sort: "bids"
    //     },
    //     icon: <FaDollarSign className="" size={25} />,
    //   },
    //   {
    //     name: "Lowest Price",
    //     link: "/",
    //     query: {
    //       sort: "-price"
    //     },
    //     icon: <FaMoneyBill className="" size={25} />,
    //   },
    //   {
    //     name: "Highest Bid (Low)",
    //     link: "/",
    //     query: {
    //       sort: "-bids"
    //     },
    //     icon: <FaDollarSign className="" size={25} />,
    //   },
    // ],

    // "My Dashboard": [
    //   {
    //     name: "Notifications",
    //     link: "/notifications",
    //     icon: <FaPhone className="" size={25} />,
    //   },
    //   {
    //     name: "Settings",
    //     link: "/settings",
    //     icon: <FaUser className="" size={25} />,
    //   }
    // ],
    // "Help Section": [
    //   {
    //     name: "FAQs",
    //     link: "/faqs",
    //     icon: <FaQuestion className="" size={25} />,
    //   },
    //   {
    //     name: "Blogs",
    //     link: "/blogs",
    //     icon: <FaBook className="" size={25} />,
    //   },
    //   {
    //     name: "Contact Us",
    //     link: "/contact_us",
    //     icon: <FaPencilAlt className="" size={25} />,
    //   },
    //   {
    //     name: "About Us",
    //     link: "/about_us",
    //     icon: <FaSign className="" size={25} />,
    //   },
    //   {
    //     name: "Privacy Policy",
    //     link: "/privacy_policy",
    //     icon: <FaPaperclip className="" size={25} />,
    //   },
    //   {
    //     name: "Terms and Conditions",
    //     link: "/terms_and_conditions",
    //     icon: <FaReadme className="" size={25} />,
    //   },
    // ],
  };
  