import { useRouter } from "next/router";
import React, { useEffect } from "react";
import { Feed } from "../../components";

const Refferals = () => {
  const router = useRouter();
  const { query, pathname } = router;
  // const {type} = query

  useEffect(() => {
    router.push(
      {
        pathname: pathname,
        query: {
          type: "users",
        },
      },
      undefined,
      { shallow: true }
    );
  }, []);
  return (
    <div>
      <Feed />
    </div>
  );
};

export default Refferals
