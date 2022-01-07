import React from "react";
import Masonry from "react-masonry-css";
import { useSelector } from "react-redux";
import { Spinner } from ".";
import Pin from "./Pin";

const breakpointColumnsObj = {
  default: 4,
  3000: 6,
  2000: 4,
  1500: 3,
  1100: 2,
  600: 1,
};

const MasonryLayout = ({ pins }) => {
  const { moreLoading } = useSelector((state) => state.userReducer);

  return (
    <>
      <Masonry
        className="flex animate-slide-fwd"
        breakpointCols={breakpointColumnsObj}
      >
        {pins?.map((pin) => {
          return <Pin key={pin._id} pin={pin} className="w-max" />;
        })}
      </Masonry>
      {moreLoading && <Spinner message={`We are adding more to your feed...`} />}
    </>
  );
};

export default MasonryLayout;
