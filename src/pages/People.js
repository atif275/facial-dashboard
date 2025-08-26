import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useStore } from '../context/StoreContext';

const People = () => {
  const { getPeople } = useStore();
  const [people, setPeople] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);

  useEffect(() => {
    loadPeople();
  }, [currentPage]);

  const loadPeople = async () => {
    try {
      setLoading(true);
      const response = await getPeople(20, currentPage * 20);
      console.log('People API Response:', response); // Added console log
      const newPeople = response.persons || [];
      
      if (currentPage === 0) {
        setPeople(newPeople);
      } else {
        setPeople(prev => [...prev, ...newPeople]);
      }
      
      setHasMore(newPeople.length === 20);
    } catch (error) {
      console.error('Error loading people:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatLastSeen = (timestamp) => {
    if (!timestamp) return 'Unknown';
    
    const now = new Date();
    const lastSeen = new Date(timestamp);
    const diffMs = now - lastSeen;
    const diffMins = Math.floor(diffMs / 60000);
    
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays}d ago`;
  };

  const filteredPeople = people.filter(person =>
    person.person_id?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const loadMore = () => {
    if (!loading && hasMore) {
      setCurrentPage(prev => prev + 1);
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-100">People</h1>
          <p className="text-gray-400">Manage registered individuals and visitors</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="relative">
            <input
              type="text"
              placeholder="Search people..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-gray-900/40 border border-gray-800/30 rounded-xl px-4 py-2 text-gray-100 placeholder-gray-400 focus:outline-none focus:border-blue-500/50 transition-colors"
            />
            <span className="absolute right-3 top-2.5 text-gray-400 opacity-60">🔍</span>
          </div>
        </div>
      </div>

      {/* People Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredPeople.map((person, index) => (
          <Link
            key={index}
            to={`/people/${encodeURIComponent(person.person_id)}`}
            className="block"
          >
            <div className="bg-gray-900/40 backdrop-blur-xl border border-gray-800/30 rounded-2xl shadow-lg p-6 hover:bg-gray-900/60 hover:border-gray-700/40 transition-all duration-300 group">
              <div className="flex items-start justify-between mb-4">
                <div className={`p-3 rounded-xl border ${
                  person.gender === 0 
                    ? 'bg-pink-500/10 border-pink-500/20' 
                    : person.gender === 1 
                    ? 'bg-blue-500/10 border-blue-500/20'
                    : 'bg-gray-500/10 border-gray-500/20'
                }`}>
                  <span className={`text-xl opacity-80 ${
                    person.gender === 0 
                      ? 'text-pink-300' 
                      : person.gender === 1 
                      ? 'text-blue-300'
                      : 'text-gray-300'
                  }`}>
                    {person.gender === 0 ? '👩' : person.gender === 1 ? '👨' : '👤'}
                  </span>
                </div>
                <div className="text-right">
                  <div className="text-sm text-gray-400">Faces</div>
                  <div className="text-lg font-semibold text-gray-100">
                    {person.face_count || 0}
                  </div>
                </div>
              </div>

              <h3 className="text-lg font-semibold text-gray-100 mb-2 group-hover:text-purple-300 transition-colors">
                {person.person_id || 'Unknown'}
              </h3>

              <div className="space-y-2 text-sm text-gray-400">
                <div className="flex items-center justify-between">
                  <span className="opacity-60">📅</span>
                  <span>{formatLastSeen(person.last_seen)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="opacity-60">📹</span>
                  <span>{person.sessions?.length || 0} sessions</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="opacity-60">🎯</span>
                  <span>{person.face_count || 0} unique faces</span>
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-gray-700/30">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-gray-400">View details</span>
                  <span className="text-purple-300 group-hover:translate-x-1 transition-transform">→</span>
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* Load More */}
      {hasMore && (
        <div className="text-center">
          <button
            onClick={loadMore}
            disabled={loading}
            className="bg-gray-900/40 border border-gray-800/30 rounded-xl px-6 py-3 text-gray-100 hover:bg-gray-900/60 hover:border-gray-700/40 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <div className="flex items-center gap-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-400"></div>
                Loading...
              </div>
            ) : (
              'Load More People'
            )}
          </button>
        </div>
      )}

      {/* Empty State */}
      {!loading && filteredPeople.length === 0 && (
        <div className="text-center py-12">
          <span className="text-6xl text-gray-600 mb-4 block opacity-50">👤</span>
          <h3 className="text-xl font-semibold text-gray-100 mb-2">No people found</h3>
          <p className="text-gray-400">
            {searchTerm ? 'Try adjusting your search terms' : 'No registered people available'}
          </p>
        </div>
      )}
    </div>
  );
};

export default People;
