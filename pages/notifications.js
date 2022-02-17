import React, { useEffect, useState } from "react";
import axios from "axios";
import { useSelector } from "react-redux";
import {
  buttonStyle,
  fetcher,
  getImage,
  getNotificationDescription,
  getNotificationStatus,
  getUserName,
} from "../utils/data";
import Spinner from "../components/Spinner";
import {
  FaChevronDown,
  FaChevronRight,
  FaEye,
  FaEyeSlash,
} from "react-icons/fa";
import { AiOutlineDelete, AiOutlineLoading3Quarters } from "react-icons/ai";
import { useRouter } from "next/router";
import moment from "moment";
import useSWR from "swr";
import { toast } from "react-toastify";
import { loginMessage } from "../utils/messages";
import Link from "next/link";

const Notifications = () => {
  const router = useRouter();
  const { user } = useSelector((state) => state.userReducer);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [marking, setMarking] = useState("");
  const [markingAll, setMarkingAll] = useState(false);
  const [deleting, setDeleting] = useState("");
  const [deletingAll, setDeletingAll] = useState(false);
  const [opened, setOpened] = useState("");
  

  const { data,  error } = useSWR(() => user?._id ? `/api/notifications?to.user=${user?._id}` : null, fetcher, {
    refreshInterval: 15000,
    onSuccess: (data, key, config) => {
      setNotifications(data?.data)
    }
  })

  const markStatus = (id, status) => {
    if (!user?._id) {
      toast.info(loginMessage);
      return;
    }

    if (!notifications?.length) {
      return;
    }
    setMarking(id);
    axios
      .put(`/api/notifications/markStatus/${user?._id}/${id}`, {
        status,
      })
      .then((res) => {
        setMarking("");
        fetchNotifications();
      })
      .catch((e) => {
        setMarking("");
      });
  };

  const markDeleted = (id, status) => {
    if (!user?._id) {
      toast.info(loginMessage);
      return;
    }

    if (!notifications?.length) {
      return;
    }
    setDeleting(id);
    axios
      .delete(`/api/notifications/markStatus/${user?._id}/${id}`, {
        status,
      })
      .then((res) => {
        setDeleting("");
        fetchNotifications();
      })
      .catch((e) => {
        setDeleting("");
      });
  };

  const markAllStatus = (status) => {
    if (!user?._id) {
      toast.info(loginMessage);
      return;
    }

    if (!notifications?.length) {
      return;
    }
    setMarkingAll(status);
    axios
      .put(`/api/notifications/markAllStatus/${user?._id}`, {
        status,
      })
      .then((res) => {
        setMarkingAll("");
        fetchNotifications();
      })
      .catch((e) => {
        setMarkingAll("");
      });
  };

  const markAllDeleted = () => {
    if (!user?._id) {
      toast.info(loginMessage);
      return;
    }

    if (!notifications?.length) {
      return;
    }
    setDeletingAll(true);
    axios
      .delete(`/api/notifications/markAllStatus/${user?._id}`)
      .then((res) => {
        setDeletingAll(false);
        fetchNotifications();
      })
      .catch((e) => {
        setDeletingAll(false);
      });
  };

  const fetchNotifications = (loading = false) => {
    loading && setLoading(true);
    axios
      .get(`/api/notifications?to.user=${user?._id}`)
      .then((res) => {
        setLoading(false);
        const { data } = res.data;
        setNotifications(data);
        return data
      })
      .catch((e) => {
        setLoading(false);
      });
  };

  useEffect(() => {
    user?._id && fetchNotifications(true);
    // !user?._id && router.push("/");

    // return () => {
    //   markAllDeleted()
    // }
  }, [user]);

  return (
    <div>
      <div className="bg-gradient-to-r from-themeColor to-secondTheme rounded-lg overflow-x-auto">
        <h1 className="mt-8 title-font text-center sm:text-4xl text-3xl mb-4 font-bold text-gray-900">
          Notification Feed
        </h1>
        <p className="mb-0 text-center leading-relaxed flex-wrap font-bold">
          Let's see what you missed so far...
        </p>
        <div className="min-w-screen min-h-screen bg-gray-100 flex items-start justify-center bg-gray-100 font-sans overflow-hidden">
          <div className="w-full lg:mx-4">
            <div className="bg-[#ffffff] shadow-md rounded my-6 py-6 overflow-x-scroll">
              <table className="min-w-max w-full table-auto">
                <thead>
                  <tr className="bg-gray-200 text-gray-600 uppercase text-sm leading-normal">
                    {[
                      "Type",
                      "By",
                      "To",
                      "NFT",
                      "Collection",
                      "Amount",
                      "From Now",
                      "Status",
                    ].map((item, index) => {
                      return (
                        <th key={index} className="py-3 px-6 text-left">
                          {item}
                        </th>
                      );
                    })}
                    <th className="py-3 px-6 text-left">
                      <button
                        className="mt-1"
                        onClick={() => {
                          markAllStatus("read");
                        }}
                      >
                        <span className={`${buttonStyle}`}>
                          {markingAll === "read" ? (
                            <AiOutlineLoading3Quarters className="animate-spin mx-4" />
                          ) : (
                            `Read All`
                          )}
                        </span>
                      </button>
                      <button
                        className="mt-1"
                        onClick={() => {
                          markAllStatus("unread");
                        }}
                      >
                        <span className={`${buttonStyle}`}>
                          {markingAll === "unread" ? (
                            <AiOutlineLoading3Quarters className="animate-spin mx-4" />
                          ) : (
                            `Unread All`
                          )}
                        </span>
                      </button>
                    </th>
                    <th className="py-3 px-6 text-left">
                      <button
                        className="mt-1"
                        onClick={() => {
                          markAllDeleted();
                        }}
                      >
                        <span className={`${buttonStyle}`}>
                          {deletingAll ? (
                            <AiOutlineLoading3Quarters className="animate-spin mx-4" />
                          ) : (
                            `Delete All`
                          )}
                        </span>
                      </button>
                    </th>
                  </tr>
                </thead>
                <tbody className="text-sm font-bold">
                  {!loading &&
                    notifications?.length > 0 &&
                    notifications.map((item, index) => {
                      const {
                        _id,
                        type,
                        byUser,
                        toUser,
                        pin,
                        price,
                        pinCollection,
                        to,
                        createdAt,
                      } = item;
                      return (
                        <React.Fragment key={index}>
                          <tr
                            key={index}
                            className="border-b border-gray-200 hover:bg-[#f4f4f4]"
                          >
                            <td className="py-3 px-6 text-left whitespace-nowrap">
                              <div className="flex items-center">
                                <span className="font-medium">{type}</span>
                              </div>
                            </td>
                            <td className="py-3 px-6 text-left">
                              <div className="flex items-center cursor-pointer">
                                {byUser ? (
                                  <Link
                                  href={`/users/${byUser?.userName}`}
                                   >
                                    <div>
                                      <div className="mr-2">
                                        <img
                                          className="w-6 h-6 rounded-full"
                                          src={getImage(byUser?.image)}
                                        />
                                      </div>
                                      <span>
                                        {getUserName(byUser?.userName)}
                                      </span>
                                    </div>
                                  </Link>
                                ) : (
                                  <>
                                    <div className="mr-2"></div>
                                    <span>{`- - -`}</span>
                                  </>
                                )}
                              </div>
                            </td>
                            <td className="py-3 px-6 text-left">
                              <div className="flex items-center cursor-pointer">
                                {toUser ? (
                                  <Link
                                  href={`/users/${toUser?.userName}`}
                                   >
                                  <div
                                   >
                                    <div className="mr-2">
                                      <img
                                        className="w-6 h-6 rounded-full"
                                        src={getImage(toUser?.image)}
                                      />
                                    </div>
                                    <span>{getUserName(toUser?.userName)}</span>
                                  </div>
                                  </Link>
                                ) : (
                                  <>
                                    <div className="mr-2"></div>
                                    <span>{`- - -`}</span>
                                  </>
                                )}
                              </div>
                            </td>
                            <td className="py-3 px-6 text-left">
                              <div className="flex items-center cursor-pointer">
                                {pin ? (
                                  <Link 
                                  href={`/pins/${pin?._id}`}
                                  >
                                    <div>
                                      <div className="mr-2">
                                        <img
                                          className="w-6 h-6 rounded-full"
                                          src={getImage(pin?.image)}
                                        />
                                      </div>
                                      <span>{pin?.title}</span>
                                    </div>
                                  </Link>
                                ) : (
                                  <>
                                    <div className="mr-2"></div>
                                    <span>{`- - -`}</span>
                                  </>
                                )}
                              </div>
                            </td>
                            <td className="py-3 px-6 text-left">
                              <div className="flex items-center cursor-pointer">
                                {pinCollection ? (
                                  <Link
                                    href={`/collections/${pinCollection?._id}`}
                                  >
                                    <div>
                                      <div className="mr-2">
                                        <img
                                          className="w-6 h-6 rounded-full"
                                          src={getImage(pinCollection?.image)}
                                        />
                                      </div>
                                      <span>{pinCollection?.title}</span>
                                    </div>
                                  </Link>
                                ) : (
                                  <>
                                    <div className="mr-2"></div>
                                    <span>{`- - -`}</span>
                                  </>
                                )}
                              </div>
                            </td>

                            <td className="py-3 px-6 text-center">
                              <span className="bg-themeColor text-[#ffffff] py-1 px-3 rounded-full text-xs">
                                {price ?? "- - -"}
                              </span>
                            </td>

                            <td className="py-3 px-6 text-center">
                              <span className="bg-themeColor text-[#ffffff] py-1 px-3 rounded-full text-xs">
                                {moment(createdAt).fromNow()}
                              </span>
                            </td>

                            <td className="py-3 px-6 text-center">
                              <span className="bg-themeColor text-[#ffffff] py-1 px-3 rounded-full text-xs">
                                {getNotificationStatus(to, user?._id)?.status}
                              </span>
                            </td>
                            <td className="py-3 px-6 text-center">
                              <div className="flex item-center justify-center">
                                <div className="w-4 mr-2 transform hover:text-purple-500 hover:scale-110">
                                  {marking === _id || markingAll ? (
                                    <AiOutlineLoading3Quarters className="animate-spin" />
                                  ) : getNotificationStatus(to, user?._id)
                                      ?.status === "read" ? (
                                    <FaEye
                                      onClick={() => {
                                        markStatus(_id, "unread");
                                      }}
                                      className="cursor-pointer"
                                      size={25}
                                    />
                                  ) : (
                                    <FaEyeSlash
                                      onClick={() => {
                                        markStatus(_id, "read");
                                      }}
                                      className="cursor-pointer"
                                      size={25}
                                    />
                                  )}
                                </div>
                              </div>
                            </td>
                            <td className="py-3 px-6 text-center">
                              <div className="flex item-center justify-evenly">
                                <div className="w-4 transform hover:text-purple-500 hover:scale-110">
                                  {deleting === _id || deletingAll ? (
                                    <AiOutlineLoading3Quarters className="animate-spin mt-1.5" />
                                  ) : (
                                    <AiOutlineDelete
                                      onClick={() => {
                                        markDeleted(_id);
                                      }}
                                      className="cursor-pointer"
                                      size={25}
                                    />
                                  )}
                                </div>
                                <div className="w-4 transform hover:text-purple-500 hover:scale-110">
                                  {opened !== _id ? (
                                    <FaChevronRight
                                      onClick={() => {
                                        setOpened(_id);
                                      }}
                                      className="cursor-pointer mt-1.5"
                                    />
                                  ) : (
                                    <FaChevronDown
                                      onClick={() => {
                                        setOpened("");
                                      }}
                                      className="cursor-pointer mt-2"
                                    />
                                  )}
                                </div>
                              </div>
                            </td>
                          </tr>
                          {opened === _id && (
                            <tr
                              key={`${index}${index}`}
                              className="border-b border-gray-200 hover:bg-[#f4f4f4]"
                            >
                              <td align="center" colspan="10">
                                {getNotificationDescription(item)}
                              </td>
                            </tr>
                          )}
                        </React.Fragment>
                      );
                    })}
                </tbody>
              </table>

              {loading && (
                <Spinner message={`We Are Fetching Notifications For You...`} />
              )}
              {!loading && !notifications?.length && (
                <div className="mt-10 text-center text-xl font-bold">
                  {`No Notifications For You!`}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Notifications;
