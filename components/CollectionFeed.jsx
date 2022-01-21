import React, { useState, useEffect } from "react";
import MasonryLayout from "./MasonryLayout";
import Spinner from "./Spinner";
import axios from "axios";
import { useSelector } from "react-redux";
import { CHANGE_PAGE, HAS_MORE } from "../redux/constants/UserTypes";
import { useDispatch } from "react-redux";
import { useRouter } from "next/router";
import { toast } from "react-toastify";

const CollectionFeed = () => {
  const dispatch = useDispatch();
  const router = useRouter();
  const [collections, setCollections] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user, hasMore } = useSelector((state) => state.userReducer);
  const CancelToken = axios.CancelToken;
  const source = CancelToken.source();

  const { query } = router;
  const { page, keyword, category, saved, commented, sort, createdBy } = query;

  const link = `/api/collections?${page ? `page=${page}` : `page=1`}${
    keyword ? `&keyword=${keyword}` : ``
  }${category ? `&category=${category}` : ``}${
    commented ? `&commented=${commented}` : ``
  }${saved ? `&saved=${saved}` : ``}${
    createdBy ? `&createdBy=${createdBy}` : ``
  }${sort ? `&sort=${sort}` : ``}`;

  const fetchCollections = () => {
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

  useEffect(() => {
    fetchCollections();

    return () => source.cancel("Operation canceled by the user.");
  }, [router]);

  const ideaName = category || "new";
  if (loading && (!page || page == 1)) {
    return (
      <Spinner
        message={`We are adding ${ideaName} collections to your feed!`}
      />
    );
  }

  if (!loading && collections?.length === 0) {
    return (
      <div className="mt-10 text-center text-xl font-bold">
        No Collections Found!
      </div>
    );
  }

  return (
    <>
      <div className="">
        {collections?.length > 0 && (
          <MasonryLayout comp={collections} type="collection" />
        )}
        {hasMore && (
          <Spinner
            message={`We are adding more ${ideaName} collections to your feed!`}
          />
        )}
      </div>
    </>
  );
};

export default CollectionFeed;
