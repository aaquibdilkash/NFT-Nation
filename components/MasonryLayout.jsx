import React from "react";
import Masonry from "react-masonry-css";
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

  return (
    <>
      <Masonry
        className="flex animate-slide-fwd"
        breakpointCols={breakpointColumnsObj}
      >
        {pins?.map((pin, index) => {
          return <Pin key={index} pin={pin} className="w-max" />;
        })}
      </Masonry>
    </>
  );
};

export default MasonryLayout;
