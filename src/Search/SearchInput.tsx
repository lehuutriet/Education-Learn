// SearchInput.tsx
import { useState } from "react";
import { Search, ArrowRight, Minus } from "lucide-react";
import { useNavigate } from "react-router-dom";

const SearchInput = () => {
  const [searchValue, setSearchValue] = useState("");
  const navigate = useNavigate();

  const addToSearchHistory = (query: string) => {
    const history = localStorage.getItem("searchHistory");
    let searches = history ? JSON.parse(history) : [];

    // Remove duplicate if exists
    searches = searches.filter((item: string) => item !== query);

    // Add new search to the beginning
    searches.unshift(query);

    // Keep only the last 10 searches
    searches = searches.slice(0, 10);

    localStorage.setItem("searchHistory", JSON.stringify(searches));
  };

  const handleSearch = (e?: React.FormEvent) => {
    if (e) {
      e.preventDefault();
    }
    if (searchValue.trim()) {
      addToSearchHistory(searchValue.trim());
      navigate(`/search-results?q=${encodeURIComponent(searchValue)}`);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  const handleClear = () => {
    setSearchValue("");
  };

  return (
    <div className="relative w-full max-w-2xl mx-auto mb-16">
      <input
        type="text"
        value={searchValue}
        onChange={(e) => setSearchValue(e.target.value)}
        onKeyPress={handleKeyPress}
        className="w-full py-3 pr-24 pl-0 border-b border-gray-300 text-lg placeholder-gray-900 focus:outline-none focus:border-gray-400 font-medium bg-transparent"
        placeholder="Search..."
        autoFocus
      />

      <div className="absolute right-0 top-1/2 -translate-y-1/2 flex items-center space-x-3">
        {searchValue && (
          <>
            <button
              onClick={handleClear}
              className="p-1 hover:bg-gray-100 rounded-full transition-colors"
            >
              <Minus className="w-4 h-4 text-gray-400" />
            </button>
            <button onClick={() => handleSearch()}>
              <ArrowRight className="w-5 h-5 text-gray-400" />
            </button>
          </>
        )}
        {!searchValue && (
          <>
            <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center mr-2">
              <span className="text-xs text-gray-500">⌥</span>
            </div>
            <Search className="w-5 h-5 text-gray-400" />
          </>
        )}
      </div>
    </div>
  );
};

export default SearchInput;
