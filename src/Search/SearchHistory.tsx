import { useState, useEffect } from "react";
import { Clock, Trash2 } from "lucide-react";
import { useNavigate } from "react-router-dom";

const SearchHistory = () => {
  const [searchHistory, setSearchHistory] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    // Load search history from localStorage on component mount
    const loadSearchHistory = () => {
      const history = localStorage.getItem("searchHistory");
      if (history) {
        setSearchHistory(JSON.parse(history));
      }
    };
    loadSearchHistory();
  }, []);

  const handleHistoryClick = (query: any) => {
    navigate(`/search-results?q=${encodeURIComponent(query)}`);
  };

  const clearHistory = () => {
    localStorage.removeItem("searchHistory");
    setSearchHistory([]);
  };

  const removeHistoryItem = (index: any) => {
    const newHistory = searchHistory.filter((_, i) => i !== index);
    localStorage.setItem("searchHistory", JSON.stringify(newHistory));
    setSearchHistory(newHistory);
  };

  if (searchHistory.length === 0) {
    return (
      <div className="mt-16">
        <h3 className="text-lg font-serif text-gray-900 mb-4">
          Search History
        </h3>
        <p className="text-gray-500 text-sm">No recent searches</p>
      </div>
    );
  }

  return (
    <div className="mt-16">
      <div className="flex justify-between items-center mb-8">
        <h3 className="text-lg font-serif text-gray-900">Search History</h3>
        <button
          onClick={clearHistory}
          className="text-sm text-gray-500 hover:text-red-600 flex items-center gap-2"
        >
          <Trash2 className="w-4 h-4" />
          Clear All
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {searchHistory.map((query, index) => (
          <div
            key={index}
            className="group flex items-center justify-between bg-white p-3 rounded-lg border border-gray-100 hover:border-purple-200 transition-colors"
          >
            <button
              onClick={() => handleHistoryClick(query)}
              className="flex items-center gap-3 flex-1"
            >
              <Clock className="w-4 h-4 text-gray-400" />
              <span className="text-gray-700 text-sm truncate">{query}</span>
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                removeHistoryItem(index);
              }}
              className="opacity-0 group-hover:opacity-100 p-1 hover:text-red-600 transition-opacity"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SearchHistory;
