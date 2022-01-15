import React, { useState, useEffect } from "react";
import MasonryLayout from "./MasonryLayout";
import Spinner from "./Spinner";
import axios from "axios";
import { useSelector } from "react-redux";
import { HAS_MORE } from "../redux/constants/UserTypes";
import { useDispatch } from "react-redux";
import { useRouter } from "next/router";
import { toast } from "react-toastify";

const Feed = () => {
  const dispatch = useDispatch();
  const router = useRouter();
  const [pins, setPins] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user, hasMore } = useSelector((state) => state.userReducer);
  const CancelToken = axios.CancelToken;
  const source = CancelToken.source();

  const {query} = router
  const { page, keyword, category, owner, seller, bids, saved, auctionEnded, feed, pinId, sort } = query;

  const link = `/api/pins?${page ? `page=${page}` : `page=1`}${
    keyword ? `&keyword=${keyword}` : ``
  }${
    feed ? `&feed=${user?._id}` : ``
  }${category ? `&category=${category}` : ``}${owner ? `&owner=${owner}` : ``}${
    seller ? `&seller=${seller}` : ``
  }${bids ? `&bids=${bids}` : ``}${saved ? `&saved=${saved}` : ``}${
    auctionEnded ? `&auctionEnded=${auctionEnded}` : ``
  }${
    pinId ? `&ne=${pinId}` : ``
  }${
    sort ? `&sort=${sort}` : ``
  }`;

  const fetchPins = () => {
    setLoading(!page);

    axios
      .get(link, {
        cancelToken: source.token,
      })
      .then((res) => {
        const { pins, resultPerPage, filteredPinsCount } = res.data;
        (page ? parseInt(page) === 1 : true) ? setPins(pins) : setPins((prev) => [...prev, ...pins]);
        setLoading(false);
        dispatch({
          type: HAS_MORE,
          payload: (page ? parseInt(page) : 1) * resultPerPage < filteredPinsCount,
        });
      })
      .catch((e) => {
        if (axios.isCancel(e)) {
        } else {
          setLoading(false);
          toast.error("Something went wrong!");
        }
      });
  };

  useEffect(() => {
    fetchPins();

    return () => source.cancel("Operation canceled by the user.");
  }, [router]);

  const ideaName = category || "new";
  if (loading && parseInt(page) === 1) {
    return <Spinner message={`We are adding ${ideaName} pins to your feed!`} />;
  }

  if (!loading && pins?.length === 0) {
    return (
      <div className="mt-10 text-center text-xl font-bold">No Pins Found!</div>
    );
  }

  return (
    <>
      <div className="">
        {pins?.length > 0 && <MasonryLayout pins={pins} />}
        {hasMore && <Spinner message={`We are adding more ${ideaName} pins to your feed!`} />}
      </div>
    </>
  );
};

export default Feed;
