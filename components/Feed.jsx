import { useState, useEffect } from "react";
import MasonryLayout from "./MasonryLayout";
import Spinner from "./Spinner";
import axios from "axios";
import { useSelector } from "react-redux";
import { CHANGE_PAGE, HAS_MORE } from "../redux/constants/UserTypes";
import { useDispatch } from "react-redux";
import { useRouter } from "next/router";
import { toast } from "react-toastify";

const Feed = () => {
  const dispatch = useDispatch();
  const router = useRouter();
  const [pins, setPins] = useState([]);
  const [collections, setCollections] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user, currentProfile, hasMore, refresh } = useSelector((state) => state.userReducer);
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
  }${(feed && user?._id) ? `&feed=${user?._id}` : ``}${
    category ? `&category=${category}` : ``
  }${owner ? `&owner=${owner}` : ``}${seller ? `&seller=${seller}` : ``}${
    bids ? `&bids=${userId}` : ``
  }${commented ? `&commented=${userId}` : ``}${
    saved ? `&saved=${userId}` : ``
  }${auctionEnded ? `&auctionEnded=${auctionEnded}` : ``}${
    pinId ? `&ne=${pinId}` : ``
  }${collection ? `&collection=${collectionId}` : ``}${
    postedBy ? `&postedBy=${user?._id}` : ``
  }${
    createdBy ? `&createdBy=${userId ?? user?._id}` : ``
  }${sort ? `&sort=${sort}` : ``}`;

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

  const fetchPins = () => {
    setCollections([])
    setUsers([])
    setLoading(!page || page == 1);
    dispatch({
      type: CHANGE_PAGE,
      payload: false,
    });

    axios
      .get(pinLink, {
        cancelToken: source.token,
      })
      .then((res) => {
        const { pins, resultPerPage, filteredPinsCount } = res.data;
        (page ? parseInt(page) === 1 : true)
          ? setPins(pins)
          : setPins((prev) => [...prev, ...pins]);
        setLoading(false);
        dispatch({
          type: HAS_MORE,
          payload:
            (page ? parseInt(page) : 1) * resultPerPage < filteredPinsCount,
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
          toast.error("Something went wrong!");
        }
      });
  };

  const fetchCollections = () => {
    setPins([])
    setUsers([])
    setLoading(!page || page == 1);
    dispatch({
      type: CHANGE_PAGE,
      payload: false,
    });

    axios
      .get(collectionLink, {
        cancelToken: source.token,
      })
      .then((res) => {
        const { collections, resultPerPage, filteredCollectionsCount } =
          res.data;
        (page ? parseInt(page) === 1 : true)
          ? setCollections(collections)
          : setCollections((prev) => [...prev, ...collections]);
        setLoading(false);
        dispatch({
          type: HAS_MORE,
          payload:
            (page ? parseInt(page) : 1) * resultPerPage <
            filteredCollectionsCount,
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
          toast.error("Something went wrong!");
        }
      });
  };

  const fetchUsers = () => {
    setPins([])
    setCollections([])
    setLoading(!page || page == 1);
    dispatch({
      type: CHANGE_PAGE,
      payload: false,
    });

    axios
      .get(userLink, {
        cancelToken: source.token,
      })
      .then((res) => {
        const { users, resultPerPage, filteredUsersCount } = res.data;
        (page ? parseInt(page) === 1 : true)
          ? setUsers(users)
          : setUsers((prev) => [...prev, ...users]);
        setLoading(false);
        dispatch({
          type: HAS_MORE,
          payload:
            (page ? parseInt(page) : 1) * resultPerPage < filteredUsersCount,
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
          toast.error("Something went wrong!");
        }
      });
  };

  useEffect(() => {
    if (!type || type === "pins") {
      fetchPins();
    } else if (type === "collections") {
      fetchCollections();
    } else if (type === "users") {
      fetchUsers();
    }

    return () => source.cancel("Operation canceled by the user.");
  }, [router, refresh, currentProfile]);

  // useEffect(() => {

  // }, [user])

  const ideaName = category || "new";

  const showType = type || "pins";
  if (loading && (!page || page == 1)) {
    return (
      <Spinner message={`We are adding ${ideaName} ${showType} to your feed!`} />
    );
  }

  if (!loading && (!pins.length && !collections.length && !users.length)) {
    return (
      <>
        {(!type || type === "pins") && pins.length === 0 && (
          <div className="mt-10 text-center text-xl font-bold">
            No Pins Found!
          </div>
        )}
        {type === "collections" && collections.length === 0 && (
          <div className="mt-10 text-center text-xl font-bold">
            No Collections Found!
          </div>
        )}
        {type === "users" && users.length === 0 && (
          <div className="mt-10 text-center text-xl font-bold">
            No Users Found!
          </div>
        )}
      </>
    );
  }

  return (
    <>
      <div className="">
        {(!type || type === "pins") && pins?.length > 0 && (
          <MasonryLayout comp={pins} type="pins" />
        )}
        {type === "collections" && collections?.length > 0 && (
          <MasonryLayout comp={collections} type="collections" />
        )}
        {type === "users" && users?.length > 0 && (
          <MasonryLayout comp={users} type="users" />
        )}
        {hasMore && (
          <Spinner
            message={`We are adding more ${ideaName} ${showType} to your feed!`}
          />
        )}
      </div>
    </>
  );
};

export default Feed;
