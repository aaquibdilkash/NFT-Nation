import { useState } from "react";
import { Search } from "../components";
import HomeLayout from "../Layout/HomeLayout";

const SearchPage = () => {
  const [searchTerm, setSearchTerm] = useState("");
  return (
    <HomeLayout searchTerm={searchTerm} setSearchTerm={setSearchTerm}>
      <Search searchTerm={searchTerm} setSearchTerm={setSearchTerm} />
    </HomeLayout>
  );
};

export default SearchPage;
