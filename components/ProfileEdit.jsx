import { useEffect, useState } from "react";
// import { create as ipfsHttpClient } from "ipfs-http-client";
import {
  AiOutlineCloudUpload,
  AiOutlineLoading3Quarters,
} from "react-icons/ai";
import { MdDelete } from "react-icons/md";
import {
  formButtonStyles,
  getImage,
  getUserName,
  pinFileToIPFS,
  removePinFromIPFS,
} from "../utils/data";
import Spinner from "../components/Spinner";
import { useSelector } from "react-redux";
import axios from "axios";
import { useDispatch } from "react-redux";
import {
  CURRENT_PROFILE_SET,
  USER_GET_SUCCESS,
} from "../redux/constants/UserTypes";
import Image from "next/image";
import Link from "next/link";
import { toast } from "react-toastify";
import {
  duplicateFileInfoMessage,
  errorMessage,
  fileUploadErrorMessage,
  fillFieldsInfoMessage,
  profileUpdatedSuccessMessage,
  userNameTakenInfoMessage,
} from "../utils/messages";

// const ipfsClient = ipfsHttpClient("https://ipfs.infura.io:5001/api/v0");

const ProfileEdit = ({ setEditing }) => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.userReducer);
  const [userName, setUserName] = useState("");
  const [about, setAbout] = useState("");
  const [imageLoading, setImageLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [fields, setFields] = useState();
  const [fileUrl, setFileUrl] = useState("");
  const [prevFileUrl, setPrevFileUrl] = useState(null);
  const [wrongImageType, setWrongImageType] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const unPinHash = localStorage.getItem("unPinProfileHash");
      if (unPinHash && unPinHash !== user?.image) {
        removePinFromIPFS(
          unPinHash,
          () => {
            localStorage.removeItem("unPinProfileHash");
          },
          (e) => {
            console.log(e);
          }
        );
      } else {
        localStorage.removeItem("unPinProfileHash");
      }
    }
  }, []);

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
        // const added = await ipfsClient.add(selectedFile, {
        //   progress: (prog) =>
        //     setProgress(parseInt((prog / selectedFile.size) * 100)),
        // });
        // const url = `https://ipfs.infura.io/ipfs/${added.path}`;

        pinFileToIPFS(
          selectedFile,
          setProgress,
          (hash, isDuplicate) => {
            if (isDuplicate) {
              toast.info(duplicateFileInfoMessage);
              setImageLoading(false);
              return;
            }
            setFileUrl(hash);
            if (hash !== user?.image) {
              localStorage.setItem("unPinProfileHash", hash);
            }
            setImageLoading(false);
          },
          (error) => {
            toast.error(fileUploadErrorMessage);
            setImageLoading(false);
          }
        );
      } catch (error) {
        toast.error(fileUploadErrorMessage);
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
    
    setSaving(true);

    const obj = {
      userName,
      about,
      image: fileUrl,
    };

    axios
      .put(`/api/users/${user?._id}`, obj)
      .then((res) => {
        toast.success(profileUpdatedSuccessMessage);
        // localStorage.removeItem("unPinProfileHash");
        setSaving(false);

        if (res.data.user.image !== prevFileUrl) {
          // localStorage.setItem("unPinProfileHash", prevFileUrl)
          removePinFromIPFS(
            prevFileUrl,
            () => {
              localStorage.removeItem("unPinProfileHash");
            },
            (e) => {
              localStorage.setItem("unPinProfileHash", prevFileUrl);
              console.log(e);
            }
          );
        }

        dispatch({
          type: USER_GET_SUCCESS,
          payload: res.data.user,
        });
        dispatch({
          type: CURRENT_PROFILE_SET,
          payload: res.data.user,
        });
        setEditing(false);
      })
      .catch((e) => {
        setSaving(false);
        if(e?.response?.data?.includes("E11000 duplicate key error")) {
          toast.info(userNameTakenInfoMessage)
        } else {
          toast.error(errorMessage);
        }
        // console.log("Error in updating profile: ", e);
      });
  };

  useEffect(() => {
    const { userName, about, image } = user;
    setUserName(userName);
    setAbout(about);
    setFileUrl(image);
    setPrevFileUrl(image);
  }, [user]);

  return (
    <div className="flex flex-col justify-center items-center mt-0 lg:h-4/5">
      {fields && (
        <p className="text-themeColor mb-5 text-xl transition-all duration-150 ease-in ">
          {fillFieldsInfoMessage}
        </p>
      )}
      <div className="rounded-lg flex lg:flex-row flex-col justify-center items-center bg-secondTheme lg:p-5 p-3 lg:w-auto  w-full">
        <div className="rounded-lg bg-secondaryColor p-3 flex flex-0.7 w-4/5">
          <div className=" flex justify-center items-center flex-col border-2 border-dotted border-gray-300 p-3 w-full h-420">
            {imageLoading && (
              <div className="flex flex-col items-center justify-center h-full w-full px-16 mx-16">
                <Spinner
                  title={progress ? `Uploading...` : ``}
                  message={progress ? `${progress}%` : ``}
                />
              </div>
            )}
            {wrongImageType && <p>It&apos;s wrong file type.</p>}
            {!fileUrl && !imageLoading && (
              <div className="relative h-full">
                <label>
                  <div className="flex flex-col items-center justify-center h-full">
                    <div className="flex flex-col justify-center items-center">
                      <p className="font-bold text-2xl">
                        <AiOutlineCloudUpload />
                      </p>
                      <p className="text-lg font-bold">Click to upload</p>
                    </div>

                    <p className="mt-32 text-center font-bold text-wrap">
                      Use high-quality JPG, JPEG, SVG, PNG, GIF or TIFF less
                      than 20MB
                    </p>
                  </div>
                  <input
                    type="file"
                    name="upload-image"
                    onChange={uploadImage}
                    className="w-0 h-0"
                  />
                </label>
              </div>
            )}
            {fileUrl && !imageLoading && (
              <div className="relative h-full">
                <img
                  src={getImage(fileUrl)}
                  alt="uploaded-pic"
                  className="h-full w-full rounded-lg drop-shadow-lg"
                />
                {!saving && (
                  <button
                    type="button"
                    className="absolute bottom-3 right-3 p-3 rounded-full bg-secondTheme text-xl cursor-pointer outline-none hover:shadow-md transition-all duration-500 ease-in-out"
                    onClick={() => {
                      if (fileUrl !== user?.image) {
                        setProgress(0);
                        setImageLoading(true);
                        removePinFromIPFS(
                          fileUrl,
                          () => {
                            setImageLoading(false);
                            setFileUrl(null);
                            localStorage.removeItem("unPinProfileHash");
                          },
                          () => {
                            toast.error(errorMessage);
                            setImageLoading(false);
                          }
                        );
                      } else {
                        setFileUrl(null);
                        setProgress(0);
                      }
                    }}
                  >
                    <MdDelete />
                  </button>
                )}
              </div>
            )}
          </div>
        </div>

        <div className="flex flex-1 flex-col gap-6 lg:pl-5 mt-5 w-full">
          <input
            type="text"
            value={userName}
            onChange={(e) => setUserName(e.target.value)}
            maxLength={16}
            placeholder="Type your username"
            className="outline-none text-2xl sm:text-3xl font-bold border-b-2 border-gray-200 p-2 focus:drop-shadow-lg"
          />

          <textarea
            type="text"
            value={about}
            maxLength={80}
            onChange={(e) => setAbout(e.target.value)}
            placeholder="Tell everyone about you"
            className="outline-none text-base sm:text-lg border-b-2 border-gray-200 p-2 focus:drop-shadow-lg"
          />
          {user?._id && (
            <Link href={`/users/${user?.userName}`}>
              <div className="flex gap-2 mt-2 mb-2 items-center bg-secondTheme rounded-lg cursor-pointer transition transition duration-500 ease transform hover:-translate-y-1">
                <Image
                  height={40}
                  width={40}
                  src={getImage(user.image)}
                  className="w-10 h-10 rounded-full"
                  alt={getUserName(user?.userName)}
                />
                <p className="font-bold">{getUserName(user?.userName)}</p>
              </div>
            </Link>
          )}

          <div className="flex flex-col">
            <div className="flex justify-end items-end mt-5 gap-2">
              <button
                type="button"
                onClick={() => {
                  setEditing(false);
                }}
                className={formButtonStyles}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={updateProfile}
                className={formButtonStyles}
              >
                {!saving ? (
                  `Save`
                ) : (
                  <AiOutlineLoading3Quarters
                    onClick={(e) => {
                      e.stopPropagation();
                      // savePin();
                    }}
                    className="mx-5 font-bold animate-spin text-[#ffffff] drop-shadow-lg cursor-pointer"
                    size={24}
                  />
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileEdit;
