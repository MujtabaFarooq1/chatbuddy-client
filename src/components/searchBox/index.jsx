import { Button, Input } from "antd";
import React, { useEffect, useState } from "react";
import "./searchbox.css";

function SearchBox({
  searchButtonTitle = "Search",
  searchFunction = (txt) => {
    console.log("Nor Search Functionality found! Text To Search is -->", txt);
  },
}) {
  const [searchText, setSearchText] = useState("");
  const handleSearch = () => {
    if (!searchText || searchText.trim().length < 3) {
      searchFunction("");
      return console.log(
        "Kindly enter at least 3 charackters to search , thankyou"
      );
    }
    searchFunction(searchText);
  };

  useEffect(() => {
    console.log("search text is -->", searchText);
    handleSearch();
  }, [searchText]);

  return (
    <>
      <div className="searchBoxWrapper">
        <Input
          className="searchBoxInput"
          type="text"
          value={searchText}
          placeholder="Search Here"
          onChange={(e) => {
            setSearchText(e.target.value);
          }}
        />
        <Button
          type="primary"
          className="searchBoxButton"
          onClick={handleSearch}
        >
          {searchButtonTitle}
        </Button>
      </div>
    </>
  );
}

export default SearchBox;
