import { AiFillDollarCircle, AiFillLike, AiOutlineDollarCircle } from "react-icons/ai";
import {
  FaArrowAltCircleDown,
  FaArrowAltCircleLeft,
  FaArrowAltCircleRight,
  FaBaseballBall,
    FaCat,
    FaClock,
    FaComments,
    FaGamepad,
    FaLaugh,
    FaMusic,
    FaPaintBrush,
    FaRegComments,
    FaSmile,
    FaVideo,
  } from "react-icons/fa";
import { HiPhotograph } from "react-icons/hi";
import { IoIosAperture, IoMdArrowDropdownCircle, IoMdArrowDropupCircle } from "react-icons/io";
  
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
      {
        name: "Memes",
        link: "/",
        query: {
          category: "Memes"
        },
        icon: <FaLaugh className="" size={25} />,
      },
      {
        name: "Gifs",
        link: "/",
        query: {
          category: "Gifs"
        },
        icon: <FaSmile className="" size={25} />,
      },
      // {
      //   name: "Music",
      //   link: "/",
      //   query: {
      //     category: "Music"
      //   },
      //   icon: <FaMusic className="" size={25} />,
      // },
      // {
      //   name: "Videos",
      //   link: "/",
      //   query: {
      //     category: "Videos"
      //   },
      //   icon: <FaVideo className="" size={25} />,
      // },
    ],
    "Sort By": [
      {
        name: "Recent",
        type: ["pins", "collections", "users", undefined, ""],
        link: "/",
        array: [
          {
            icon: <IoMdArrowDropdownCircle className="" size={25} />,
            query: {
              sort: "-createdAt"
            }
          },
          {
            icon: <IoMdArrowDropupCircle className="" size={25} />,
            query: {
              sort: "createdAt"
            }
          },
        ],
        icon: <FaClock className="" size={25} />,
      },
      {
        name: "Sale Price",
        type: ["pins", undefined, ""],
        link: "/",
        array: [
          {
            icon: <IoMdArrowDropdownCircle className="" size={25} />,
            query: {
              sort: "-price"
            }
          },
          {
            icon: <IoMdArrowDropupCircle className="" size={25} />,
            query: {
              sort: "price"
            }
          },
        ],
        icon: <AiFillDollarCircle className="" size={28} />,
      },
      {
        name: "Auction Bid",
        type: ["pins", undefined, ""],
        link: "/",
        array: [
          {
            icon: <IoMdArrowDropdownCircle className="" size={25} />,
            query: {
              sort: "-bids"
            }
          },
          {
            icon: <IoMdArrowDropupCircle className="" size={25} />,
            query: {
              sort: "bids"
            }
          },
        ],
        icon: <AiOutlineDollarCircle className="" size={25} />,
      },
      {
        name: "Commented",
        type: ["pins", "collections", undefined, ""],
        link: "/",
        array: [
          {
            icon: <IoMdArrowDropdownCircle className="" size={25} />,
            query: {
              sort: "-commentsCount"
            }
          },
          {
            icon: <IoMdArrowDropupCircle className="" size={25} />,
            query: {
              sort: "commentsCount"
            }
          },
        ],
        icon: <FaRegComments className="" size={25} />,
      },
      {
        name: "Saved",
        type: ["pins", "collections", undefined, ""],
        link: "/",
        array: [
          {
            icon: <IoMdArrowDropdownCircle className="" size={25} />,
            query: {
              sort: "-savedCount"
            }
          },
          {
            icon: <IoMdArrowDropupCircle className="" size={25} />,
            query: {
              sort: "savedCount"
            }
          },
        ],
        icon: <AiFillLike className="" size={25} />,
      },
      {
        name: "Followers",
        type: ["users"],
        link: "/",
        array: [
          {
            icon: <IoMdArrowDropdownCircle className="" size={25} />,
            query: {
              sort: "-followersCount"
            }
          },
          {
            icon: <IoMdArrowDropupCircle className="" size={25} />,
            query: {
              sort: "followersCount"
            }
          },
        ],
        icon: <FaArrowAltCircleRight className="" size={25} />,
      },
      {
        name: "Following",
        type: ["users"],
        link: "/",
        array: [
          {
            icon: <IoMdArrowDropdownCircle className="" size={25} />,
            query: {
              sort: "-followingsCount"
            }
          },
          {
            icon: <IoMdArrowDropupCircle className="" size={25} />,
            query: {
              sort: "followingsCount"
            }
          },
        ],
        icon: <FaArrowAltCircleLeft className="" size={25} />,
      },
    ],

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
  