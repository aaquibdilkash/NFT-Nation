
  import React, { useState } from 'react';
  import { create as ipfsHttpClient } from 'ipfs-http-client'
  import { AiOutlineCloudUpload } from 'react-icons/ai';
  import { MdDelete } from 'react-icons/md';
  import { getUserName } from '../utils/data';
  import Spinner from '../components/Spinner';
  import { useRouter } from 'next/router';
  import { useSelector } from 'react-redux';
  import axios from 'axios';
import { userGet } from '../redux/actions/userActions';
  
  
  const ipfsClient = ipfsHttpClient('https://ipfs.infura.io:5001/api/v0')
  
  
  const ProfileEdit = ({userId}) => {
    const {user} = useSelector(state => state.userReducer)
    const [userName, setUserName] = useState('');
    const [about, setAbout] = useState('');
    const [loading, setLoading] = useState(false);
    const [fields, setFields] = useState();

    const [fileUrl, setFileUrl] = useState("")
    const [wrongImageType, setWrongImageType] = useState(false);
    
    const uploadImage = async (e) => {
      const selectedFile = e.target.files[0];
      if (selectedFile.type === 'image/png' || selectedFile.type === 'image/svg' || selectedFile.type === 'image/jpeg' || selectedFile.type === 'image/gif' || selectedFile.type === 'image/tiff') {
        setWrongImageType(false);
        setLoading(true);
        try {
          const added = await ipfsClient.add(
            selectedFile,
            {
              progress: (prog) => console.log(`received: ${prog}`)
            }
          )
          const url = `https://ipfs.infura.io/ipfs/${added.path}`
          setFileUrl(url)
          setLoading(false);
        } catch (error) {
          console.log('Error uploading file: ', error)
        }
      } else {
        setLoading(false);
        setWrongImageType(true);
      }
    };
  
    const updateProfile = async () => {
      if(!userName || !about || !fileUrl) {
        setFields(true);
  
        setTimeout(
          () => {
            setFields(false);
          },
          2000,
        );
  
        return
      }
      const obj = {
        userName, about, image: fileUrl
      }

      axios.put(`/api/users/${userId}`, obj).then((res) => {
          userGet(userId)
      }).catch((e) => {
        console.log('Error in updating profile: ', e)
      })
      
    }
  

  
    return (
      <div className="flex flex-col justify-center items-center mt-5 lg:h-4/5">
        {fields && (
          <p className="text-red mb-5 text-xl transition-all duration-150 ease-in ">Please add all fields.</p>
        )}
        <div className=" flex lg:flex-row flex-col justify-center items-center bg-white lg:p-5 p-3 lg:w-4/5  w-full">
          <div className="bg-secondaryColor p-3 flex flex-0.7 w-full">
            <div className=" flex justify-center items-center flex-col border-2 border-dotted border-gray-300 p-3 w-full h-420">
              {loading && (
                <Spinner />
              )}
              {
                wrongImageType && (
                  <p>It&apos;s wrong file type.</p>
                )
              }
              {!fileUrl ? (
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
                      Recommendation: Use high-quality JPG, JPEG, SVG, PNG, GIF or TIFF less than 20MB
                    </p>
                  </div>
                  <input
                    type="file"
                    name="upload-image"
                    onChange={uploadImage}
                    className="w-0 h-0"
                  />
                </label>
              ) : (
                <div className="relative h-full w-full">
                  <img
                    src={fileUrl}
                    alt="uploaded-pic"
                    className="h-full w-full"
                  />
                  <button
                    type="button"
                    className="absolute bottom-3 right-3 p-3 rounded-full bg-white text-xl cursor-pointer outline-none hover:shadow-md transition-all duration-500 ease-in-out"
                    onClick={() => setFileUrl(null)}
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
              placeholder="Add your title"
              className="outline-none text-2xl sm:text-3xl font-bold border-b-2 border-gray-200 p-2"
            />
            {user && (
              <div className="flex gap-2 mt-2 mb-2 items-center bg-white rounded-lg ">
                <img
                  src={user.image}
                  className="w-10 h-10 rounded-full"
                  alt="user-profile"
                />
                <p className="font-bold">{getUserName(user?.userName)}</p>
              </div>
            )}
            <input
              type="text"
              value={about}
              onChange={(e) => setAbout(e.target.value)}
              placeholder="Tell everyone what your NFT is about"
              className="outline-none text-base sm:text-lg border-b-2 border-gray-200 p-2"
            />
  
            <div className="flex flex-col">
              <div className="flex justify-end items-end mt-5">
                <button
                  type="button"
                  onClick={updateProfile}
                  className="bg-red text-white font-bold p-2 rounded-full w-28 outline-none"
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
  