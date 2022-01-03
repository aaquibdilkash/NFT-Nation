import React, { useState, useEffect } from 'react';
import MasonryLayout from './MasonryLayout';
import Spinner from './Spinner';
import axios from "axios"
import { useSelector } from 'react-redux';
import Head from 'next/head';

const Feed = ({categoryId}) => {
  const [pins, setPins] = useState();
  const [loading, setLoading] = useState(false);
  const {refresh} = useSelector(state => state.userReducer)

  useEffect(() => {
    if (categoryId) {
      setLoading(true);
      axios.get(`/api/pins?category=${categoryId}`).then((res) => {
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
  }, [categoryId, refresh]);

  const ideaName = categoryId || 'new';
  if (loading) {
    return (
      <Spinner message={`We are adding ${ideaName} ideas to your feed!`} />
    );
  }

  if (!loading && pins?.length < 1) {
    return (
      <div className="mt-10 text-center text-xl font-bold">No Pins Found!</div>
      );
  }

  
  return (
    <>
    {
      categoryId && (
        <Head>
        <title>{`${categoryId} NFTs  | NFT Nation`}</title>
        <meta
          name="description"
          content={`${categoryId} category ERC721 based NFT Tokens on NFT Nation which is a Polygon blockchain based Marketplace for trading ERC-21 NFT Tokens with MATIC Tokens`}
        />
        <meta property="og:title" content={`${categoryId} NFTs | NFT Nation`} />
        <meta
          property="og:description"
          content={`${categoryId} category ERC721 based NFT Tokens on NFT Nation which is a Polygon blockchain based Marketplace for trading ERC-21 NFT Tokens with MATIC Tokens`}
        />
        <meta
          property="og:url"
          content={`https://nft-nation.vercel.app/${categoryId}`}
        />
        <meta property="og:type" content="website" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      )
    }
      <div>
      {pins && (
        <MasonryLayout pins={pins} />
      )}
    </div>
    </>
  );
};

export default Feed;
