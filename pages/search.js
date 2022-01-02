import React, { useEffect, useState } from 'react';
import {Spinner} from '../components';
import {MasonryLayout} from '../components';
import { useSelector } from 'react-redux';
import axios from "axios"
import Head from "next/head"


const SearchPage = () => {
  const [pins, setPins] = useState();
  const [loading, setLoading] = useState(false);
  const {refresh, searchTerm} = useSelector(state => state.userReducer)

  useEffect(() => {
    if (searchTerm !== '') {
      setLoading(true);
      axios.get(`/api/pins?keyword=${searchTerm}`).then((res) => {
        setLoading(false)
        setPins(res.data.pins)
      }).catch((e) => {
        setLoading(false)
      })
    } else {
      setLoading(true);
      axios.get(`/api/pins`).then((res) => {
        setLoading(false)
        setPins(res.data.pins)
      }).catch((e) => {
        setLoading(false)
      })
    }
  }, [searchTerm, refresh]);

  return (
    <>
    <Head>
        <title>Search NFTs | NFT Nation</title>
        <meta
          name="description"
          content={`Search ERC721 based NFT Tokens on NFT Nation which is a Polygon blockchain based Marketplace for trading ERC-21 NFT Tokens with MATIC Tokens`}
        />
        <meta property="og:title" content={`Search NFTs | NFT Nation`} />
        <meta
          property="og:description"
          content={`Search ERC721 based NFT Tokens on NFT Nation which is a Polygon blockchain based Marketplace for trading ERC-21 NFT Tokens with MATIC Tokens`}
        />
        <meta
          property="og:url"
          content={`https://nft-nation.vercel.app/search`}
        />
        <meta property="og:type" content="website" />
        <link rel="icon" href="/favicon.png" />
      </Head>
    <div>

{loading && <Spinner message="Searching pins..." />}
{pins?.length !== 0 && <MasonryLayout pins={pins} />}
{pins?.length === 0 && searchTerm !== '' && !loading && (
  <div className="mt-10 text-center text-xl font-bold">No Pins Found!</div>
)}
</div>
    </>
  );
};

export default SearchPage;
