import Link from "next/link";
import { IoMdAdd, IoMdSearch } from "react-icons/io";
import { useRouter } from "next/router";
import { useSelector } from "react-redux";
import { AiOutlineLogin } from "react-icons/ai";
import Image from "next/image";
import { feedPathArray, getImage } from "../utils/data";

const Navbar = ({ connectToMetamask }) => {
  const { user } = useSelector((state) => state.userReducer);
  const router = useRouter();
  const { pathname, query } = router;
  const { keyword, type, feed, page } = query;

  return (
    <div className="flex gap-2 md:gap-5 w-full mt-5 pb-7">
      <div className="flex justify-start items-center w-full px-2 rounded-md bg-secondTheme border-none outline-none shadow-lg hover:drop-shadow-lg focus-within:drop-shadow-lg">
        <IoMdSearch fontSize={25} className="ml-1 " />
        <input
          type="text"
          onChange={(e) => {
            router.push(
              {
                pathname: pathname,
                query: {
                  ...query,
                  keyword: e.target.value,
                },
              },
              undefined,
              { shallow: true }
            );
          }}
          placeholder="Search NFTs, Collections or Users..."
          value={keyword}
          onFocus={() => {
            !feedPathArray.includes(pathname) &&
              router.push(
                {
                  pathname: "/",
                  query: {
                    ...query,
                    keyword
                  },
                },
                undefined,
                { shallow: true }
              );
          }}
          className="text-sm font-bold p-2 w-full bg-secondTheme outline-none"
        />
        <div className="ms:flex hidden sm:block items-center px-0 rounded-lg space-x-4 mx-auto">
          <select
            readOnly
            value={type || "pins"}
            id="Com"
            className="text-sm font-bold text-gray-800 outline-none border-0 px-2 py-2 rounded-lg bg-transparent"
          >
            {[
              {
                name: "NFTs",
                value: "pins",
              },
              {
                name: "Collections",
                value: "collections",
              },
              {
                name: "Users",
                value: "users",
              },
            ].map((item, index) => {
              return (
                <option
                  key={index}
                  onClick={() => {
                    router.push(
                      {
                        pathname: "/",
                        query: {
                          // ...query,
                          // keyword,
                          ...(page ? { page: 1 } : {}),
                          ...(keyword ? { keyword } : {}),
                          ...(feed ? { feed } : {}),
                          type: item?.value,
                        },
                      },
                      undefined,
                      { shallow: true }
                    );
                  }}
                  value={item?.value}
                >
                  {item?.name}
                </option>
              );
            })}
          </select>
        </div>
      </div>
      <div className="flex gap-3 ">
        {user?._id && (
          <Link href={`/user-profile/${user?._id}`}>
            <div className="w-12 h-12 relative transition transition duration-500 ease transform hover:-translate-y-1 inline-block hidden md:block">
              <Image
                src={getImage(user?.image)}
                alt="user-pic"
                placeholder="blur"
                blurDataURL="/favicon.png"
                // height={100}
                // width={100}
                layout="fill"
                className="rounded-lg shadow-lg hover:drop-shadow-lg hover:cursor-pointer"
              />
            </div>
          </Link>
        )}
        {!user?._id && (
          <div
            onClick={connectToMetamask}
            className="bg-textColor text-secondTheme rounded-lg w-12 h-12 md:w-14 md:h-12 flex justify-center items-center shadow-lg hover:drop-shadow-lg hover:cursor-pointer"
          >
            <AiOutlineLogin color="themeColor" fontSize={21} />
          </div>
        )}
        <Link href="/create-pin">
          <div className="bg-textColor text-secondTheme rounded-lg w-12 h-12 md:w-14 md:h-12 flex justify-center items-center shadow-lg hover:drop-shadow-lg hover:cursor-pointer">
            <IoMdAdd className="" />
          </div>
        </Link>
      </div>
    </div>
  );
};

export default Navbar;
