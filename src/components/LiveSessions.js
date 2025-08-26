import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useStore } from '../context/StoreContext';

const LiveSessions = () => {
  const { getSessions } = useStore();
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSessions();
  }, []);

  const loadSessions = async () => {
    try {
      const response = await getSessions(5, 0); // Get latest 5 sessions
      setSessions(response.sessions || []);
    } catch (error) {
      console.error('Error loading sessions:', error);
      setSessions([]);
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

  if (loading) {
    return (
      <div className="bg-gray-900/40 backdrop-blur-xl border border-gray-800/30 rounded-2xl shadow-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-100">Live Sessions</h3>
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
        <h3 className="text-lg font-semibold text-gray-100">Live Sessions</h3>
        <div className="flex items-center gap-2">
          <span className="text-green-300 animate-pulse opacity-80">●</span>
          <span className="text-sm text-gray-400">Live updates</span>
        </div>
      </div>

      {sessions.length === 0 ? (
        <div className="text-center py-8">
          <span className="text-4xl text-gray-600 mb-3 block opacity-50">📹</span>
          <p className="text-gray-400">No active sessions</p>
        </div>
      ) : (
        <div className="space-y-3">
          {sessions.map((session, index) => (
            <div key={index} className="flex items-center gap-4 p-4 rounded-xl bg-gray-800/20 border border-gray-700/20 hover:bg-gray-800/30 hover:border-gray-600/30 transition-all duration-200">
              <div className="p-2 rounded-lg bg-blue-500/10 border border-blue-500/20">
                <span className="text-blue-300 text-lg opacity-80">📹</span>
              </div>
              
              <div className="flex-1 min-w-0">
                <h4 className="text-sm font-semibold text-gray-100 truncate">
                  {session.session_name}
                </h4>
                <div className="flex items-center gap-4 mt-1 text-xs text-gray-400">
                  <div className="flex items-center gap-1">
                    <span className="opacity-60">🕐</span>
                    <span>{formatDuration(session.session_info?.timestamp)}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="opacity-60">👥</span>
                    <span>{session.face_count || 0} faces</span>
                  </div>
                </div>
              </div>

              <div className="text-right">
                <div className="text-sm font-semibold text-gray-100">
                  {session.combined_metrics?.quality_passed || 0}
                </div>
                <div className="text-xs text-gray-400">Quality passed</div>
              </div>

              <div className="w-2 h-2 bg-green-300 rounded-full animate-pulse opacity-80"></div>
            </div>
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
