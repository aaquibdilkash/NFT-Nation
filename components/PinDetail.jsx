import React, { useEffect, useState } from "react";
import { MdDownloadForOffline } from "react-icons/md";
import Link from "next/link"
import { v4 as uuidv4 } from "uuid";
import { client } from "../client";
import MasonryLayout from "./MasonryLayout";
import Spinner from "./Spinner";
import { useSelector } from "react-redux";
import { morePinsGet, pinDetailGet } from "../redux/actions/pinActions";
import { useDispatch } from "react-redux";
import { getUserName } from "../utils/data";

const PinDetail = ({ pinId }) => {
  const dispatch = useDispatch()
  const {user} = useSelector(state => state.userReducer)
  // const {pinDetail, morePins} = useSelector(state => state.pinReducer)
  const [pins, setPins] = useState();
  const [pinDetail, setPinDetail] = useState();
  const [comment, setComment] = useState("");
  const [addingComment, setAddingComment] = useState(false);

  useEffect(() => {
    dispatch(pinDetailGet(pinId, (data) => {
      setPinDetail(data)
      dispatch(morePinsGet(data, (data) => {
        setPins(data)
      }, (e) => {
      }))
    }, (e) => {
    }))
  }, [pinId]);

  const addComment = () => {
    if (comment) {
      setAddingComment(true);

      client
        .patch(pinId)
        .setIfMissing({ comments: [] })
        .insert("after", "comments[-1]", [
          {
            comment,
            _key: uuidv4(),
            postedBy: { _type: "postedBy", _ref: user?._id },
          },
        ])
        .commit()
        .then(() => {
          dispatch(pinDetailGet(pinId, (data) => {
            setPinDetail(data)
          }, (e) => {
          }))
          setComment("");
          setAddingComment(false);
        });
    }
  };

  if (!pinDetail) {
    return <Spinner message="Showing pin" />;
  }

  return (
    <>
      {pinDetail && (
        <div
          className="flex xl:flex-row flex-col m-auto bg-white"
          style={{ maxWidth: "1500px", borderRadius: "32px" }}
        >
          <div className="flex justify-center items-center md:items-start flex-initial">
            <img
              className="rounded-t-3xl rounded-b-lg"
              src={pinDetail?.image}
              alt="user-post"
            />
          </div>
          <div className="w-full p-5 flex-1 xl:min-w-620">
            {/* <div className="flex items-center justify-between">
              <div className="flex gap-2 items-center">
                <a
                  href={`${pinDetail.image}`}
                  download
                  className="bg-secondaryColor p-2 text-xl rounded-full flex items-center justify-center text-dark opacity-75 hover:opacity-100"
                >
                  <MdDownloadForOffline />
                </a>
              </div>
              <a href={pinDetail.destination} target="_blank" rel="noreferrer">
                {pinDetail.destination?.slice(8)}
              </a>
            </div> */}
            <div>
              <h1 className="text-4xl font-bold break-words mt-0">
                {pinDetail.title}
              </h1>
              <p className="mt-3">{pinDetail.about}</p>
            </div>
            <Link
              href={`/user-profile/${pinDetail?.postedBy?._id}`}
              className="flex gap-2 mt-5 items-center bg-white rounded-lg "
            >
              <a><img
                src={pinDetail?.postedBy?.image}
                className="w-10 h-10 rounded-full"
                alt="user-profile"
              />
              <p className="font-bold">{getUserName(pinDetail?.postedBy?.userName)}</p></a>
            </Link>
            <h2 className="mt-5 text-2xl">Comments</h2>
            <div className="max-h-370 overflow-y-scroll">
              {pinDetail?.comments?.map((item) => (
                <div
                  key={`${item?._id}`}
                  className="flex gap-2 mt-5 items-center bg-white rounded-lg"
                >
                  <img
                    src={item.postedBy?.image}
                    className="w-10 h-10 rounded-full cursor-pointer"
                    alt="user-profile"
                  />
                  <div className="flex flex-col">
                    <p className="font-bold">{getUserName(item.postedBy?.userName)}</p>
                    <p>{item.comment}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="flex flex-wrap mt-6 gap-3">
              <Link href={`/user-profile/${user?._id}`}>
                <img
                  src={user?.image}
                  className="w-10 h-10 rounded-full cursor-pointer"
                  alt="user-profile"
                />
              </Link>
              <input
                className=" flex-1 border-gray-100 outline-none border-2 p-2 rounded-2xl focus:border-gray-300"
                type="text"
                placeholder="Add a comment"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
              />
              <button
                type="button"
                className="bg-red text-white rounded-full px-6 py-2 font-semibold text-base outline-none"
                onClick={addComment}
              >
                {addingComment ? "Doing..." : "Done"}
              </button>
            </div>
          </div>
        </div>
      )}
      {pins?.length > 0 && (
        <h2 className="text-center font-bold text-2xl mt-8 mb-4">
          More like this
        </h2>
      )}
      {pins ? (
        <MasonryLayout pins={pins} />
      ) : (
        <Spinner message="Loading more pins" />
      )}
    </>
  );
};

export default PinDetail;
