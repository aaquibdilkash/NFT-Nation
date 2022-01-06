import React, { useEffect, useState } from "react";
import { Spinner } from "../components";
import { MasonryLayout } from "../components";
import { useDispatch, useSelector } from "react-redux";
import axios from "axios";
import Head from "next/head";
import { HAS_MORE, MORE_LOADING } from "../redux/constants/UserTypes";
import { toast } from "react-toastify";

const SearchPage = () => {
  const CancelToken = axios.CancelToken;
const source = CancelToken.source();

  const dispatch = useDispatch()
  const [pins, setPins] = useState();
  const [loading, setLoading] = useState(false);
  const { searchTerm, page } = useSelector(
    (state) => state.userReducer
  );

  const fetchPins = () => {
    if (searchTerm !== "") {
      dispatch({
        type: MORE_LOADING,
        payload: page !== 1
      });
      page === 1 && setLoading(true);
      axios
        .get(`/api/pins?page=${page}&keyword=${searchTerm}`, {
          cancelToken: source.token
        })
        .then((res) => {
          const { pins, resultPerPage, filteredPinsCount } = res.data;
          setLoading(false);
          dispatch({
            type: MORE_LOADING,
            payload: false
          });
          page === 1 ? setPins(pins) : setPins((prev) => [...prev, ...pins]);
          dispatch({
            type: HAS_MORE,
            payload: page * resultPerPage < filteredPinsCount,
          });
        })
        .catch((e) => {
          if (axios.isCancel(e)) {
            // console.log('Request canceled', e.message);
          } else {
            setLoading(false);
          dispatch({
            type: MORE_LOADING,
            payload: false
          });
          toast.error("Something went wrong!")
          }
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
  }

  useEffect(() => {
    fetchPins()

    return () => source.cancel('Operation canceled by the user.');
  }, [searchTerm, page]);

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
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <div>
        {loading && <Spinner message="Searching pins..." />}
        {pins?.length !== 0 && <MasonryLayout pins={pins} />}
        {pins?.length === 0 && searchTerm !== "" && !loading && (
          <div className="mt-10 text-center text-xl font-bold">
            No Pins Found!
          </div>
        )}
      </div>
    </>
  );
};

export default SearchPage;
