import React, { useEffect, useState } from "react";
import { AiOutlineLogout } from "react-icons/ai";
// import { GoogleLogout } from 'react-google-login';

import {
  userCreatedPinsQuery,
  userQuery,
  userSavedPinsQuery,
  userSalePinsQuery,
  getUserName
} from "../utils/data";
import { client } from "../client";
import MasonryLayout from "./MasonryLayout";
import Spinner from "./Spinner";
import { useRouter } from "next/router";

const activeBtnStyles =
  "bg-red dark:bg-black mr-4 text-white dark:text-white font-bold p-2 rounded-full w-20 outline-none";
const notActiveBtnStyles =
  "bg-primary mr-4 text-black dark:text-black font-bold p-2 rounded-full w-20 outline-none";

const UserProfile = ({userId}) => {
  const [user, setUser] = useState();
  const [pins, setPins] = useState();
  const [text, setText] = useState("Owned");
  const [activeBtn, setActiveBtn] = useState("Owned");
  const router = useRouter();

  useEffect(() => {
    const query = userQuery(userId);
    client.fetch(query).then((data) => {
      setUser(data[0]);
    });
  }, [userId]);

  useEffect(() => {
    if (text === "Owned") {
      const createdPinsQuery = userCreatedPinsQuery(userId);

      client.fetch(createdPinsQuery).then((data) => {
        setPins(data);
      });
    } else if (text === "On Sale") {
      const savedPinsQuery = userSalePinsQuery(userId);

      client.fetch(savedPinsQuery).then((data) => {
        setPins(data);
      });
    } else {
      const savedPinsQuery = userSavedPinsQuery(userId);

      client.fetch(savedPinsQuery).then((data) => {
        setPins(data);
      });
    }
  }, [text, userId]);

  const logout = () => {
    localStorage.clear();

    router.push("/login");
  };

  if (!user) return <Spinner message="Loading profile" />;

  return (
    <div className="relative pb-2 h-full justify-center items-center">
      <div className="flex flex-col pb-5">
        <div className="relative flex flex-col mb-7">
          <div className="flex flex-col justify-center items-center">
            <img
              className=" w-full h-370 2xl:h-510 shadow-lg object-cover"
              src="https://source.unsplash.com/1600x900/?nature,photography,technology"
              alt="user-pic"
            />
            <img
              className="rounded-full w-20 h-20 -mt-10 shadow-xl object-cover"
              src={user.image}
              alt="user-pic"
            />
          </div>
          <h1 className="font-bold text-3xl text-center mt-3">
          {getUserName(user?.userName)}
          </h1>
          <div className="absolute top-0 z-1 right-0 p-2">
            <button
              type="button"
              className=" bg-white p-2 rounded-full cursor-pointer outline-none shadow-md"
              onClick={logout}
            >
              <AiOutlineLogout color="red" fontSize={21} />
            </button>
          </div>
        </div>
        <div className="text-center mb-7">
          <button
            type="button"
            onClick={(e) => {
              setText(e.target.textContent);
              setActiveBtn("Owned");
            }}
            className={`${
              activeBtn === "Owned" ? activeBtnStyles : notActiveBtnStyles
            }`}
          >
            Owned
          </button>
          <button
            type="button"
            onClick={(e) => {
              setText(e.target.textContent);
              setActiveBtn("On Sale");
            }}
            className={`${
              activeBtn === "On Sale" ? activeBtnStyles : notActiveBtnStyles
            }`}
          >
            On Sale
          </button>
          <button
            type="button"
            onClick={(e) => {
              setText(e.target.textContent);
              setActiveBtn("saved");
            }}
            className={`${
              activeBtn === "saved" ? activeBtnStyles : notActiveBtnStyles
            }`}
          >
            Saved
          </button>
        </div>

        <div className="px-2">
          <MasonryLayout pins={pins} />
        </div>

        {pins?.length === 0 && (
          <div className="flex justify-center font-bold items-center w-full text-1xl mt-2">
            No Pins Found!
          </div>
        )}
      </div>
    </div>
  );
};

export default UserProfile;
