import { useState } from 'react';
import { useStore } from '../context/StoreContext';
import { Link } from 'react-router-dom';
import { formatTimestamp } from '../utils/timeUtils';

const Search = () => {
  const { searchData } = useStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [searchType, setSearchType] = useState('all');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleSearch = async () => {
    if (!searchTerm.trim()) return;

    try {
      setLoading(true);
      const response = await searchData(searchTerm, searchType);
      setResults(response.results || []);
    } catch (error) {
      console.error('Search error:', error);
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-100">Search</h1>
          <p className="text-gray-400">Search across sessions, people, and faces</p>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-400">
          <span className="opacity-60">🔍</span>
          <span>Advanced search</span>
        </div>
      </div>

      {/* Search Interface */}
      <div className="bg-gray-900/40 backdrop-blur-xl border border-gray-800/30 rounded-2xl shadow-lg p-6">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1">
            <input
              type="text"
              placeholder="Search for sessions, people, or faces..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyPress={handleKeyPress}
              className="w-full bg-gray-800/40 border border-gray-700/30 rounded-xl px-4 py-3 text-gray-100 placeholder-gray-400 focus:outline-none focus:border-blue-500/50 transition-colors"
            />
          </div>
          
          <div className="flex gap-3">
            <select
              value={searchType}
              onChange={(e) => setSearchType(e.target.value)}
              className="bg-gray-800/40 border border-gray-700/30 rounded-xl px-4 py-3 text-gray-100 focus:outline-none focus:border-blue-500/50 transition-colors"
            >
              <option value="all">All</option>
              <option value="sessions">Sessions</option>
              <option value="people">People</option>
              <option value="faces">Faces</option>
            </select>
            
            <button
              onClick={handleSearch}
              disabled={loading || !searchTerm.trim()}
              className="bg-blue-500/20 border border-blue-500/30 rounded-xl px-6 py-3 text-blue-300 hover:bg-blue-500/30 hover:border-blue-500/50 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <div className="flex items-center gap-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-300"></div>
                  Searching...
                </div>
              ) : (
                'Search'
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Search Results */}
      {results.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-100">
              Search Results ({results.length})
            </h3>
            <span className="text-sm text-gray-400">
              Found in {searchType === 'all' ? 'all categories' : searchType}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {results.map((result, index) => (
              <div key={index} className="bg-gray-900/40 backdrop-blur-xl border border-gray-800/30 rounded-2xl shadow-lg p-6 hover:bg-gray-900/60 hover:border-gray-700/40 transition-all duration-300">
                <div className="flex items-start justify-between mb-4">
                  <div className={`p-3 rounded-xl border ${
                    result.type === 'session' ? 'bg-blue-500/10 border-blue-500/20' :
                    result.type === 'person' ? 'bg-purple-500/10 border-purple-500/20' :
                    'bg-green-500/10 border-green-500/20'
                  }`}>
                    <span className={`text-xl opacity-80 ${
                      result.type === 'session' ? 'text-blue-300' :
                      result.type === 'person' ? 'text-purple-300' :
                      'text-green-300'
                    }`}>
                      {result.type === 'session' ? '📹' : result.type === 'person' ? '👤' : '🎯'}
                    </span>
                  </div>
                  <div className="text-right">
                    <div className="text-xs text-gray-400 capitalize">{result.type}</div>
                    <div className="text-sm font-semibold text-gray-100">
                      {result.score ? `${Math.round(result.score * 100)}%` : 'N/A'}
                    </div>
                  </div>
                </div>

                <h4 className="text-lg font-semibold text-gray-100 mb-2">
                  {result.name || result.id || 'Unknown'}
                </h4>

                <div className="space-y-2 text-sm text-gray-400">
                  {result.timestamp && (
                    <div className="flex items-center gap-2">
                      <span className="opacity-60">🕐</span>
                      <span>{formatTimestamp(result.timestamp)}</span>
                    </div>
                  )}
                  
                  {result.face_count && (
                    <div className="flex items-center gap-2">
                      <span className="opacity-60">👥</span>
                      <span>{result.face_count} faces</span>
                    </div>
                  )}
                  
                  {result.session_count && (
                    <div className="flex items-center gap-2">
                      <span className="opacity-60">📹</span>
                      <span>{result.session_count} sessions</span>
                    </div>
                  )}
                  
                  {result.quality_score && (
                    <div className="flex items-center gap-2">
                      <span className="opacity-60">📊</span>
                      <span>Quality: {result.quality_score}%</span>
                    </div>
                  )}
                </div>

                {result.metadata && Object.keys(result.metadata).length > 0 && (
                  <div className="mt-4 pt-4 border-t border-gray-700/30">
                    <div className="text-xs text-gray-400 mb-2">Additional Info:</div>
                    <div className="space-y-1 text-xs text-gray-500">
                      {Object.entries(result.metadata).slice(0, 3).map(([key, value]) => (
                        <div key={key} className="flex justify-between">
                          <span className="capitalize">{key.replace('_', ' ')}:</span>
                          <span>{String(value).slice(0, 20)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* No Results */}
      {!loading && searchTerm && results.length === 0 && (
        <div className="text-center py-12">
          <span className="text-6xl text-gray-600 mb-4 block opacity-50">🔍</span>
          <h3 className="text-xl font-semibold text-gray-100 mb-2">No results found</h3>
          <p className="text-gray-400">
            Try adjusting your search terms or search type
          </p>
        </div>
      )}

      {/* Search Tips */}
      {!searchTerm && (
        <div className="bg-gray-900/40 backdrop-blur-xl border border-gray-800/30 rounded-2xl shadow-lg p-6">
          <h3 className="text-lg font-semibold text-gray-100 mb-4">Search Tips</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="text-sm font-medium text-gray-300 mb-2">Sessions</h4>
              <ul className="text-sm text-gray-400 space-y-1">
                <li>• Search by session name</li>
                <li>• Filter by date range</li>
                <li>• Find by face count</li>
              </ul>
            </div>
            <div>
              <h4 className="text-sm font-medium text-gray-300 mb-2">People</h4>
              <ul className="text-sm text-gray-400 space-y-1">
                <li>• Search by person ID</li>
                <li>• Find by last seen date</li>
                <li>• Filter by session count</li>
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Search;
