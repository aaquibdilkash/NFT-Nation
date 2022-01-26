import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import { useSelector } from "react-redux";
import { buttonStyle, getImage, getUserName } from "../utils/data";
import {
  followErrorMessage,
  followSuccessMessage,
  loginMessage,
  unFollowErrorMessage,
  unFollowSuccessMessage,
} from "../utils/messages";
import axios from "axios";
import Image from "next/image";
import { toast } from "react-toastify";
import moment from "moment";
import {
  CURRENT_PROFILE_SET,
  USER_GET_SUCCESS,
} from "../redux/constants/UserTypes";
import { useDispatch } from "react-redux";

const User = ({ userProfile }) => {
  const {
    _id,
    address,
    image,
    about,
    userName,
    followers,
    followings,
    followersCount,
    followingsCount,
    createdAt,
  } = userProfile;

  const router = useRouter();
  const dispatch = useDispatch();

  const { user } = useSelector((state) => state.userReducer);

  const [currentProfile, setCurrentProfile] = useState(userProfile);

  const [following, setFollowing] = useState(false);

  const [alreadyFollowed, setAlreadyFollowed] = useState(
    user?.followings?.find((item) => item === _id)
  );

  const followUser = () => {
    if (!user?._id) {
      toast.info(loginMessage);
      return;
    }
    setFollowing(true);
    axios
      .put(`/api/users/follow/${_id}`, {
        user: user?._id,
      })
      .then((res) => {
        setFollowing(false);
        toast.success(
          alreadyFollowed ? unFollowSuccessMessage : followSuccessMessage
        );
        // setFollowingsLength((prev) => (alreadyFollowed ? prev - 1 : prev + 1));

        const filteredFollowings = alreadyFollowed
          ? user?.followings.filter((item, index) => item !== _id)
          : [...user?.followings, _id];

        dispatch({
          type: USER_GET_SUCCESS,
          payload: {
            ...user,
            followings: filteredFollowings,
            followingsCount: filteredFollowings.length,
          },
        });

        const filteredFollowers = alreadyFollowed
          ? currentProfile?.followers.filter(
              (item, index) => item !== user?._id
            )
          : [...currentProfile?.followers, user?._id];

        setCurrentProfile((prev) => ({
          ...prev,
          followers: filteredFollowers,
          followersCount: filteredFollowers.length,
        }));

        // setAlreadyFollowed((prev) => !prev);
      })
      .catch((e) => {
        console.log(e);
        setFollowing(false);
        toast.error(
          alreadyFollowed ? unFollowErrorMessage : followErrorMessage
        );
      });
  };

  useEffect(() => {
    user?._id &&
      setAlreadyFollowed(user?.followings?.find((item) => item === _id));
  }, [user, currentProfile]);

  return (
    <div className="bg-gradient-to-r from-secondTheme to-themeColor rounded-xl shadow-xl hover:shadow-2xl transform transition-all ease duration-500 m-4">
      <div
        onClick={() => router.push(`/user-profile/${_id}`)}
        className="relative cursor-pointer w-25"
      >
        {image && (
          <Image
            placeholder="blur"
            blurDataURL="/favicon.png"
            height={200}
            width={180}
            layout="responsive"
            className="rounded-lg w-full"
            src={getImage(image)}
            alt={`${getUserName(userName)}`}
          />
        )}

        <div className="flex items-center justify-between px-4">
          <div
            onClick={(e) => {
              e.stopPropagation();
              router.push(`/user-profile/${_id}`);
            }}
            className="flex justify-between items-center py-4 transition transition duration-500 ease transform hover:scale-1.5"
          >
            <Image
              height={45}
              width={45}
              className="w-12 rounded-full"
              src={getImage(image)}
              alt={`${getUserName(userName)}`}
            />
            <div className="ml-3">
              <h1 className="text-sm font-bold text-gray-800 cursor-pointer">
                {getUserName(userName)}
              </h1>
              <p className="text-sm text-gray-800">
                Joined {moment(createdAt).fromNow()}
              </p>
            </div>
          </div>

          <div>
            {user?._id !== _id && (
              <span
                onClick={(e) => {
                  e.stopPropagation();
                  // addPinToCollection();
                  followUser();
                }}
                className={buttonStyle}
              >
                {alreadyFollowed ? `UnFollow` : `Follow`}
              </span>
            )}
          </div>
        </div>

        <div className="px-6 pb-0">
          <p className="text-sm text-center font-semibold">{about}</p>
        </div>

        <div className="flex flex-row justify-evenly px-2 pb-1">
          <span className={buttonStyle}>
            {`${currentProfile?.followersCount} Followers`}
          </span>
          <span className={buttonStyle}>{`${followingsCount} Followings`}</span>
        </div>
        <div className="p-6 pt-2"></div>
      </div>
    </div>
  );
};

export default User;
