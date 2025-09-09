import { useState, useEffect } from 'react';
import { useStore } from '../context/StoreContext';
import { Link } from 'react-router-dom';
import { getTimeAgo } from '../utils/timeUtils';

const RecentVisitors = () => {
  const { getPeople, loading: storeLoading, currentStore } = useStore();
  const [visitors, setVisitors] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Only load data when store is ready and currentStore is set
    if (!storeLoading && currentStore) {
      console.log('🔄 RecentVisitors: Loading visitors for store:', currentStore.name);
      loadVisitors();
    }
  }, [storeLoading, currentStore]);

  const loadVisitors = async () => {
    try {
      const response = await getPeople(5, 0);
      setVisitors(response.persons || []);
    } catch (error) {
      console.error('Error loading visitors:', error);
      setVisitors([]);
    } finally {
      setLoading(false);
    }
  };

  const formatLastSeen = (timestamp) => {
    return getTimeAgo(timestamp);
  };

  if (loading) {
    return (
      <div className="bg-gray-900/40 backdrop-blur-xl border border-gray-800/30 rounded-2xl shadow-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-100">Recent Visitors</h3>
          <span className="text-gray-400 animate-pulse opacity-60">●</span>
        </div>
        <div className="flex items-center justify-center h-32">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-400"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-900/40 backdrop-blur-xl border border-gray-800/30 rounded-2xl shadow-lg p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-100">Recent Visitors</h3>
        <div className="flex items-center gap-2">
          <span className="text-blue-300 animate-pulse opacity-80">●</span>
          <span className="text-sm text-gray-400">Live updates</span>
        </div>
      </div>

      {visitors.length === 0 ? (
        <div className="text-center py-8">
          <span className="text-6xl text-gray-600 mb-4 block opacity-50">👤</span>
          <p className="text-gray-400">No recent visitors</p>
        </div>
      ) : (
        <div className="space-y-3">
          {visitors.map((visitor, index) => (
            <Link
              key={index}
              to={`/people/${encodeURIComponent(visitor.person_id)}`}
              className="block"
            >
              <div className="flex items-center gap-3 px-3 py-4 rounded-xl bg-gray-800/20 border border-gray-700/20 hover:bg-gray-800/40 hover:border-gray-600/30 transition-all duration-200 group cursor-pointer">
                <div className="p-2 rounded-lg bg-purple-500/10 border border-purple-500/20 group-hover:bg-purple-500/20 transition-colors">
                  <span className="text-purple-300 text-lg opacity-80">👤</span>
                </div>
                
                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-semibold text-gray-100 truncate group-hover:text-purple-300 transition-colors">
                    {visitor.person_id || 'Unknown'}
                  </h4>
                  <div className="flex items-center gap-3 mt-1 text-xs text-gray-400">
                    <div className="flex items-center gap-1">
                      <span className="opacity-60">📅</span>
                      <span>{formatLastSeen(visitor.last_seen)}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <span className="opacity-60">📹</span>
                      <span>{visitor.sessions?.length || visitor.total_visits || 0} sessions</span>
                    </div>
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-sm font-semibold text-gray-100">
                    {visitor.total_faces || 0}
                  </div>
                  <div className="text-xs text-gray-400">Total faces</div>
                </div>

                <div className="text-purple-300 opacity-60 group-hover:opacity-100 group-hover:translate-x-1 transition-all duration-200">
                  →
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}

      {visitors.length > 0 && (
        <div className="mt-4 pt-4 border-t border-gray-700/30">
          <Link 
            to="/people"
            className="text-sm text-blue-300 hover:text-blue-200 transition-colors"
          >
            View all visitors →
          </Link>
        </div>
      )}
    </div>
  );
};

export default RecentVisitors;
