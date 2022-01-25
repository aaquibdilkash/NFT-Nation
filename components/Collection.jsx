import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import { useSelector } from "react-redux";
import { useDispatch } from "react-redux";
import { getUserName } from "../utils/data";
import { loginMessage, saveErrorMessage } from "../utils/messages";
import axios from "axios";
import Image from "next/image";
import { AiFillHeart, AiOutlineHeart } from "react-icons/ai";
import { toast } from "react-toastify";
import moment from "moment";

const buttonStyle =
  "transition transition duration-500 ease transform hover:-translate-y-1 bg-themeColor opacity-100 text-secondTheme font-semibold text-sm px-2 py-1 rounded-3xl shadow-lg hover:drop-shadow-lg outline-none";

const Collection = ({ collection }) => {
  const [savingPost, setSavingPost] = useState(false);
  // const dispatch = useDispatch();

  const {
    title,
    about,
    createdBy,
    image,
    _id,
    category,
    pinsCount,
    destination,
    saved,
    commentsCount,
    createdAt,
  } = collection;

  const router = useRouter();

  const { user } = useSelector((state) => state.userReducer);

  const [alreadySaved, setAlreadySaved] = useState(
    saved?.find((item) => item === user?._id)
  );
  const [savedLength, setSavedLenth] = useState(saved?.length);

  const saveCollection = () => {
    if (!user?._id) {
      toast.info(loginMessage);
      return;
    }
    setSavingPost(true);
    axios
      .put(`/api/collections/save/${_id}`, {
        user: user?._id,
      })
      .then((res) => {
        setSavingPost(false);
        // toast.success(alreadySaved ? unsaveSuccessMessage : saveSuccessMessage);
        setSavedLenth((prev) => (alreadySaved ? prev - 1 : prev + 1));
        setAlreadySaved((prev) => !prev);
      })
      .catch((e) => {
        console.log(e);
        setSavingPost(false);
        toast.error(saveErrorMessage);
      });
  };

  return (
    <div className="bg-white rounded-xl shadow-xl hover:shadow-2xl hover:subpixel-antialiased transform transition-all ease duration-500 m-4">
      <div
        onClick={() => router.push(`/collection-detail/${_id}`)}
        className="relative cursor-pointer w-25"
      >
        <div className="flex items-center justify-between px-4">
          <div
            onClick={(e) => {
              e.stopPropagation();
              router.push(`/user-profile/${createdBy?._id}`);
            }}
            className="flex justify-between items-center py-4 transition transition duration-500 ease transform hover:scale-1.5"
          >
            <Image
              height={45}
              width={45}
              className="w-12 rounded-full"
              src={createdBy?.image}
              alt={`${getUserName(createdBy?.userName)}`}
            />
            <div className="ml-3">
              <h1 className="text-sm font-bold text-gray-800 cursor-pointer">
                {getUserName(createdBy?.userName)}
              </h1>
              <p className="text-sm text-gray-800">
                Created {moment(createdAt).fromNow()}
              </p>
            </div>
          </div>

          <div>
            {/* <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-7 w-7 cursor-pointer"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z"
              />
            </svg> */}
            {/* <span
                  onClick={(e) => {
                    e.stopPropagation();
                    // addPinToCollection();
                  }}
                  className="text-[#ffffff] text-xs font-bold rounded-lg bg-themeColor inline-block mt-0 ml-1 py-1.5 px-2 cursor-pointer hover:drop-shadow-xl"
                >
                  {alreadyAdded ? `Follow` : `UnFollow`}
                </span> */}
          </div>
        </div>
        {image && (
          <Image
            placeholder="blur"
            blurDataURL="/favicon.png"
            height={200}
            width={180}
            layout="responsive"
            className="rounded-lg w-full"
            src={image}
            alt={`${title}`}
          />
        )}
        <div className="p-6 pb-0">
          <h2 className="text-sm text-gray-800 font-semibold">{`${title}`}</h2>
          <p className="text-sm font-semibold">{about}</p>
        </div>
        <div className="flex flex-row px-2 pb-1">
          <span className="text-[#ffffff] text-xs font-bold rounded-lg bg-themeColor inline-block mt-4 ml-1 py-1.5 px-2 cursor-pointer">
            {`NFTs: ${pinsCount}`}
          </span>
        </div>
        <div className="p-6 pt-2">
          <div className="flex space-x-4">
            <div className="flex space-x-1 items-center">
              <span>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-7 w-7 text-gray-600 cursor-pointer"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                  />
                </svg>
              </span>
              <span>{commentsCount}</span>
            </div>
            <div className="flex space-x-1 items-center">
              <span>
                {!alreadySaved && (
                  <AiOutlineHeart
                    onClick={(e) => {
                      e.stopPropagation();
                      saveCollection();
                    }}
                    className="text-[#000000] transition transition duration-500 ease transform hover:-translate-y-1 drop-shadow-lg cursor-pointer"
                    size={25}
                  />
                )}
                {alreadySaved && (
                  <AiFillHeart
                    onClick={(e) => {
                      e.stopPropagation();
                      saveCollection();
                    }}
                    className="text-[#a83f39] transition transition duration-500 ease transform hover:-translate-y-1 drop-shadow-lg cursor-pointer"
                    size={25}
                  />
                )}
              </span>
              <span>{savedLength}</span>
            </div>
            {/* <div className="flex space-x-1 items-center">
              {collectionId && collection?.createdBy?._id === user?._id && (
                <span
                  onClick={(e) => {
                    e.stopPropagation();
                    addPinToCollection();
                  }}
                  className="text-[#ffffff] text-xs font-bold rounded-lg bg-themeColor inline-block mt-0 ml-1 py-1.5 px-2 cursor-pointer"
                >
                  {alreadyAdded ? `Remove` : `Add`}
                </span>
              )}
            </div> */}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Collection;
