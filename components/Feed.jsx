import { useState, useEffect } from "react";
import MasonryLayout from "./MasonryLayout";
import Spinner from "./Spinner";
import axios from "axios";
import { useSelector } from "react-redux";
import { CHANGE_PAGE, HAS_MORE } from "../redux/constants/UserTypes";
import { useDispatch } from "react-redux";
import { useRouter } from "next/router";
import { fetchingLoadingMessage } from "../utils/messages";
import { toTitleCase } from "../utils/data";

const Feed = ({data = []}) => {
  const dispatch = useDispatch();
  const router = useRouter();
  const [dataArray, setDataArray] = useState([]);
  const [loading, setLoading] = useState(false);
  const { user, currentProfile, hasMore, refresh, navigating } = useSelector(
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
    onSale,
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
    referred
  } = query;


  const pinLink = `/api/pins?${page ? `page=${page}` : `page=1`}${
    keyword ? `&keyword=${keyword}` : ``
  }${feed && user?._id ? `&feed=${user?._id}` : ``}${
    category ? `&category=${category}` : ``
  }${onSale ? `&onSale=${userId}` : ``}${
    bids ? `&bids.user=${userId}` : ``
  }${commented ? `&comments.user=${userId}` : ``}${
    saved ? `&saved=${userId}` : ``
  }${auctionEnded ? `&auctionEnded=${auctionEnded}` : ``}${
    pinId ? `&ne=${pinId}` : ``
  }${collection ? `&pinCollection=${collectionId}` : ``}${
    postedBy ? `&postedBy=${userId ?? user?._id}` : ``
  }${createdBy ? `&createdBy=${userId ?? user?._id}` : ``}${
    sort ? `&sort=${sort}` : ``
  }`;

  const collectionLink = `/api/collections?${page ? `page=${page}` : `page=1`}${
    keyword ? `&keyword=${keyword}` : ``
  }${feed && user?._id ? `&feed=${user?._id}` : ``}${category ? `&category=${category}` : ``}${
    commented ? `&comments.user=${userId}` : ``
  }${saved ? `&saved=${userId}` : ``}${
    createdBy ? `&createdBy=${userId}` : ``
  }${sort ? `&sort=${sort}` : ``}`;

  const userLink = `/api/users?${page ? `page=${page}` : `page=1`}${
    keyword ? `&keyword=${keyword}` : ``
  }${feed && user?._id ? `&feed=${user?._id}` : ``}${followers ? `&followings=${userId}` : ``}${referred ? `&referred.user=${userId}` : ``}${
    followings ? `&followers=${userId}` : ``
  }${sort ? `&sort=${sort}` : ``}`;

  const link =
    type === "collections"
      ? collectionLink
      : type === "users"
      ? userLink
      : pinLink;

  const fetchData = () => {
    setLoading(!page || page == 1 || !dataArray.length);
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
        (!page || parseInt(page) == 1) ? setDataArray(data) : setDataArray((prev) => [...prev, ...data]);
        setLoading(false);
        dispatch({
          type: HAS_MORE,
          payload: (page ? parseInt(page) : 1) * resultPerPage < filteredDataCount,
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
          // toast.error(errorMessage);
          console.log(e)
        }
      });
  };

  useEffect(() => {
    fetchData()

    return () => source.cancel("Operation Cancelled By The User!");
  }, [router, refresh, currentProfile]);

  useEffect(() => {
    !user?._id && feed && router.push({
      pathname: "/",
      query: {},
    }, undefined, {
      shallow: true
    })
  }, [user])

  if (navigating) {
    return (
      <Spinner
        message={fetchingLoadingMessage}
      />
    );
  }
  
  const showCategory = category?.length ? category : "new"
  const showType = type?.length ? type : "pins"


  if (loading) {
    return (
      <Spinner
        message={`We Are Fetching ${toTitleCase(showCategory)} ${toTitleCase(showType)} For Your Feed...`}
      />
    );
  }

  if (!loading && !dataArray?.length) {
    return (
      <>
        {dataArray.length === 0 && (
          <div className="mt-10 text-center text-xl font-bold">
            {`No ${toTitleCase(showCategory)} ${toTitleCase(showType)} Found!`}
          </div>
        )}
      </>
    );
  }

  return (
    <>
      <div className="">
          <MasonryLayout comp={dataArray} type={showType} />
        {hasMore && (
          <Spinner
            message={`We are Adding More ${toTitleCase(showCategory)} ${toTitleCase(showType)} To Your Feed...`}
          />
        )}
      </div>
    </>
  );
};

export default Feed;
