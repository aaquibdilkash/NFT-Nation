import React, { useState } from "react";
import { create as ipfsHttpClient } from "ipfs-http-client";
import { AiOutlineCloudUpload } from "react-icons/ai";
import { MdDelete } from "react-icons/md";
import { getUserName } from "../utils/data";
import Spinner from "../components/Spinner";
import { useSelector } from "react-redux";
import axios from "axios";
import { useDispatch } from "react-redux";
import { USER_GET_SUCCESS } from "../redux/constants/UserTypes";
import Image from "next/image";
import Link from "next/link";
import { toast } from "react-toastify";

const ipfsClient = ipfsHttpClient("https://ipfs.infura.io:5001/api/v0");

const ProfileEdit = ({ userId, setEditing }) => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.userReducer);
  const [userName, setUserName] = useState("");
  const [about, setAbout] = useState("");
  const [imageLoading, setImageLoading] = useState(false);
  const [fields, setFields] = useState();
  const [fileUrl, setFileUrl] = useState("");
  const [wrongImageType, setWrongImageType] = useState(false);
  const [progress, setProgress] = useState(0);


  const uploadImage = async (e) => {
    const selectedFile = e.target.files[0];
    if (
      selectedFile.type === "image/png" ||
      selectedFile.type === "image/svg" ||
      selectedFile.type === "image/jpeg" ||
      selectedFile.type === "image/gif" ||
      selectedFile.type === "image/tiff"
    ) {
      setWrongImageType(false);
      setImageLoading(true);
      try {
        const added = await ipfsClient.add(selectedFile, {
          progress: (prog) => setProgress(parseInt((prog/selectedFile.size)*100)),
        });
        const url = `https://ipfs.infura.io/ipfs/${added.path}`;
        setFileUrl(url);
        setImageLoading(false);
      } catch (error) {
        console.log("Error uploading file: ", error);
      }
    } else {
      setLoading(false);
      setWrongImageType(true);
    }
  };

  const updateProfile = async () => {
    if (!userName || !about || !fileUrl) {
      setFields(true);

      setTimeout(() => {
        setFields(false);
      }, 2000);

      return;
    }
    const obj = {
      userName,
      about,
      image: fileUrl,
    };

    axios
      .put(`/api/users/${userId}`, obj)
      .then((res) => {
        setEditing(false)
        toast.success("Profile Updated Successfuly!")
        dispatch({
          type: USER_GET_SUCCESS,
          payload: res.data.user,
        });
      })
      .catch((e) => {
        toast.error("Something went wrong!")
        // console.log("Error in updating profile: ", e);
      });
  };

  return (
    <div className="flex flex-col justify-center items-center mt-0 lg:h-4/5">
      {fields && (
        <p className="text-themeColor mb-5 text-xl transition-all duration-150 ease-in ">
          Please add all fields.
        </p>
      )}
      <div className="rounded-lg flex lg:flex-row flex-col justify-center items-center bg-secondTheme lg:p-5 p-3 lg:w-auto  w-full">
        <div className="rounded-lg bg-gradient-to-r from-themeColor to-secondTheme bg-secondaryColor p-3 flex flex-0.7 w-4/5">
          <div className=" flex justify-center items-center flex-col border-2 border-dotted border-gray-300 p-3 w-full h-420">
          {imageLoading && (
            <div className="flex flex-col items-center justify-center h-full w-full px-16 mx-16">
              <Spinner title="Uploading..." message={`${progress}%`}/>
            </div>
          )}
            {wrongImageType && <p>It&apos;s wrong file type.</p>}
            {!fileUrl && !imageLoading && (
                // eslint-disable-next-line jsx-a11y/label-has-associated-control
                <label>
                  <div className="flex flex-col items-center justify-center h-full">
                    <div className="flex flex-col justify-center items-center">
                      <p className="font-bold text-2xl">
                        <AiOutlineCloudUpload />
                      </p>
                      <p className="text-lg">Click to upload</p>
                    </div>

                    <p className="mt-32 text-gray-400">
                      Recommendation: Use high-quality JPG, JPEG, SVG, PNG, GIF
                      or TIFF less than 20MB
                    </p>
                  </div>
                  <input
                    type="file"
                    name="upload-image"
                    onChange={uploadImage}
                    className="w-0 h-0"
                  />
                </label>
              ) } 
              {fileUrl && !imageLoading && (
                <div className="relative h-full">
                  <img
                    src={fileUrl}
                    alt="uploaded-pic"
                    className="h-full w-full"
                  />
                  <button
                    type="button"
                    className="absolute bottom-3 right-3 p-3 rounded-full bg-secondTheme text-xl cursor-pointer outline-none hover:shadow-md transition-all duration-500 ease-in-out"
                    onClick={() => {
                      setFileUrl(null)
                      setProgress(0)
                    }}
                  >
                    <MdDelete />
                  </button>
                </div>
              )}
          </div>
        </div>

        <div className="flex flex-1 flex-col gap-6 lg:pl-5 mt-5 w-full">
          <input
            type="text"
            value={userName}
            onChange={(e) => setUserName(e.target.value)}
            maxLength={42}
            placeholder="Type your username"
            className="outline-none text-2xl sm:text-3xl font-bold border-b-2 border-gray-200 p-2 rounded-lg focus:drop-shadow-lg"
          />

          <textarea
            type="text"
            value={about}
            maxLength={80}
            onChange={(e) => setAbout(e.target.value)}
            placeholder="Tell everyone about you"
            className="outline-none text-base sm:text-lg border-b-2 border-gray-200 p-2 rounded-lg focus:drop-shadow-lg"
          />
          {user?._id && (
            <Link href={`/user-profile/${user?._id}`} >
              <div className="flex gap-2 mt-2 mb-2 items-center bg-secondTheme rounded-lg cursor-pointer transition transition duration-500 ease transform hover:-translate-y-1">
              <Image
                height={40}
                width={40}
                src={user.image}
                className="w-10 h-10 rounded-full"
                alt="user-profile"
              />
              <p className="font-bold">{getUserName(user?.userName)}</p>
            </div>
            </Link>
          )}

          <div className="flex flex-col">
            <div className="flex justify-end items-end mt-5">
              <button
                type="button"
                onClick={updateProfile}
                className="drop-shadow-lg transition transition duration-500 ease transform hover:-translate-y-1 inline-block bg-themeColor text-secondTheme font-bold p-3 rounded-full w-auto outline-none"
              >
                Save Profile
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileEdit;
