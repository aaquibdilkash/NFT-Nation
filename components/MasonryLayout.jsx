import React from "react";
import Masonry from "react-masonry-css";
import Collection from "./Collection";
import Pin from "./Pin";
import User from "./User";

const breakpointColumnsObj = {
  default: 4,
  3000: 6,
  2000: 4,
  1500: 3,
  1100: 2,
  600: 1,
};

const MasonryLayout = ({ comp, type="pin", setFollowingsLength= () => {} }) => {

  return (
    <>
      <Masonry
        className="flex animate-slide-fwd"
        breakpointCols={breakpointColumnsObj}
      >
        {type === "pin" && comp?.map((pin, index) => {
          return <Pin key={index} pin={pin} className="w-max" />;
        })}
        {type === "user" && comp?.map((user, index) => {
          return <User setFollowingsLength={setFollowingsLength} key={index} userProfile={user} className="w-max" />;
        })}
        {type === "collection" && comp?.map((collection, index) => {
          return <Collection key={index} collection={collection} className="w-max" />;
        })}
      </Masonry>
    </>
  );
};

export default MasonryLayout;
