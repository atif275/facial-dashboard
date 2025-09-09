import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useStore } from '../context/StoreContext';
import { getTimeAgo, formatTimestamp, calculateDuration } from '../utils/timeUtils';
import Tooltip from '../components/Tooltip';

const PersonDetails = () => {
  const { personId } = useParams();
  const { getPersonDetails, getSessionDetails } = useStore();
  const [person, setPerson] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showRawPerson, setShowRawPerson] = useState(false);
  const [showPersonVideos, setShowPersonVideos] = useState(false);
  const [sessionVideos, setSessionVideos] = useState([]);
  const [loadingVideos, setLoadingVideos] = useState(false);

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

  const loadSessionVideos = async () => {
    if (!person?.sessions || person.sessions.length === 0) {
      console.log('No sessions found for this person');
      return;
    }

    try {
      setLoadingVideos(true);
      console.log(`🎬 Loading videos for ${person.sessions.length} sessions:`, person.sessions);
      
      const sessionVideoData = [];
      
      // Fetch video URLs for each session
      for (const sessionName of person.sessions) {
        try {
          console.log(`📹 Fetching session details for: ${sessionName}`);
          const sessionResponse = await getSessionDetails(sessionName);
          
          if (sessionResponse?.session?.session_info?.s3_cdn_urls) {
            sessionVideoData.push({
              sessionName: sessionName,
              videos: sessionResponse.session.session_info.s3_cdn_urls
            });
            console.log(`✅ Found ${sessionResponse.session.session_info.s3_cdn_urls.length} videos for ${sessionName}`);
          } else {
            console.log(`❌ No videos found for session: ${sessionName}`);
            sessionVideoData.push({
              sessionName: sessionName,
              videos: []
            });
          }
        } catch (sessionError) {
          console.error(`Error fetching session ${sessionName}:`, sessionError);
          sessionVideoData.push({
            sessionName: sessionName,
            videos: [],
            error: sessionError.message
          });
        }
      }
      
      setSessionVideos(sessionVideoData);
      console.log('🎬 All session videos loaded:', sessionVideoData);
      
    } catch (error) {
      console.error('Error loading session videos:', error);
      setSessionVideos([]);
    } finally {
      setLoadingVideos(false);
    }
  };

  const handleShowVideos = () => {
    setShowPersonVideos(!showPersonVideos);
    
    // Load videos when showing for the first time
    if (!showPersonVideos && sessionVideos.length === 0) {
      loadSessionVideos();
    }
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
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <p className="text-sm text-gray-400">Total Visits</p>
                <Tooltip text="Total Visits - Number of times this person has been detected and identified across all sessions">
                  <span className="text-gray-500 hover:text-gray-300 transition-colors cursor-help text-xs">
                    ℹ️
                  </span>
                </Tooltip>
              </div>
              <p className="text-3xl font-bold text-gray-100">{person.total_visits?.toLocaleString() || 0}</p>
            </div>
            <div className="p-3 rounded-xl bg-blue-500/10 border border-blue-500/20">
              <span className="text-blue-300 text-xl opacity-80">👥</span>
            </div>
          </div>
        </div>

        <div className="bg-gray-900/40 backdrop-blur-xl border border-gray-800/30 rounded-2xl shadow-lg p-6">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <p className="text-sm text-gray-400">Total Faces</p>
                <Tooltip text="Total Faces - Cumulative count of all face detections for this person across all sessions and camera views">
                  <span className="text-gray-500 hover:text-gray-300 transition-colors cursor-help text-xs">
                    ℹ️
                  </span>
                </Tooltip>
              </div>
              <p className="text-3xl font-bold text-gray-100">{person.total_faces?.toLocaleString() || 0}</p>
            </div>
            <div className="p-3 rounded-xl bg-purple-500/10 border border-purple-500/20">
              <span className="text-purple-300 text-xl opacity-80">📹</span>
            </div>
          </div>
        </div>

        <div className="bg-gray-900/40 backdrop-blur-xl border border-gray-800/30 rounded-2xl shadow-lg p-6">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <p className="text-sm text-gray-400">Sessions</p>
                <Tooltip text="Sessions - Number of unique recording sessions where this person has been identified">
                  <span className="text-gray-500 hover:text-gray-300 transition-colors cursor-help text-xs">
                    ℹ️
                  </span>
                </Tooltip>
              </div>
              <p className="text-3xl font-bold text-gray-100">{person.sessions?.length?.toLocaleString() || 0}</p>
            </div>
            <div className="p-3 rounded-xl bg-green-500/10 border border-green-500/20">
              <span className="text-green-300 text-xl opacity-80">🎯</span>
            </div>
          </div>
        </div>

        <div className="bg-gray-900/40 backdrop-blur-xl border border-gray-800/30 rounded-2xl shadow-lg p-6">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <p className="text-sm text-gray-400">Last Seen</p>
                <Tooltip text="Last Seen - Most recent timestamp when this person was detected and identified in the system">
                  <span className="text-gray-500 hover:text-gray-300 transition-colors cursor-help text-xs">
                    ℹ️
                  </span>
                </Tooltip>
              </div>
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
          <div className="flex items-center gap-2 mb-4">
            <h3 className="text-lg font-semibold text-gray-100">Person Information</h3>
            <Tooltip text="Person Information - Basic profile data including demographics, visit statistics, and temporal activity patterns">
              <span className="text-gray-500 hover:text-gray-300 transition-colors cursor-help text-sm">
                ℹ️
              </span>
            </Tooltip>
          </div>
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
              <span className="text-gray-100 font-medium">{person.age > 0 ? person.age : 'Unknown'}</span>
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
          <div className="flex items-center gap-2 mb-4">
            <h3 className="text-lg font-semibold text-gray-100">Activity Metrics</h3>
            <Tooltip text="Activity Metrics - Visual representation of this person's engagement patterns and activity levels with progress indicators">
              <span className="text-gray-500 hover:text-gray-300 transition-colors cursor-help text-sm">
                ℹ️
              </span>
            </Tooltip>
          </div>
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
                <span className="text-gray-100 font-medium">{person.age > 0 ? person.age : 'Unknown'} years</span>
              </div>
              <div className="w-full bg-gray-800/30 rounded-full h-2">
                <div 
                  className="bg-orange-500/60 h-2 rounded-full transition-all duration-500"
                  style={{ width: `${person.age > 0 ? Math.min(person.age * 2, 100) : 0}%` }}
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
          <div className="flex items-center gap-2 mb-4">
            <h3 className="text-lg font-semibold text-gray-100">Session History</h3>
            <Tooltip text="Session History - Chronological list of recording sessions where this person was identified, clickable to view session details">
              <span className="text-gray-500 hover:text-gray-300 transition-colors cursor-help text-sm">
                ℹ️
              </span>
            </Tooltip>
          </div>
          <div className="space-y-3">
            {person.sessions.slice(0, 10).map((session, index) => (
              <Link
                key={index}
                to={`/sessions/${encodeURIComponent(session)}`}
                className="block"
              >
                <div className="flex items-center gap-4 p-4 rounded-xl bg-gray-800/20 border border-gray-700/20 hover:bg-gray-800/40 hover:border-gray-600/30 transition-all duration-200 group cursor-pointer">
                  <div className="p-2 rounded-lg bg-purple-500/10 border border-purple-500/20 group-hover:bg-purple-500/20 transition-colors">
                    <span className="text-purple-300 text-lg opacity-80">📹</span>
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-semibold text-gray-100 truncate group-hover:text-purple-300 transition-colors">
                      {session || 'Unknown Session'}
                    </h4>
                    <div className="flex items-center gap-4 mt-1 text-xs text-gray-400">
                      <div className="flex items-center gap-1">
                        <span className="opacity-60">📅</span>
                        <span>Session {index + 1}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <span className="opacity-60">👁️</span>
                        <span>View details</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="text-purple-300 opacity-60 group-hover:opacity-100 group-hover:translate-x-1 transition-all duration-200">
                    →
                  </div>
                </div>
              </Link>
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
          <div className="flex items-center gap-2 mb-4">
            <h3 className="text-lg font-semibold text-gray-100">Face History Summary</h3>
            <Tooltip text="Face History Summary - Statistical overview of face detection data and demographics for this person">
              <span className="text-gray-500 hover:text-gray-300 transition-colors cursor-help text-sm">
                ℹ️
              </span>
            </Tooltip>
          </div>
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

      {/* Person Videos */}
      <div className="bg-gray-900/40 backdrop-blur-xl border border-gray-800/30 rounded-2xl shadow-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <h3 className="text-lg font-semibold text-gray-100">Person Videos</h3>
            <Tooltip text="Person Videos - Video recordings from all sessions where this person appears, organized by session with playback controls">
              <span className="text-gray-500 hover:text-gray-300 transition-colors cursor-help text-sm">
                ℹ️
              </span>
            </Tooltip>
          </div>
          <button
            onClick={handleShowVideos}
            className="flex items-center gap-2 px-3 py-1 bg-gray-800/40 border border-gray-700/30 rounded-lg hover:bg-gray-800/60 transition-colors text-sm"
          >
            <span className="text-gray-300">{showPersonVideos ? 'Hide' : 'Show'} Videos</span>
            <span className="text-gray-400">{showPersonVideos ? '▼' : '▶'}</span>
          </button>
        </div>
        
        {showPersonVideos && (
          <div className="bg-gray-800/20 border border-gray-700/20 rounded-xl p-4">
            {loadingVideos ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-400 mx-auto mb-3"></div>
                <p className="text-gray-400">Loading sessions for this person...</p>
                <p className="text-sm text-gray-500 mt-1">
                  Fetching videos from {person?.sessions?.length || 0} sessions
                </p>
              </div>
            ) : sessionVideos.length > 0 ? (
              <div className="space-y-6">
                <div className="text-sm text-gray-400 mb-4">
                  Found videos from {sessionVideos.length} session(s) for this person:
                </div>
                
                {sessionVideos.map((sessionData, sessionIndex) => (
                  <div key={sessionIndex} className="border-b border-gray-700/30 pb-6 last:border-b-0 last:pb-0">
                    <h4 className="text-lg font-semibold text-gray-200 mb-3 flex items-center gap-2">
                      <span className="text-purple-400">📹</span>
                      {sessionData.sessionName}
                    </h4>
                    
                    {sessionData.error ? (
                      <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-red-400">❌</span>
                          <span className="text-sm text-red-300">Error loading session</span>
                        </div>
                        <p className="text-xs text-red-400">{sessionData.error}</p>
                      </div>
                    ) : sessionData.videos && sessionData.videos.length > 0 ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {sessionData.videos.map((videoUrl, videoIndex) => {
                          const hasSpecialChars = videoUrl.includes('@') || videoUrl.includes('%') || videoUrl.includes('+');
                          const fileName = videoUrl.split('/').pop() || `video_${videoIndex + 1}.mp4`;
                          
                          return (
                            <div key={videoIndex} className="bg-gray-700/20 border border-gray-600/20 rounded-lg p-4">
                              <div className="flex items-center justify-between mb-2">
                                <span className="text-sm font-medium text-gray-200">Video {videoIndex + 1}</span>
                                <span className="text-xs text-gray-400">📹</span>
                              </div>
                              
                              {hasSpecialChars ? (
                                <div className="space-y-3">
                                  <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-3">
                                    <div className="flex items-center gap-2 mb-2">
                                      <span className="text-yellow-400">⚠️</span>
                                      <span className="text-sm text-yellow-300">S3 URL requires authentication</span>
                                    </div>
                                    <p className="text-xs text-yellow-400">
                                      This video is stored in AWS S3 and requires special access. 
                                      Contact your administrator for direct access.
                                    </p>
                                  </div>
                                  
                                  <div className="space-y-2">
                                    <div className="text-xs text-gray-400">
                                      <strong>File:</strong> {fileName}
                                    </div>
                                    <div className="text-xs text-gray-400 break-all">
                                      <strong>S3 URL:</strong> {videoUrl}
                                    </div>
                                  </div>
                                  
                                  <div className="flex gap-2">
                                    <button
                                      onClick={() => navigator.clipboard.writeText(videoUrl)}
                                      className="px-3 py-1 bg-blue-500/20 border border-blue-500/30 rounded text-xs text-blue-300 hover:bg-blue-500/30 transition-colors"
                                    >
                                      📋 Copy URL
                                    </button>
                                    <a 
                                      href={videoUrl} 
                                      target="_blank" 
                                      rel="noopener noreferrer"
                                      className="px-3 py-1 bg-green-500/20 border border-green-500/30 rounded text-xs text-green-300 hover:bg-green-500/30 transition-colors"
                                    >
                                      🔗 Try Direct Access
                                    </a>
                                  </div>
                                </div>
                              ) : (
                                <>
                                  <video 
                                    controls 
                                    className="w-full rounded-lg max-h-48"
                                    preload="metadata"
                                  >
                                    <source src={videoUrl} type="video/mp4" />
                                    Your browser does not support the video tag.
                                  </video>
                                  <div className="mt-2 flex gap-2">
                                    <a 
                                      href={videoUrl} 
                                      target="_blank" 
                                      rel="noopener noreferrer"
                                      className="text-xs text-blue-400 hover:text-blue-300 transition-colors"
                                    >
                                      🔗 Open in new tab
                                    </a>
                                    <button
                                      onClick={() => navigator.clipboard.writeText(videoUrl)}
                                      className="text-xs text-gray-400 hover:text-gray-300 transition-colors"
                                    >
                                      📋 Copy URL
                                    </button>
                                  </div>
                                </>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <div className="text-center py-4">
                        <span className="text-2xl text-gray-600 mb-2 block opacity-50">🎥</span>
                        <p className="text-gray-400">No videos found for this session</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <span className="text-6xl text-gray-600 mb-4 block opacity-50">🎥</span>
                <p className="text-gray-400">No videos available for this person</p>
                <p className="text-sm text-gray-500 mt-2">
                  {person?.sessions?.length === 0 ? 'Person has no sessions' : 'Videos not found in any sessions'}
                </p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Raw Person Data */}
      <div className="bg-gray-900/40 backdrop-blur-xl border border-gray-800/30 rounded-2xl shadow-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <h3 className="text-lg font-semibold text-gray-100">Raw Person Data</h3>
            <Tooltip text="Raw Person Data - Complete JSON response from the API containing all available data fields for this person">
              <span className="text-gray-500 hover:text-gray-300 transition-colors cursor-help text-sm">
                ℹ️
              </span>
            </Tooltip>
          </div>
          <button
            onClick={() => setShowRawPerson(!showRawPerson)}
            className="flex items-center gap-2 px-3 py-1 bg-gray-800/40 border border-gray-700/30 rounded-lg hover:bg-gray-800/60 transition-colors text-sm"
          >
            <span className="text-gray-300">{showRawPerson ? 'Hide' : 'Show'} Raw Data</span>
            <span className="text-gray-400">{showRawPerson ? '▼' : '▶'}</span>
          </button>
        </div>
        
        {showRawPerson && person && (
          <div className="bg-gray-800/20 border border-gray-700/20 rounded-xl p-4">
            <pre className="text-xs text-gray-300 overflow-x-auto whitespace-pre-wrap">
              {JSON.stringify(person, null, 2)}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
};

export default PersonDetails;
