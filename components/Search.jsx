import React, { useEffect, useState } from 'react';
import MasonryLayout from './MasonryLayout';
import Spinner from './Spinner';
import { useDispatch } from 'react-redux';
import { useSelector } from 'react-redux';
import { feedPinsGet, searchPinsGet } from '../redux/actions/pinActions';

const Search = ({ searchTerm }) => {
  const [pins, setPins] = useState();
  const [loading, setLoading] = useState(false);
  const dispatch = useDispatch()
  const {searchedPins} = useSelector(state => state.pinReducer)

  useEffect(() => {
    if (searchTerm !== '') {
      setLoading(true);
      dispatch(searchPinsGet(searchTerm, (data) => {
        setPins(data)
        setLoading(false);
      }, (e) => {
        setLoading(false);
      }))
    } else {
      dispatch(feedPinsGet((data) => {
        setPins(data)
        setLoading(false);
      }, (e) => {
        setLoading(false);
      }))
    }
  }, [searchTerm]);

  return (
    <div>

      {loading && <Spinner message="Searching pins" />}
      {pins?.length !== 0 && <MasonryLayout pins={pins} />}
      {pins?.length === 0 && searchTerm !== '' && !loading && (
        <div className="mt-10 text-center text-xl ">No Pins Found!</div>
      )}
    </div>
  );
};

export default Search;
