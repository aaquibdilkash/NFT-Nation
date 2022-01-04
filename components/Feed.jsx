import React, { useState, useEffect } from "react";
import MasonryLayout from "./MasonryLayout";
import Spinner from "./Spinner";
import axios from "axios";
import { useSelector } from "react-redux";
import Head from "next/head";
import { HAS_MORE, MORE_LOADING } from "../redux/constants/UserTypes";
import { useDispatch } from "react-redux";

const Feed = ({ categoryId }) => {
  const dispatch = useDispatch();
  const [pins, setPins] = useState([]);
  const [loading, setLoading] = useState(false);
  const { page, moreLoading } = useSelector((state) => state.userReducer);

  const fetchPins = () => {
    if (categoryId) {
      setLoading(true);
      dispatch({
        type: MORE_LOADING,
        payload: page !== 1
      });
      axios
        .get(`/api/pins?page=${page}&category=${categoryId}`)
        .then((res) => {
          const { pins, resultPerPage, filteredPinsCount } = res.data;
          page === 1 ? setPins(pins) : setPins((prev) => [...prev, ...pins]);
          setLoading(false);
          dispatch({
            type: MORE_LOADING,
            payload: false
          });
          dispatch({
            type: HAS_MORE,
            payload: page * resultPerPage < filteredPinsCount,
          });
        })
        .catch((e) => {
          setLoading(false);
          dispatch({
            type: MORE_LOADING,
            payload: false
          });
        });
    } else {
      setLoading(true);
      axios
        .get(`/api/pins?page=${page}`)
        .then((res) => {
          const { pins, resultPerPage, pinsCount } = res.data;
          setLoading(false);
          page === 1 ? setPins(pins) : setPins((prev) => [...prev, ...pins]);
          dispatch({
            type: HAS_MORE,
            payload: page * resultPerPage < pinsCount,
          });
        })
        .catch((e) => {
          setLoading(false);
        });
    }
  };

  useEffect(() => {
    fetchPins();
  }, [categoryId, page]);

  const ideaName = categoryId || "new";
  if (loading && page === 1) {
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
      {categoryId && (
        <Head>
          <title>{`${categoryId} NFTs | NFT Nation`}</title>
          <meta
            name="description"
            content={`${categoryId} category ERC721 based NFT Tokens on NFT Nation which is a Polygon blockchain based Marketplace for trading ERC-21 NFT Tokens with MATIC Tokens`}
          />
          <meta
            property="og:title"
            content={`${categoryId} NFTs | NFT Nation`}
          />
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
      )}
      <div className="">
        {pins?.length > 0 && <MasonryLayout pins={pins} />}
      </div>
    </>
  );
};

export default Feed;
