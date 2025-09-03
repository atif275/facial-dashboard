import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useStore } from '../context/StoreContext';
import { getTimeAgo } from '../utils/timeUtils';

const SessionDetails = () => {
  const { sessionName } = useParams();
  const { getSessionDetails } = useStore();
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showRawSession, setShowRawSession] = useState(false);
  const [showFaceFeatures, setShowFaceFeatures] = useState(false);
  const [showSessionVideos, setShowSessionVideos] = useState(false);

  useEffect(() => {
    loadSessionDetails();
  }, [sessionName]);

  const loadSessionDetails = async () => {
    try {
      setLoading(true);
      const response = await getSessionDetails(sessionName);
      console.log('Session Details API Response:', response);
      setSession(response.session);
    } catch (error) {
      console.error('Error loading session details:', error);
      setSession(null);
    } finally {
      setLoading(false);
    }
  };

  const formatDuration = (timestamp) => {
    return getTimeAgo(timestamp);
  };

  // Custom JSON renderer that makes face_features collapsible
  const renderCollapsibleJSON = (obj, indent = 0) => {
    const spaces = '  '.repeat(indent);
    const lines = [];
    
    for (const [key, value] of Object.entries(obj)) {
      if (key === 'face_features' && Array.isArray(value)) {
        lines.push(`${spaces}"${key}": [`);
        if (showFaceFeatures) {
          if (value.length > 0) {
            lines.push(`${spaces}  // ${value.length} face features`);
            lines.push(`${spaces}  ...${value.length} items`);
          } else {
            lines.push(`${spaces}  // Empty array`);
          }
        } else {
          lines.push(`${spaces}  // ${value.length} face features (click to expand)`);
        }
        lines.push(`${spaces}]`);
      } else if (typeof value === 'object' && value !== null) {
        lines.push(`${spaces}"${key}": {`);
        lines.push(...renderCollapsibleJSON(value, indent + 1));
        lines.push(`${spaces}}`);
      } else {
        const jsonValue = typeof value === 'string' ? `"${value}"` : value;
        lines.push(`${spaces}"${key}": ${jsonValue}`);
      }
    }
    
    return lines;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-400"></div>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="text-center py-12">
        <span className="text-6xl text-gray-600 mb-4 block opacity-50">📹</span>
        <h3 className="text-xl font-semibold text-gray-100 mb-2">Session not found</h3>
        <p className="text-gray-400 mb-4">The requested session could not be found</p>
        <Link 
          to="/sessions"
          className="bg-blue-500/20 border border-blue-500/30 rounded-xl px-6 py-3 text-blue-300 hover:bg-blue-500/30 hover:border-blue-500/50 transition-all duration-300"
        >
          Back to Sessions
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
              to="/sessions"
              className="text-blue-300 hover:text-blue-200 transition-colors"
            >
              ← Back to Sessions
            </Link>
          </div>
          <h1 className="text-2xl font-bold text-gray-100">{session.session_name}</h1>
          <p className="text-gray-400">Session details and analytics</p>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-400">
          <span className="opacity-60">📹</span>
          <span>Recording session</span>
        </div>
      </div>

      {/* Session Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-gray-900/40 backdrop-blur-xl border border-gray-800/30 rounded-2xl shadow-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-400">Total Faces</p>
              <p className="text-3xl font-bold text-gray-100">{session.face_features?.length || 0}</p>
            </div>
            <div className="p-3 rounded-xl bg-blue-500/10 border border-blue-500/20">
              <span className="text-blue-300 text-xl opacity-80">👥</span>
            </div>
          </div>
        </div>

        <div className="bg-gray-900/40 backdrop-blur-xl border border-gray-800/30 rounded-2xl shadow-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-400">Quality Passed</p>
              <p className="text-3xl font-bold text-gray-100">{session.combined_metrics?.quality_passed || 0}</p>
            </div>
            <div className="p-3 rounded-xl bg-green-500/10 border border-green-500/20">
              <span className="text-green-300 text-xl opacity-80">✅</span>
            </div>
          </div>
        </div>

        <div className="bg-gray-900/40 backdrop-blur-xl border border-gray-800/30 rounded-2xl shadow-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-400">Detection Rate</p>
              <p className="text-3xl font-bold text-gray-100">
                {session.combined_metrics?.faces_detected && session.combined_metrics?.total_frames_processed
                  ? Math.round((session.combined_metrics.faces_detected / session.combined_metrics.total_frames_processed) * 100)
                  : 0}%
              </p>
            </div>
            <div className="p-3 rounded-xl bg-purple-500/10 border border-purple-500/20">
              <span className="text-purple-300 text-xl opacity-80">🎯</span>
            </div>
          </div>
        </div>

        <div className="bg-gray-900/40 backdrop-blur-xl border border-gray-800/30 rounded-2xl shadow-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-400">Quality Rate</p>
              <p className="text-3xl font-bold text-gray-100">
                {session.combined_metrics?.quality_passed && session.combined_metrics?.faces_detected
                  ? Math.round((session.combined_metrics.quality_passed / session.combined_metrics.faces_detected) * 100)
                  : 0}%
              </p>
            </div>
            <div className="p-3 rounded-xl bg-orange-500/10 border border-orange-500/20">
              <span className="text-orange-300 text-xl opacity-80">📊</span>
            </div>
          </div>
        </div>
      </div>

      {/* Combined Metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-gray-900/40 backdrop-blur-xl border border-gray-800/30 rounded-2xl shadow-lg p-6">
          <h3 className="text-lg font-semibold text-gray-100 mb-4">Combined Metrics</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-gray-300">Total Frames Processed</span>
              <span className="text-gray-100 font-semibold">{session.combined_metrics?.total_frames_processed || 0}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-300">Faces Detected</span>
              <span className="text-gray-100 font-semibold">{session.combined_metrics?.faces_detected || 0}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-300">Quality Passed</span>
              <span className="text-gray-100 font-semibold">{session.combined_metrics?.quality_passed || 0}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-300">Features Extracted</span>
              <span className="text-gray-100 font-semibold">{session.combined_metrics?.features_extracted || 0}</span>
            </div>
          </div>
        </div>

        <div className="bg-gray-900/40 backdrop-blur-xl border border-gray-800/30 rounded-2xl shadow-lg p-6">
          <h3 className="text-lg font-semibold text-gray-100 mb-4">Quality Metrics</h3>
          <div className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-gray-300">Detection Rate</span>
                <span className="text-gray-100 font-semibold">
                  {session.combined_metrics?.faces_detected && session.combined_metrics?.total_frames_processed
                    ? Math.round((session.combined_metrics.faces_detected / session.combined_metrics.total_frames_processed) * 100)
                    : 0}%
                </span>
              </div>
              <div className="w-full bg-gray-800 rounded-full h-2">
                <div 
                  className="bg-blue-400 h-2 rounded-full transition-all duration-500"
                  style={{ 
                    width: `${session.combined_metrics?.faces_detected && session.combined_metrics?.total_frames_processed
                      ? Math.round((session.combined_metrics.faces_detected / session.combined_metrics.total_frames_processed) * 100)
                      : 0}%` 
                  }}
                ></div>
              </div>
            </div>
            
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-gray-300">Quality Pass Rate</span>
                <span className="text-gray-100 font-semibold">
                  {session.combined_metrics?.quality_passed && session.combined_metrics?.faces_detected
                    ? Math.round((session.combined_metrics.quality_passed / session.combined_metrics.faces_detected) * 100)
                    : 0}%
                </span>
              </div>
              <div className="w-full bg-gray-800 rounded-full h-2">
                <div 
                  className="bg-green-400 h-2 rounded-full transition-all duration-500"
                  style={{ 
                    width: `${session.combined_metrics?.quality_passed && session.combined_metrics?.faces_detected
                      ? Math.round((session.combined_metrics.quality_passed / session.combined_metrics.faces_detected) * 100)
                      : 0}%` 
                  }}
                ></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* View Statistics */}
      {session.view_statistics && Object.keys(session.view_statistics).length > 0 && (
        <div className="bg-gray-900/40 backdrop-blur-xl border border-gray-800/30 rounded-2xl shadow-lg p-6">
          <h3 className="text-lg font-semibold text-gray-100 mb-4">View Statistics</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Object.entries(session.view_statistics).map(([viewName, viewData]) => (
              <div key={viewName} className="bg-gray-800/20 border border-gray-700/20 rounded-xl p-4">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-sm font-semibold text-gray-100 capitalize">{viewName}</h4>
                  <span className="text-xs text-gray-400">{viewData.source_file}</span>
                </div>
                
                {/* Processing Time */}
                <div className="mb-3 p-2 bg-gray-700/20 rounded-lg">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-gray-400">Processing Time</span>
                    <span className="text-gray-100">{viewData.processing_time || 0}ms</span>
                  </div>
                </div>
                
                {/* View Metrics */}
                <div className="space-y-2 mb-4">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-gray-400">Frames Processed</span>
                    <span className="text-gray-100">{viewData.metrics?.total_frames_processed || 0}</span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-gray-400">Faces Detected</span>
                    <span className="text-gray-100">{viewData.metrics?.faces_detected || 0}</span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-gray-400">Quality Passed</span>
                    <span className="text-gray-100">{viewData.metrics?.quality_passed || 0}</span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-gray-400">Features Extracted</span>
                    <span className="text-gray-100">{viewData.metrics?.features_extracted || 0}</span>
                  </div>
                </div>

                {/* Filter Statistics - Show ALL statistics */}
                {viewData.filter_statistics && (
                  <div className="border-t border-gray-700/30 pt-3">
                    <h5 className="text-xs font-medium text-gray-300 mb-2">Filter Statistics</h5>
                    <div className="space-y-1">
                      {Object.entries(viewData.filter_statistics).map(([reason, count]) => (
                        <div key={reason} className="flex items-center justify-between text-xs">
                          <span className="text-gray-400 capitalize">{reason.replace('_', ' ')}</span>
                          <span className={`font-medium ${count > 0 ? 'text-gray-100' : 'text-gray-500'}`}>
                            {count}
                          </span>
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

      {/* Raw Session Data */}
      <div className="bg-gray-900/40 backdrop-blur-xl border border-gray-800/30 rounded-2xl shadow-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-100">Raw Session Data</h3>
          <button
            onClick={() => setShowRawSession(!showRawSession)}
            className="flex items-center gap-2 px-3 py-1 bg-gray-800/40 border border-gray-700/30 rounded-lg hover:bg-gray-800/60 transition-colors text-sm"
          >
            <span className="text-gray-300">{showRawSession ? 'Hide' : 'Show'} Raw Data</span>
            <span className="text-gray-400">{showRawSession ? '▼' : '▶'}</span>
          </button>
        </div>
        
        {showRawSession && session && (
          <div className="bg-gray-800/20 border border-gray-700/20 rounded-xl p-4">
            <pre className="text-xs text-gray-300 overflow-x-auto whitespace-pre-wrap">
              {renderCollapsibleJSON(session).map((line, index) => {
                if (line.includes('face_features (click to expand)')) {
                  return (
                    <div key={index} className="flex items-center">
                      <span className="text-gray-300">{line.replace('(click to expand)', '')}</span>
                      <button
                        onClick={() => setShowFaceFeatures(!showFaceFeatures)}
                        className="ml-2 px-2 py-1 bg-blue-500/20 border border-blue-500/30 rounded text-xs text-blue-300 hover:bg-blue-500/30 transition-colors"
                      >
                        {showFaceFeatures ? 'Collapse' : 'Expand'}
                      </button>
                    </div>
                  );
                }
                return <div key={index} className="text-gray-300">{line}</div>;
              })}
            </pre>
          </div>
        )}
      </div>

      {/* Session Videos */}
      <div className="bg-gray-900/40 backdrop-blur-xl border border-gray-800/30 rounded-2xl shadow-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-100">Session Videos</h3>
          <button
            onClick={() => setShowSessionVideos(!showSessionVideos)}
            className="flex items-center gap-2 px-3 py-1 bg-gray-800/40 border border-gray-700/30 rounded-lg hover:bg-gray-800/60 transition-colors text-sm"
          >
            <span className="text-gray-300">{showSessionVideos ? 'Hide' : 'Show'} Videos</span>
            <span className="text-gray-400">{showSessionVideos ? '▼' : '▶'}</span>
          </button>
        </div>
        
        {showSessionVideos && (
          <div className="bg-gray-800/20 border border-gray-700/20 rounded-xl p-4">
            {session?.session_info?.s3_cdn_urls && session.session_info.s3_cdn_urls.length > 0 ? (
              <div className="space-y-4">
                <div className="text-sm text-gray-400 mb-3">
                  Found {session.session_info.s3_cdn_urls.length} video(s) for this session:
                </div>
                {session.session_info.s3_cdn_urls.map((videoUrl, index) => {
                  // Check if URL contains special characters that might cause issues
                  const hasSpecialChars = videoUrl.includes('@') || videoUrl.includes('%') || videoUrl.includes('+');
                  const fileName = videoUrl.split('/').pop() || `video_${index + 1}.mp4`;
                  
                  return (
                    <div key={index} className="bg-gray-700/20 border border-gray-600/20 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-gray-200">Video {index + 1}</span>
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
                            className="w-full rounded-lg"
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
              <div className="text-center py-8">
                <span className="text-6xl text-gray-600 mb-4 block opacity-50">🎥</span>
                <p className="text-gray-400">No videos available in S3 bucket for this session</p>
                <p className="text-sm text-gray-500 mt-2">
                  {session?.session_info?.s3_cdn_urls === null ? 'Videos are null' : 'No s3_cdn_urls field found'}
                </p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Face Features Summary */}
      {session.face_features && session.face_features.length > 0 && (
        <div className="bg-gray-900/40 backdrop-blur-xl border border-gray-800/30 rounded-2xl shadow-lg p-6">
          <h3 className="text-lg font-semibold text-gray-100 mb-4">Face Features Summary</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-gray-800/20 border border-gray-700/20 rounded-xl p-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-100">{session.face_features.length}</div>
                <div className="text-sm text-gray-400">Total Faces</div>
              </div>
            </div>
            
            {session.metadata && session.metadata.length > 0 && (
              <>
                <div className="bg-gray-800/20 border border-gray-700/20 rounded-xl p-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-gray-100">
                      {Math.round(session.metadata.reduce((sum, meta) => sum + (meta.confidence || 0), 0) / session.metadata.length * 100)}%
                    </div>
                    <div className="text-sm text-gray-400">Avg Confidence</div>
                  </div>
                </div>
                
                <div className="bg-gray-800/20 border border-gray-700/20 rounded-xl p-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-gray-100">
                      {Math.round(session.metadata.reduce((sum, meta) => sum + (meta.blur_score || 0), 0) / session.metadata.length * 100)}%
                    </div>
                    <div className="text-sm text-gray-400">Avg Blur Score</div>
                  </div>
                </div>
                
                <div className="bg-gray-800/20 border border-gray-700/20 rounded-xl p-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-gray-100">
                      {new Set(session.metadata.map(meta => meta.view)).size}
                    </div>
                    <div className="text-sm text-gray-400">Unique Views</div>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Session Metadata */}
      {session.session_info && Object.keys(session.session_info).length > 0 && (
        <div className="bg-gray-900/40 backdrop-blur-xl border border-gray-800/30 rounded-2xl shadow-lg p-6">
          <h3 className="text-lg font-semibold text-gray-100 mb-4">Session Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Object.entries(session.session_info).map(([key, value]) => (
              <div key={key} className="flex items-center justify-between p-3 rounded-xl bg-gray-800/20 border border-gray-700/20">
                <span className="text-gray-400 text-sm capitalize">{key.replace('_', ' ')}</span>
                <span className="text-gray-100 text-sm font-medium">{String(value)}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default SessionDetails;
