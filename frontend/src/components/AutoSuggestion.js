import React, { useState, useEffect } from "react";
import Cookies from "react-cookies";
import airports from "../data/airports.json";

const AutoSuggestion = ({
  id,
  label,
  placeholder,
  value,
  onChange,
  recentSearchesKey,
}) => {
  const [suggestions, setSuggestions] = useState([]);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const [query, setQuery] = useState(value || "");
  const [recentSearches, setRecentSearches] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);

  // Load recent searches from cookies
  useEffect(() => {
    const storedSearches = Cookies.load(recentSearchesKey) || [];
    setRecentSearches(storedSearches);
  }, [recentSearchesKey]);

  const saveRecentSearch = (search) => {
    const updatedSearches = [...new Set([search, ...recentSearches])].slice(0, 5); // Limit to 5
    setRecentSearches(updatedSearches);
    Cookies.save(recentSearchesKey, updatedSearches, {
      path: "/",
      maxAge: 604800,
    });
  };

  useEffect(() => {
    if (query) {
      const matches = airports.filter(
        (airport) =>
          airport.name.toLowerCase().includes(query.toLowerCase()) ||
          airport.city.toLowerCase().includes(query.toLowerCase()) ||
          airport.code.toLowerCase().includes(query.toLowerCase())
      );
      setSuggestions(matches);
    } else {
      setSuggestions([]);
    }
  }, [query]);

  const handleSelect = (airport) => {
    const formattedValue = `${airport.city} (${airport.code})`;
    setQuery(formattedValue);
    onChange({ target: { id, value: formattedValue } }); 
    saveRecentSearch(formattedValue);
    setSuggestions([]);
    setShowDropdown(false);
  };

  const handleInputChange = (e) => {
    const { value } = e.target;
    setQuery(value);
    onChange(e);
    setShowDropdown(true);
  };

  // Filter recent searches to match the current query
  const filteredRecentSearches = recentSearches.filter((search) =>
    search.toLowerCase().includes(query.toLowerCase())
  );

  const handleKeyDown = (e) => {
    if (e.key === "ArrowDown") {
      setHighlightedIndex((prevIndex) =>
        prevIndex < suggestions.length - 1 ? prevIndex + 1 : prevIndex
      );
    } else if (e.key === "ArrowUp") {
      setHighlightedIndex((prevIndex) =>
        prevIndex > 0 ? prevIndex - 1 : prevIndex
      );
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (highlightedIndex >= 0 && suggestions.length > 0) {
        handleSelect(suggestions[highlightedIndex]);
      }
    }
  };

  const handleInputFocus = () => {
    setShowDropdown(true);
  };

  const handleBlur = () => {
    setTimeout(() => setShowDropdown(false), 200);
  };

  return (
    <div className="relative">
      <label htmlFor={id} className="block text-sm font-semibold mb-1">
        {label}
      </label>
      <input
        type="text"
        id={id}
        value={query}
        onChange={handleInputChange}
        onFocus={handleInputFocus}
        onBlur={handleBlur}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        className="w-full border rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
      {showDropdown && (
        <div className="absolute bg-white border rounded-lg mt-1 z-10 w-full max-h-40 overflow-y-auto">
          {/* Recent Searches */}
          {query === "" || filteredRecentSearches.length > 0 ? (
            <div>
              <div className="p-1 font-semibold bg-gray-100">Recent Searches</div>
              {filteredRecentSearches.map((search, index) => (
                <div
                  key={`recent-${index}`}
                  onClick={() => {
                    setQuery(search);
                    onChange({ target: { id, value: search } }); // Update parent form state
                    saveRecentSearch(search);
                    setSuggestions([]);
                    setShowDropdown(false);
                  }}
                  className="p-2 cursor-pointer hover:bg-green-100"
                >
                  {search}
                </div>
              ))}
            </div>
          ) : null}
          {/* Suggestions */}
          {suggestions.length > 0 && (
            <div>
              {suggestions.map((airport, index) => (
                <div
                  key={airport.code}
                  onClick={() => handleSelect(airport)}
                  className={`p-2 cursor-pointer hover:bg-blue-100 ${
                    index === highlightedIndex ? "bg-blue-200" : ""
                  }`}
                >
                  {airport.city} - {airport.name} ({airport.code})
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AutoSuggestion;
