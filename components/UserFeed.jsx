import React, { useState, useEffect } from "react";
import MasonryLayout from "./MasonryLayout";
import Spinner from "./Spinner";
import axios from "axios";
import { useSelector } from "react-redux";
import { CHANGE_PAGE, HAS_MORE } from "../redux/constants/UserTypes";
import { useDispatch } from "react-redux";
import { useRouter } from "next/router";
import { toast } from "react-toastify";

const UserFeed = ({setFollowingsLength}) => {
  const dispatch = useDispatch();
  const router = useRouter();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user, hasMore, moreLoading } = useSelector(
    (state) => state.userReducer
  );
  const CancelToken = axios.CancelToken;
  const source = CancelToken.source();

  const { query } = router;
  const { page, keyword, followers, followings, userId } = query;

  const link = `/api/users?${page ? `page=${page}` : `page=1`}${
    keyword ? `&keyword=${keyword}` : ``
  }${followers ? `&followers=${userId}` : ``}${
    followings ? `&followings=${userId}` : ``
  }`;

  const fetchUsers = () => {
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
    fetchUsers();

    return () => source.cancel("Operation canceled by the user.");
  }, [router]);

  //   const ideaName = category || "new";
  if (loading && (!page || page == 1)) {
    return <Spinner message={`We are fetching users to your feed!`} />;
  }

  if (!loading && user?.length === 0) {
    return (
      <div className="mt-10 text-center text-xl font-bold">No Users Found!</div>
    );
  }

  return (
    <>
      <div className="">
        {users?.length > 0 && <MasonryLayout setFollowingsLength={setFollowingsLength} comp={users} type="user" />}
        {hasMore && (
          <Spinner message={`We are fetching more users to your feed!`} />
        )}
      </div>
    </>
  );
};

export default UserFeed;
