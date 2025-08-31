import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useStore } from '../context/StoreContext';
import { getTimeAgo, formatTimestamp, calculateDuration } from '../utils/timeUtils';

const PersonDetails = () => {
  const { personId } = useParams();
  const { getPersonDetails } = useStore();
  const [person, setPerson] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPersonDetails();
  }, [personId]);

  const loadPersonDetails = async () => {
    try {
      setLoading(true);
      const response = await getPersonDetails(personId);
      setPerson(response.person);
    } catch (error) {
      console.error('Error loading person details:', error);
      setPerson(null);
    } finally {
      setLoading(false);
    }
  };

  const formatLastSeen = (timestamp) => {
    return getTimeAgo(timestamp);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-400"></div>
      </div>
    );
  }

  if (!person) {
    return (
      <div className="text-center py-12">
        <span className="text-6xl text-gray-600 mb-4 block opacity-50">👤</span>
        <h3 className="text-xl font-semibold text-gray-100 mb-2">Person not found</h3>
        <p className="text-gray-400 mb-4">The requested person could not be found</p>
        <Link 
          to="/people"
          className="bg-purple-500/20 border border-purple-500/30 rounded-xl px-6 py-3 text-purple-300 hover:bg-purple-500/30 hover:border-purple-500/50 transition-all duration-300"
        >
          Back to People
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <Link 
              to="/people"
              className="text-purple-300 hover:text-purple-200 transition-colors"
            >
              ← Back to People
            </Link>
          </div>
          <h1 className="text-2xl font-bold text-gray-100">{person.person_id}</h1>
          <p className="text-gray-400">Person details and activity history</p>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-400">
          <span className="opacity-60">👤</span>
          <span>Registered person</span>
        </div>
      </div>

      {/* Person Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-gray-900/40 backdrop-blur-xl border border-gray-800/30 rounded-2xl shadow-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-400">Total Visits</p>
              <p className="text-3xl font-bold text-gray-100">{person.total_visits?.toLocaleString() || 0}</p>
            </div>
            <div className="p-3 rounded-xl bg-blue-500/10 border border-blue-500/20">
              <span className="text-blue-300 text-xl opacity-80">👥</span>
            </div>
          </div>
        </div>

        <div className="bg-gray-900/40 backdrop-blur-xl border border-gray-800/30 rounded-2xl shadow-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-400">Total Faces</p>
              <p className="text-3xl font-bold text-gray-100">{person.total_faces?.toLocaleString() || 0}</p>
            </div>
            <div className="p-3 rounded-xl bg-purple-500/10 border border-purple-500/20">
              <span className="text-purple-300 text-xl opacity-80">📹</span>
            </div>
          </div>
        </div>

        <div className="bg-gray-900/40 backdrop-blur-xl border border-gray-800/30 rounded-2xl shadow-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-400">Sessions</p>
              <p className="text-3xl font-bold text-gray-100">{person.sessions?.length?.toLocaleString() || 0}</p>
            </div>
            <div className="p-3 rounded-xl bg-green-500/10 border border-green-500/20">
              <span className="text-green-300 text-xl opacity-80">🎯</span>
            </div>
          </div>
        </div>

        <div className="bg-gray-900/40 backdrop-blur-xl border border-gray-800/30 rounded-2xl shadow-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-400">Last Seen</p>
              <p className="text-3xl font-bold text-gray-100">{formatLastSeen(person.last_seen)}</p>
            </div>
            <div className="p-3 rounded-xl bg-orange-500/10 border border-orange-500/20">
              <span className="text-orange-300 text-xl opacity-80">🕐</span>
            </div>
          </div>
        </div>
      </div>

      {/* Person Details */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-gray-900/40 backdrop-blur-xl border border-gray-800/30 rounded-2xl shadow-lg p-6">
          <h3 className="text-lg font-semibold text-gray-100 mb-4">Person Information</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-gray-300">Person ID</span>
              <span className="text-gray-100 font-medium">{person.person_id}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-300">Total Visits</span>
              <span className="text-gray-100 font-medium">{person.total_visits?.toLocaleString() || 0}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-300">Total Faces</span>
              <span className="text-gray-100 font-medium">{person.total_faces?.toLocaleString() || 0}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-300">Sessions Count</span>
              <span className="text-gray-100 font-medium">{person.sessions?.length || 0}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-300">First Seen</span>
              <span className="text-gray-100 font-medium">
                {person.first_seen ? formatTimestamp(person.first_seen) : 'Unknown'}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-300">Last Seen</span>
              <span className="text-gray-100 font-medium">
                {person.last_seen ? formatTimestamp(person.last_seen) : 'Unknown'}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-300">Age</span>
              <span className="text-gray-100 font-medium">{person.average_age > 0 ? person.average_age : 'Unknown'}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-300">Gender</span>
              <span className="text-gray-100 font-medium">
                {person.gender === 0 ? 'Female' : person.gender === 1 ? 'Male' : 'Unknown'}
              </span>
            </div>
          </div>
        </div>

        <div className="bg-gray-900/40 backdrop-blur-xl border border-gray-800/30 rounded-2xl shadow-lg p-6">
          <h3 className="text-lg font-semibold text-gray-100 mb-4">Activity Metrics</h3>
          <div className="space-y-6">
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-gray-300">Visit Frequency</span>
                <span className="text-gray-100 font-medium">{person.total_visits || 0} visits</span>
              </div>
              <div className="w-full bg-gray-800/30 rounded-full h-2">
                <div 
                  className="bg-blue-500/60 h-2 rounded-full transition-all duration-500"
                  style={{ width: `${Math.min((person.total_visits || 0) * 10, 100)}%` }}
                ></div>
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-gray-300">Session Diversity</span>
                <span className="text-gray-100 font-medium">{person.sessions?.length || 0} sessions</span>
              </div>
              <div className="w-full bg-gray-800/30 rounded-full h-2">
                <div 
                  className="bg-green-500/60 h-2 rounded-full transition-all duration-500"
                  style={{ width: `${Math.min((person.sessions?.length || 0) * 20, 100)}%` }}
                ></div>
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-gray-300">Average Age</span>
                <span className="text-gray-100 font-medium">{person.average_age > 0 ? person.average_age : 'Unknown'} years</span>
              </div>
              <div className="w-full bg-gray-800/30 rounded-full h-2">
                <div 
                  className="bg-orange-500/60 h-2 rounded-full transition-all duration-500"
                  style={{ width: `${person.average_age > 0 ? Math.min(person.average_age * 2, 100) : 0}%` }}
                ></div>
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-gray-300">Activity Period</span>
                <span className="text-gray-100 font-medium">
                  {person.first_seen && person.last_seen ? 
                    Math.ceil((new Date(person.last_seen) - new Date(person.first_seen)) / (1000 * 60 * 60 * 24)) : 0} days
                </span>
              </div>
              <div className="w-full bg-gray-800/30 rounded-full h-2">
                <div 
                  className="bg-purple-500/60 h-2 rounded-full transition-all duration-500"
                  style={{ 
                    width: `${person.first_seen && person.last_seen ? 
                      Math.min(Math.ceil((new Date(person.last_seen) - new Date(person.first_seen)) / (1000 * 60 * 60 * 24)) * 5, 100) : 0}%` 
                  }}
                ></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Session History */}
      {person.sessions && person.sessions.length > 0 && (
        <div className="bg-gray-900/40 backdrop-blur-xl border border-gray-800/30 rounded-2xl shadow-lg p-6">
          <h3 className="text-lg font-semibold text-gray-100 mb-4">Session History</h3>
          <div className="space-y-3">
            {person.sessions.slice(0, 10).map((session, index) => (
              <div key={index} className="flex items-center gap-4 p-4 rounded-xl bg-gray-800/20 border border-gray-700/20">
                <div className="p-2 rounded-lg bg-purple-500/10 border border-purple-500/20">
                  <span className="text-purple-300 text-lg opacity-80">📹</span>
                </div>
                
                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-semibold text-gray-100 truncate">
                    {session || 'Unknown Session'}
                  </h4>
                  <div className="flex items-center gap-4 mt-1 text-xs text-gray-400">
                    <div className="flex items-center gap-1">
                      <span className="opacity-60">📅</span>
                      <span>Session {index + 1}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          {person.sessions.length > 10 && (
            <div className="mt-4 pt-4 border-t border-gray-700/30">
              <p className="text-sm text-gray-400">
                Showing 10 of {person.sessions.length} sessions
              </p>
            </div>
          )}
        </div>
      )}

      {/* Face History */}
      {person.faces && person.faces.length > 0 && (
        <div className="bg-gray-900/40 backdrop-blur-xl border border-gray-800/30 rounded-2xl shadow-lg p-6">
          <h3 className="text-lg font-semibold text-gray-100 mb-4">Face History Summary</h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center p-4 bg-gray-800/20 rounded-xl">
              <p className="text-2xl font-bold text-gray-100">{person.total_faces?.toLocaleString() || 0}</p>
              <p className="text-sm text-gray-400">Total Faces</p>
            </div>
            <div className="text-center p-4 bg-gray-800/20 rounded-xl">
              <p className="text-2xl font-bold text-gray-100">{person.sessions?.length || 0}</p>
              <p className="text-sm text-gray-400">Unique Sessions</p>
            </div>
            <div className="text-center p-4 bg-gray-800/20 rounded-xl">
              <p className="text-2xl font-bold text-gray-100">{person.total_visits?.toLocaleString() || 0}</p>
              <p className="text-sm text-gray-400">Total Visits</p>
            </div>
            <div className="text-center p-4 bg-gray-800/20 rounded-xl">
              <p className="text-2xl font-bold text-gray-100">{person.gender === 0 ? 'Female' : person.gender === 1 ? 'Male' : 'Unknown'}</p>
              <p className="text-sm text-gray-400">Gender</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PersonDetails;
