import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useStore } from '../context/StoreContext';

const Sessions = () => {
  const { getSessions } = useStore();
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);

  useEffect(() => {
    loadSessions();
  }, [currentPage]);

  const loadSessions = async () => {
    try {
      setLoading(true);
      const response = await getSessions(20, currentPage * 20);
      const newSessions = response.sessions || [];
      
      if (currentPage === 0) {
        setSessions(newSessions);
      } else {
        setSessions(prev => [...prev, ...newSessions]);
      }
      
      setHasMore(newSessions.length === 20);
    } catch (error) {
      console.error('Error loading sessions:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDuration = (timestamp) => {
    if (!timestamp) return 'Unknown';
    
    const now = new Date();
    const sessionTime = new Date(timestamp);
    const diffMs = now - sessionTime;
    const diffMins = Math.floor(diffMs / 60000);
    
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays}d ago`;
  };

  const filteredSessions = sessions.filter(session =>
    session.session_name?.toLowerCase().includes(searchTerm.toLowerCase())
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
          <h1 className="text-2xl font-bold text-gray-100">Sessions</h1>
          <p className="text-gray-400">Manage and monitor recording sessions</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="relative">
            <input
              type="text"
              placeholder="Search sessions..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-gray-900/40 border border-gray-800/30 rounded-xl px-4 py-2 text-gray-100 placeholder-gray-400 focus:outline-none focus:border-blue-500/50 transition-colors"
            />
            <span className="absolute right-3 top-2.5 text-gray-400 opacity-60">🔍</span>
          </div>
        </div>
      </div>

      {/* Sessions Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredSessions.map((session, index) => (
          <Link
            key={index}
            to={`/sessions/${encodeURIComponent(session.session_name)}`}
            className="block"
          >
            <div className="bg-gray-900/40 backdrop-blur-xl border border-gray-800/30 rounded-2xl shadow-lg p-6 hover:bg-gray-900/60 hover:border-gray-700/40 transition-all duration-300 group">
              <div className="flex items-start justify-between mb-4">
                <div className="p-3 rounded-xl bg-blue-500/10 border border-blue-500/20">
                  <span className="text-blue-300 text-xl opacity-80">📹</span>
                </div>
                <div className="text-right">
                  <div className="text-sm text-gray-400">Quality</div>
                  <div className="text-lg font-semibold text-gray-100">
                    {session.combined_metrics?.quality_passed || 0}
                  </div>
                </div>
              </div>

              <h3 className="text-lg font-semibold text-gray-100 mb-2 group-hover:text-blue-300 transition-colors">
                {session.session_name}
              </h3>

              <div className="space-y-2 text-sm text-gray-400">
                <div className="flex items-center justify-between">
                  <span className="opacity-60">🕐</span>
                  <span>{formatDuration(session.session_info?.timestamp)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="opacity-60">👥</span>
                  <span>{session.face_count || 0} faces detected</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="opacity-60">📊</span>
                  <span>{session.combined_metrics?.total_faces || 0} total faces</span>
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-gray-700/30">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-gray-400">View details</span>
                  <span className="text-blue-300 group-hover:translate-x-1 transition-transform">→</span>
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
              'Load More Sessions'
            )}
          </button>
        </div>
      )}

      {/* Empty State */}
      {!loading && filteredSessions.length === 0 && (
        <div className="text-center py-12">
          <span className="text-6xl text-gray-600 mb-4 block opacity-50">📹</span>
          <h3 className="text-xl font-semibold text-gray-100 mb-2">No sessions found</h3>
          <p className="text-gray-400">
            {searchTerm ? 'Try adjusting your search terms' : 'No recording sessions available'}
          </p>
        </div>
      )}
    </div>
  );
};

export default Sessions;
