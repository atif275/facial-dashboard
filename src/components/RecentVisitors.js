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
            <div key={index} className="flex items-center gap-3 p-3 rounded-xl bg-gray-800/20 border border-gray-700/20 hover:bg-gray-800/30 hover:border-gray-600/30 transition-all duration-200">
              <div className="p-2 rounded-lg bg-purple-500/10 border border-purple-500/20">
                <span className="text-purple-300 text-lg opacity-80">👤</span>
              </div>
              
              <div className="flex-1 min-w-0">
                <h4 className="text-sm font-semibold text-gray-100 truncate">
                  {visitor.person_id || 'Unknown'}
                </h4>
                <div className="flex items-center gap-3 mt-1 text-xs text-gray-400">
                  <div className="flex items-center gap-1">
                    <span className="opacity-60">📅</span>
                    <span>{formatLastSeen(visitor.last_seen)}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="opacity-60">📹</span>
                    <span>{visitor.session_count || 0} sessions</span>
                  </div>
                </div>
              </div>

              <div className="text-right">
                <div className="text-sm font-semibold text-gray-100">
                  {visitor.face_count || 0}
                </div>
                <div className="text-xs text-gray-400">Faces</div>
              </div>
            </div>
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
