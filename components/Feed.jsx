import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useDispatch } from 'react-redux';
import { feedPinsGet, searchPinsGet } from '../redux/actions/pinActions';
import MasonryLayout from './MasonryLayout';
import Spinner from './Spinner';

const Feed = ({categoryId}) => {
  const [pins, setPins] = useState();
  const [loading, setLoading] = useState(false);
  const dispatch = useDispatch()
  const {feedPins, searchedPins} = useSelector(state => state.pinReducer)

  useEffect(() => {
    if (categoryId) {
      setLoading(true);
      dispatch(searchPinsGet(categoryId, (data) => {
        setPins(data)
        setLoading(false);
      }, (e) => {
        setLoading(false);
      }))
    } else {
      setLoading(true);

      dispatch(feedPinsGet((data) => {
        setPins(data)
        setLoading(false);
      }, (e) => {
        setLoading(false);
      }))
    }
  }, [categoryId]);

  useEffect(() => {
    setPins(feedPins)
  }, [feedPins])

  const ideaName = categoryId || 'new';
  if (loading) {
    return (
      <Spinner message={`We are adding ${ideaName} ideas to your feed!`} />
    );
  }

  if (!loading && pins?.length < 1) {
    return (
      <div className="mt-10 text-center text-xl ">No Pins Found!</div>
      );
  }

  
  return (
    <div>
      {pins && (
        <MasonryLayout pins={pins} />
      )}
    </div>
  );
};

export default Feed;
