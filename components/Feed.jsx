import { useState, useEffect } from "react";
import MasonryLayout from "./MasonryLayout";
import Spinner from "./Spinner";
import axios from "axios";
import { useSelector } from "react-redux";
import { CHANGE_PAGE, HAS_MORE } from "../redux/constants/UserTypes";
import { useDispatch } from "react-redux";
import { useRouter } from "next/router";
import { toast } from "react-toastify";
import { errorMessage } from "../utils/messages";

const Feed = (props) => {
  // const { data, filteredDataCount, resultPerPage } = props.data;
  const dispatch = useDispatch();
  const router = useRouter();
  const [dataArray, setDataArray] = useState([]);
  const [loading, setLoading] = useState(false);
  const { user, currentProfile, hasMore, refresh } = useSelector(
    (state) => state.userReducer
  );
  const CancelToken = axios.CancelToken;
  const source = CancelToken.source();

  const { query } = router;
  const {
    type,
    page,
    keyword,
    category,
    owner,
    seller,
    bids,
    saved,
    auctionEnded,
    feed,
    pinId,
    userId,
    followers,
    followings,
    collection,
    collectionId,
    createdBy,
    sort,
    commented,
    postedBy,
  } = query;


  const pinLink = `/api/pins?${page ? `page=${page}` : `page=1`}${
    keyword ? `&keyword=${keyword}` : ``
  }${feed && user?._id ? `&feed=${user?._id}` : ``}${
    category ? `&category=${category}` : ``
  }${owner ? `&owner=${owner}` : ``}${seller ? `&seller=${seller}` : ``}${
    bids ? `&bids=${userId}` : ``
  }${commented ? `&commented=${userId}` : ``}${
    saved ? `&saved=${userId}` : ``
  }${auctionEnded ? `&auctionEnded=${auctionEnded}` : ``}${
    pinId ? `&ne=${pinId}` : ``
  }${collection ? `&collection=${collectionId}` : ``}${
    postedBy ? `&postedBy=${userId ?? user?._id}` : ``
  }${createdBy ? `&createdBy=${userId ?? user?._id}` : ``}${
    sort ? `&sort=${sort}` : ``
  }`;

  const collectionLink = `/api/collections?${page ? `page=${page}` : `page=1`}${
    keyword ? `&keyword=${keyword}` : ``
  }${category ? `&category=${category}` : ``}${
    commented ? `&commented=${userId}` : ``
  }${saved ? `&saved=${userId}` : ``}${
    createdBy ? `&createdBy=${userId}` : ``
  }${sort ? `&sort=${sort}` : ``}`;

  const userLink = `/api/users?${page ? `page=${page}` : `page=1`}${
    keyword ? `&keyword=${keyword}` : ``
  }${followers ? `&followers=${userId}` : ``}${
    followings ? `&followings=${userId}` : ``
  }${sort ? `&sort=${sort}` : ``}`;

  const link =
    type === "collections"
      ? collectionLink
      : type === "users"
      ? userLink
      : pinLink;

  const fetchData = () => {
    setLoading(!page || page == 1);
    dispatch({
      type: CHANGE_PAGE,
      payload: false,
    });

    axios
      .get(link, {
        cancelToken: source.token,
      })
      .then((res) => {
        const { data, resultPerPage, filteredDataCount } = res.data;
        (page ? parseInt(page) === 1 : true)
          ? setDataArray(data)
          : setDataArray((prev) => [...prev, ...data]);
        setLoading(false);
        dispatch({
          type: HAS_MORE,
          payload:
            (page ? parseInt(page) : 1) * resultPerPage < filteredDataCount,
        });
        dispatch({
          type: CHANGE_PAGE,
          payload: true,
        });
      })
      .catch((e) => {
        if (axios.isCancel(e)) {
        } else {
          setLoading(false);
          toast.error(errorMessage);
        }
      });
  };

  useEffect(() => {
    fetchData()

    return () => source.cancel("Operation Cancelled By The User!");
  }, [router, refresh, currentProfile]);

  // useEffect(() => {
  //   (page ? parseInt(page) === 1 : true)
  //     ? setDataArray(data)
  //     : setDataArray((prev) => [...prev, ...data]);
  //   setLoading(false);
  //   dispatch({
  //     type: HAS_MORE,
  //     payload: (page ? parseInt(page) : 1) * resultPerPage < filteredDataCount,
  //   });
  //   dispatch({
  //     type: CHANGE_PAGE,
  //     payload: true,
  //   });

  // }, [router, refresh, currentProfile]);

  if (loading && (!page || page == 1)) {
    return (
      <Spinner
        message={`We are adding ${category ?? "new"} ${
          type ?? "pins"
        } to your feed...`}
      />
    );
  }

  if (!loading && !dataArray?.length) {
    return (
      <>
        {dataArray.length === 0 && (
          <div className="mt-10 text-center text-xl font-bold">
            {`No ${type ?? "pins"} Found!`}
          </div>
        )}
      </>
    );
  }

  return (
    <>
      <div className="">
        {dataArray?.length > 0 && (
          <MasonryLayout comp={dataArray} type={type ?? "pins"} />
        )}
        {hasMore && (
          <Spinner
            message={`We are adding more ${category ?? "new"} ${
              type ?? "pins"
            } to your feed...`}
          />
        )}
      </div>
    </>
  );
};

export default Feed;
