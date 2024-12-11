// SearchResultsPage.tsx
import { useState, useEffect } from "react";
import { ArrowRight, Minus, Search } from "lucide-react";
import { useNavigate, useSearchParams } from "react-router-dom";
import Navigation from "../Navigation/Navigation";

interface SearchResult {
  title: string;
  url: string;
  description: string;
}

const SearchResultsPage = () => {
  const [searchParams] = useSearchParams();
  const [searchValue, setSearchValue] = useState(searchParams.get("q") || "");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Perform search when query parameter changes
    if (searchParams.get("q")) {
      performSearch(searchParams.get("q") || "");
    }
  }, [searchParams]);

  const performSearch = async (query: string) => {
    setIsSearching(true);
    setHasSearched(true);

    try {
      // Simulating search delay
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Here you would normally make an API call to your search backend
      // For now, we'll just simulate empty results
      setResults([]);

      // Add to search history
      addToSearchHistory(query);
    } catch (error) {
      console.error("Search error:", error);
    } finally {
      setIsSearching(false);
    }
  };

  const addToSearchHistory = (query: string) => {
    const history = localStorage.getItem("searchHistory");
    let searches = history ? JSON.parse(history) : [];

    searches = searches.filter((item: string) => item !== query);
    searches.unshift(query);
    searches = searches.slice(0, 10);

    localStorage.setItem("searchHistory", JSON.stringify(searches));
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchValue.trim()) {
      navigate(`/search-results?q=${encodeURIComponent(searchValue.trim())}`);
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
          <form onSubmit={handleSearch}>
            <div className="relative">
              <input
                type="text"
                value={searchValue}
                onChange={(e) => setSearchValue(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-4 py-3 pr-20"
                placeholder="Search..."
              />
              <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center space-x-2">
                {searchValue && (
                  <>
                    <button
                      type="button"
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
              type="submit"
              className="mt-4 w-full py-2 text-center border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              SEARCH
            </button>
          </form>
        </div>

        {/* Results Section */}
        <div>
          <h2 className="text-2xl mb-4">Results</h2>

          {/* Loading State */}
          {isSearching && (
            <div className="flex flex-col items-center justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
              <p className="mt-4 text-gray-600">Searching...</p>
            </div>
          )}

          {/* No Results State */}
          {!isSearching && hasSearched && results.length === 0 && (
            <div className="text-center py-12 px-4">
              <Search className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No results found
              </h3>
              <p className="text-gray-600">
                We couldn't find any matches for "{searchParams.get("q")}"
              </p>
              <p className="text-gray-500 text-sm mt-2">
                Try checking your spelling or using different keywords
              </p>
            </div>
          )}

          {/* Results List */}
          {!isSearching && results.length > 0 && (
            <>
              <p className="text-sm text-gray-600 mb-8">
                {results.length} results found
              </p>
              <div className="space-y-8">
                {results.map((result, index) => (
                  <div key={index} className="border-t pt-6">
                    <h3 className="text-xl mb-2">
                      <a
                        href={result.url}
                        className="text-blue-600 hover:text-blue-800"
                      >
                        {result.title}
                      </a>
                    </h3>
                    <a
                      href={result.url}
                      className="text-green-700 text-sm hover:underline mb-2 block"
                    >
                      {result.url}
                    </a>
                    <p className="text-gray-600">{result.description}</p>
                  </div>
                ))}
              </div>
            </>
          )}

          {/* Initial State - No Search Performed */}
          {!hasSearched && !isSearching && (
            <div className="text-center py-12 px-4 text-gray-500">
              Enter your search terms above to begin
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SearchResultsPage;
