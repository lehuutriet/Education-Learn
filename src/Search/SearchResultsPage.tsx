// SearchResultsPage.tsx
import { useState } from "react";
import { ArrowRight, Minus } from "lucide-react";
import { useNavigate, useSearchParams } from "react-router-dom";
import Navigation from "../Navigation/Navigation";

const SearchResultsPage = () => {
  const [searchParams] = useSearchParams();
  const [searchValue, setSearchValue] = useState(searchParams.get("q") || "");
  const navigate = useNavigate();

  const handleSearch = (e: any) => {
    e.preventDefault();
    if (searchValue.trim()) {
      navigate(`/search-results?q=${encodeURIComponent(searchValue)}`);
    }
  };

  const handleClear = () => {
    setSearchValue("");
  };

  return (
    <div className="min-h-screen bg-white">
      <Navigation />

      {/* Search Results Content */}
      <div className="max-w-4xl mx-auto px-6 py-12">
        <h1 className="text-4xl font-serif mb-12">Search Results</h1>

        {/* Search Section */}
        <div className="mb-12">
          <h2 className="text-2xl mb-4">Search</h2>
          <div className="relative">
            <input
              type="text"
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && handleSearch(e)}
              className="w-full border border-gray-300 rounded-lg px-4 py-3 pr-20"
              placeholder="Search..."
            />
            <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center space-x-2">
              {searchValue && (
                <>
                  <button
                    onClick={handleClear}
                    className="p-1 hover:bg-gray-100 rounded-full transition-colors"
                  >
                    <Minus className="w-4 h-4 text-gray-400" />
                  </button>
                  <ArrowRight className="w-4 h-4 text-gray-400" />
                </>
              )}
            </div>
          </div>
          <button
            onClick={handleSearch}
            className="mt-4 w-full py-2 text-center border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            SEARCH
          </button>
        </div>

        {/* Results Section */}
        <div>
          <h2 className="text-2xl mb-4">Results</h2>
          <p className="text-sm text-gray-600 mb-8">
            53 results (1 millisecond)
          </p>

          <div className="space-y-8">
            <div className="border-t pt-6">
              <h3 className="text-xl mb-2">
                <a
                  href="/community/events"
                  className="text-blue-600 hover:text-blue-800"
                >
                  Events
                </a>
              </h3>
              <a
                href="/community/events"
                className="text-green-700 text-sm hover:underline mb-2 block"
              >
                https://www.washingtonmarketschool.org/community/events
              </a>
              <p className="text-gray-600">Events</p>
            </div>

            <div className="border-t pt-6">
              <h3 className="text-xl mb-2">
                <a
                  href="/community/events/book-fair-2023"
                  className="text-blue-600 hover:text-blue-800"
                >
                  Book Fair 2023
                </a>
              </h3>
              <a
                href="/community/events/book-fair-2023"
                className="text-green-700 text-sm hover:underline mb-2 block"
              >
                https://www.washingtonmarketschool.org/community/events/book-fair-2023-blog
              </a>
              <p className="text-gray-600">Explore our Visiting Authors</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SearchResultsPage;
