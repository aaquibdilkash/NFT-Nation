import React from 'react';
import Masonry from 'react-masonry-css';
import { useSelector } from 'react-redux';
import Pin from './Pin';

const breakpointColumnsObj = {
  default: 4,
  3000: 6,
  2000: 4,
  1500: 3,
  1100: 2,
  600: 1,
};

const MasonryLayout = ({ pins }) => {

  const { moreLoading } = useSelector(
    (state) => state.userReducer
  );

  
  return (
    <Masonry className="flex animate-slide-fwd" breakpointCols={breakpointColumnsObj}>
      {pins?.map((pin, index) => {
        if(index + 1 === pins.length) {
          return <Pin key={pin._id} pin={pin} className="w-max" />
        } else {
          return <Pin key={pin._id} pin={pin} className="w-max" />
        }
      })}
      {moreLoading && (
            <Spinner message={`We are adding ${ideaName} ideas to your feed!`} />
          )}
    </Masonry>
  )
};

export default MasonryLayout;
