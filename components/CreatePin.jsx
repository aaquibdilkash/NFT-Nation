import {
  nftaddress, nftmarketaddress
} from '../config'
import NFT from '../artifacts/contracts/NFT.sol/NFT.json'
import Market from '../artifacts/contracts/NFTMarket.sol/NFTMarket.json'
import React, { useState } from 'react';
import Web3Modal from 'web3modal'
import { ethers } from 'ethers'
import { create as ipfsHttpClient } from 'ipfs-http-client'
import { AiOutlineCloudUpload } from 'react-icons/ai';
import { MdDelete } from 'react-icons/md';

import { categories, getUserName } from '../utils/data';
import { client } from '../client';
import Spinner from './Spinner';
import { useRouter } from 'next/router';
import { useSelector } from 'react-redux';


const ipfsClient = ipfsHttpClient('https://ipfs.infura.io:5001/api/v0')


const CreatePin = () => {
  const {user} = useSelector(state => state.userReducer)
  const [title, setTitle] = useState('');
  const [about, setAbout] = useState('');
  const [price, setPrice] = useState("")
  const [loading, setLoading] = useState(false);
  const [destination, setDestination] = useState();
  const [fields, setFields] = useState();
  const [category, setCategory] = useState();
  const [fileUrl, setFileUrl] = useState("")
  const [wrongImageType, setWrongImageType] = useState(false);

  // const navigate = useNavigate();
  const router = useRouter()

  const uploadImage = async (e) => {
    const selectedFile = e.target.files[0];
    // uploading asset to sanity
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

  const createMarket = async () => {
    if(!title || !about || price <= 0 || !fileUrl || !category) {
      setFields(true);

      setTimeout(
        () => {
          setFields(false);
        },
        2000,
      );

      return
    }
    // const { name, description, price } = formInput
    // if (!name || !description || !price || !fileUrl) return
    /* first, upload to IPFS */
    const data = JSON.stringify({
      name: title, description: about, image: fileUrl, external_url: destination
    })
    try {
      const added = await ipfsClient.add(data)
      const url = `https://ipfs.infura.io/ipfs/${added.path}`
      /* after file is uploaded to IPFS, pass the URL to save it on Polygon */
      createSale(url)
    } catch (error) {
      console.log('Error in Creating NFT: ', error)
    }  
  }

  const createSale = async (url) => {
    const web3Modal = new Web3Modal()
    const connection = await web3Modal.connect()
    const provider = new ethers.providers.Web3Provider(connection)    
    const signer = provider.getSigner()
    
    /* next, create the item */
    let contract = new ethers.Contract(nftaddress, NFT.abi, signer)
    let transaction = await contract.createToken(url)
    let tx = await transaction.wait()
    console.log(tx, "dslfjsdlfjsdljsdlkjdkf")
    let event = tx.events[0]
    let value = event.args[2]
    let tokenId = value.toNumber()

    const auctionPrice = ethers.utils.parseUnits(price, 'ether')
  
    /* then list the item for sale on the marketplace */
    contract = new ethers.Contract(nftmarketaddress, Market.abi, signer)

    transaction = await contract.createMarketItem(nftaddress, tokenId, auctionPrice)
    tx = await transaction.wait()
    event = tx.events[2]
    const {args} = event
    let itemId = args[0].toString()
    let nftContract = args[1].toString()
    tokenId = args[2].toString()
    let sellerId = args[3].toString()
    let ownerId = args[4].toString()
    // return
    savePin(itemId, nftContract, tokenId, sellerId, ownerId)
  }

  const savePin = (itemId, nftContract, tokenId, sellerId, ownerId, sold) => {
    if (title && about && price && fileUrl && category) {
      const doc = {
        _type: 'pin',
        title,
        about,
        itemId,
        nftContract,
        tokenId,
        sellerId,
        ownerId,
        price,
        sold,
        destination,
        image: fileUrl,
        postedBy: {
          _type: 'postedBy',
          _ref: user._id,
        },
        category,
      };
      client.create(doc).then(() => {
        router.push('/');
      });
    } else {
      setFields(true);

      setTimeout(
        () => {
          setFields(false);
        },
        2000,
      );
    }
  };
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
              <div className="relative h-full">
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
            value={title}
            onChange={(e) => setTitle(e.target.value)}
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
          <input
            type="text"
            vlaue={price}
            onChange={(e) => setPrice(e.target.value)}
            placeholder="Add a price for sale (in MATIC)"
            className="outline-none text-base sm:text-lg border-b-2 border-gray-200 p-2"
          />

          <div className="flex flex-col">
            <div>
              <p className="mb-2 font-semibold text:lg sm:text-xl">Choose Pin Category</p>
              <select
                onChange={(e) => {
                  setCategory(e.target.value);
                }}
                className="outline-none w-4/5 text-base border-b-2 border-gray-200 p-2 rounded-md cursor-pointer"
              >
                <option value="others" className="sm:text-bg bg-white">Select Category</option>
                {categories.map((item) => (
                  <option key={`${item.name}`} className="text-base border-0 outline-none capitalize bg-white text-black " value={item.name}>
                    {item.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex justify-end items-end mt-5">
              <button
                type="button"
                onClick={createMarket}
                className="bg-red text-white font-bold p-2 rounded-full w-28 outline-none"
              >
                Save Pin
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreatePin;
