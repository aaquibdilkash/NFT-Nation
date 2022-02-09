import moment from "moment";
import Image from "next/image";
import Link from "next/link";
import React from "react";
import { AiOutlineLoading3Quarters } from "react-icons/ai";
import { FaReply, FaReplyAll } from "react-icons/fa";
import { MdDeleteForever } from "react-icons/md";
import { getImage, getUserName } from "../utils/data";

const CommentSection = ({
    user,
    tab,
    showCommentReplies,
    setShowCommentReplies,
    commentsArr = [],
    deletingComment,
    deleteComment = () => {},
    commentReplies = [],
    setCommentReplies = () => {},
    deleteCommentReply = () => {}

}) => {
  return (
    <div>
      {tab === "comments" &&
        !showCommentReplies?._id &&
        commentsArr.length > 0 &&
        commentsArr?.map((item, index) => (
          <div
            key={index}
            className="flex flex-col p-2 bg-gradient-to-r from-secondTheme to-themeColor mt-2 bg-secondTheme rounded-lg"
          >
            {item?.user?._id && (
              <>
                <div className="flex gap-2">
                  <Link
                    onClick={() =>
                      router.push(`/user-profile/${item?.user?._id}`)
                    }
                    href={`/user-profile/${item?.user?._id}`}
                  >
                    <div className="flex flex-row gap-2 items-center cursor-pointer">
                      <Image
                        height={30}
                        width={30}
                        src={getImage(item?.user?.image)}
                        className="w-12 h-12 rounded-full"
                        alt="user-profile"
                      />
                      <p className="font-bold text-sm">
                        {getUserName(item?.user?.userName)}
                      </p>
                    </div>
                  </Link>
                  <div className="flex ml-auto items-center">
                    <p className="font-bold text-xs">
                      {moment(item?.createdAt).fromNow()}
                    </p>
                  </div>
                </div>
              </>
            )}
            <div className="flex justify-start ml-10">
              <p className="font-semibold text-sm">{item.comment}</p>
            </div>
            <div className="flex justify-center items-center cursor-pointer ml-10">
              <div
                onClick={(e) => {
                  setShowCommentReplies(item);
                }}
                className="flex flex-row"
              >
                <FaReply size={15} className="cursor-pointer mr-1" />
                <p className="text-sm font-semibold">{`${item?.repliesCount} ${
                  item?.repliesCount !== 1 ? `replies` : `reply`
                }`}</p>
              </div>

              {item?.user?._id === user?._id && (
                <div className="flex ml-auto">
                  {deletingComment !== item?._id ? (
                    <MdDeleteForever
                      onClick={() => {
                        deleteComment(item?._id);
                      }}
                      size={25}
                      className="cursor-pointer text-[#a83f39]"
                    />
                  ) : (
                    <AiOutlineLoading3Quarters
                      onClick={(e) => {
                        e.stopPropagation();
                      }}
                      size={25}
                      className="animate-spin cursor-pointer text-[#ff7f7f]"
                    />
                  )}
                </div>
              )}
            </div>
          </div>
        ))}

      {tab === "comments" && showCommentReplies?._id && (
        <div className="flex flex-col p-2 bg-gradient-to-r from-secondTheme to-themeColor mt-5 bg-secondTheme rounded-lg">
          {showCommentReplies?.user?._id && (
            <>
              <div className="flex gap-2">
                <Link
                  onClick={() =>
                    router.push(
                      `/user-profile/${showCommentReplies?.user?._id}`
                    )
                  }
                  href={`/user-profile/${showCommentReplies?.user?._id}`}
                >
                  <div className="flex flex-row gap-2 items-center cursor-pointer">
                    <Image
                      height={30}
                      width={30}
                      src={getImage(showCommentReplies?.user?.image)}
                      className="w-12 h-12 rounded-full"
                      alt="user-profile"
                    />
                    <p className="font-bold text-sm">
                      {getUserName(showCommentReplies?.user?.userName)}
                    </p>
                  </div>
                </Link>
                <div className="flex ml-auto items-center">
                  <p className="font-bold text-xs">
                    {moment(showCommentReplies?.createdAt).fromNow()}
                  </p>
                </div>
              </div>
            </>
          )}
          <div className="flex justify-start ml-10">
            <p className="font-semibold text-sm">
              {showCommentReplies.comment}
            </p>
          </div>
          <div className="flex justify-center items-center cursor-pointer ml-10">
            <div
              onClick={() => {
                setShowCommentReplies(showCommentReplies);
              }}
              className="flex flex-row"
            >
              <FaReply
                onClick={(e) => {
                  e.stopPropagation();
                }}
                size={15}
                className="cursor-pointer mr-1"
              />
              <p className="text-sm font-semibold">{`${
                showCommentReplies?.repliesCount
              } ${
                showCommentReplies?.repliesCount !== 1 ? `replies` : `reply`
              }`}</p>
            </div>
            <div
              onClick={(e) => {
                e.stopPropagation();
                setShowCommentReplies({});
                setCommentReplies([]);
              }}
              className="flex flex-row"
            >
              <FaReplyAll size={15} className="cursor-pointer mr-1 ml-4" />
              <p className="text-sm font-semibold">{`Go Back`}</p>
            </div>

            {showCommentReplies?.user?._id === user?._id && (
              <div className="flex ml-auto">
                {deletingComment !== showCommentReplies?._id ? (
                  <MdDeleteForever
                    onClick={() => {
                      deleteComment(showCommentReplies?._id);
                    }}
                    size={25}
                    className="cursor-pointer text-[#a83f39] shadow-xl drop-shadow-lg rounded-full"
                  />
                ) : (
                  <AiOutlineLoading3Quarters
                    onClick={(e) => {
                      e.stopPropagation();
                    }}
                    size={25}
                    className="animate-spin cursor-pointer text-[#ff7f7f]"
                  />
                )}
              </div>
            )}
          </div>

          {commentReplies.length > 0 &&
            commentReplies?.map((item, index) => (
              <div
                key={index}
                className="flex flex-col p-2 bg-gradient-to-r from-secondTheme to-themeColor mt-2 ml-7 bg-secondTheme rounded-lg"
              >
                {item?.user?._id && (
                  <>
                    <div className="flex gap-2">
                      <Link
                        onClick={() =>
                          router.push(`/user-profile/${item?.user?._id}`)
                        }
                        href={`/user-profile/${item?.user?._id}`}
                      >
                        <div className="flex flex-row gap-2 items-center cursor-pointer">
                          <Image
                            height={30}
                            width={30}
                            src={getImage(item?.user?.image)}
                            className="w-12 h-12 rounded-full"
                            alt="user-profile"
                          />
                          <p className="font-bold text-sm">
                            {getUserName(item?.user?.userName)}
                          </p>
                        </div>
                      </Link>
                      <div className="flex ml-auto items-center">
                        <p className="font-bold text-xs">
                          {moment(item?.createdAt).fromNow()}
                        </p>
                      </div>
                    </div>
                  </>
                )}
                <div className="flex justify-start ml-10">
                  <p className="font-semibold text-sm">{item.comment}</p>
                  {item?.user?._id === user?._id && (
                    <div className="flex ml-auto">
                      {deletingComment !== item?._id ? (
                        <MdDeleteForever
                          onClick={() => {
                            deleteCommentReply(item?._id);
                          }}
                          size={25}
                          className="cursor-pointer text-[#a83f39] shadow-xl drop-shadow-lg rounded-full"
                        />
                      ) : (
                        <AiOutlineLoading3Quarters
                          onClick={(e) => {
                            e.stopPropagation();
                          }}
                          size={25}
                          className="animate-spin cursor-pointer text-[#ff7f7f]"
                        />
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))}
        </div>
      )}
    </div>
  );
};

export default CommentSection;
