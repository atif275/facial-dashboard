import { useState, useEffect } from 'react';
import { useStore } from '../context/StoreContext';
import { Link } from 'react-router-dom';
import { getTimeAgo } from '../utils/timeUtils';

const LiveSessions = () => {
  const { getSessions, loading: storeLoading, currentStore } = useStore();
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Only load data when store is ready and currentStore is set
    if (!storeLoading && currentStore) {
      console.log('🔄 RecentSessions: Loading sessions for store:', currentStore.name);
      loadSessions();
    }
  }, [storeLoading, currentStore]);

  const loadSessions = async () => {
    try {
      const response = await getSessions(5, 0);
      console.log('📋 Raw sessions data:', response.sessions);
      
      // Sort sessions by session_info.timestamp (latest first)
      const sortedSessions = (response.sessions || []).sort((a, b) => {
        // Use session_info.timestamp as primary field
        const timeA = new Date(a.session_info?.timestamp || a.timestamp || a.created_at || 0);
        const timeB = new Date(b.session_info?.timestamp || b.timestamp || b.created_at || 0);
        
        console.log(`📅 Session ${a.session_name}: ${a.session_info?.timestamp || 'No timestamp'}`);
        return timeB - timeA; // Latest first (newest sessions at top)
      });
      
      console.log('📋 Sorted sessions:', sortedSessions.map(s => ({ 
        name: s.session_name, 
        timestamp: s.session_info?.timestamp,
        sorted_by: 'session_info.timestamp'
      })));
      
      setSessions(sortedSessions);
    } catch (error) {
      console.error('Error loading sessions:', error);
      setSessions([]);
    } finally {
      setLoading(false);
    }
  };

  const formatDuration = (timestamp) => {
    return getTimeAgo(timestamp);
  };

  if (loading) {
    return (
      <div className="bg-gray-900/40 backdrop-blur-xl border border-gray-800/30 rounded-2xl shadow-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-100">Recent Sessions</h3>
          <span className="text-gray-400 opacity-60">📋</span>
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
        <h3 className="text-lg font-semibold text-gray-100">Recent Sessions</h3>
        <div className="flex items-center gap-2">
          <span className="text-gray-400 opacity-60">📋</span>
          <span className="text-sm text-gray-400">Latest sessions</span>
        </div>
      </div>

      {sessions.length === 0 ? (
        <div className="text-center py-8">
          <span className="text-4xl text-gray-600 mb-3 block opacity-50">📹</span>
          <p className="text-gray-400">No recent sessions</p>
        </div>
      ) : (
        <div className="space-y-3">
          {sessions.map((session, index) => (
            <Link
              key={index}
              to={`/sessions/${encodeURIComponent(session.session_name)}`}
              className="block"
            >
              <div className="flex items-center gap-4 p-4 rounded-xl bg-gray-800/20 border border-gray-700/20 hover:bg-gray-800/40 hover:border-gray-600/30 transition-all duration-200 group cursor-pointer">
                <div className="p-2 rounded-lg bg-blue-500/10 border border-blue-500/20 group-hover:bg-blue-500/20 transition-colors">
                  <span className="text-blue-300 text-lg opacity-80">📹</span>
                </div>
                
                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-semibold text-gray-100 truncate group-hover:text-blue-300 transition-colors">
                    {session.session_name}
                  </h4>
                  <div className="flex items-center gap-4 mt-1 text-xs text-gray-400">
                    <div className="flex items-center gap-1">
                      <span className="opacity-60">🕐</span>
                      <span>{formatDuration(session.session_info?.timestamp)}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <span className="opacity-60">👥</span>
                      <span>{session.combined_metrics?.faces_detected || 0} faces</span>
                    </div>
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-sm font-semibold text-gray-100">
                    {session.combined_metrics?.quality_passed || 0}
                  </div>
                  <div className="text-xs text-gray-400">Quality passed</div>
                </div>

                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-300 rounded-full animate-pulse opacity-80"></div>
                  <div className="text-blue-300 opacity-60 group-hover:opacity-100 group-hover:translate-x-1 transition-all duration-200">
                    →
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}

      {sessions.length > 0 && (
        <div className="mt-4 pt-4 border-t border-gray-700/30">
          <Link 
            to="/sessions"
            className="text-sm text-blue-300 hover:text-blue-200 transition-colors"
          >
            View all sessions →
          </Link>
        </div>
      )}
    </div>
  );
};

export default LiveSessions;
