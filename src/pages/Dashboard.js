import { useState, useEffect } from 'react';
import { useStore } from '../context/StoreContext';
import MetricCard from '../components/MetricCard';
import LiveSessions from '../components/LiveSessions';
import RecentVisitors from '../components/RecentVisitors';
import Tooltip from '../components/Tooltip';

const Dashboard = () => {
  const { getOverallAnalytics, connectionStatus, loading: storeLoading, currentStore } = useStore();
  const [overallAnalytics, setOverallAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Only load data when store is ready and currentStore is set
    if (!storeLoading && currentStore) {
      loadDashboardData();
    }
  }, [storeLoading, currentStore]);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const response = await getOverallAnalytics();
      
      setOverallAnalytics(response.overall_analytics);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
      // Set default values if API fails
      setOverallAnalytics({
        total_faces: 0,
        total_sessions: 0,
        unique_visitors: 0,
        quality_pass_rate: 0,
        detection_rate: 0,
        rejection_reasons: {}
      });
    } finally {
      setLoading(false);
    }
  };

  const metrics = [
    {
      title: 'TFE\'s',
      value: overallAnalytics?.total_faces || 0,
      icon: '👥',
      color: 'gray',
      change: '+12%',
      changeType: 'positive',
      tooltip: 'Total Face Embeddings - The total number of unique face vectors stored in the system database'
    },
    {
      title: 'Total Sessions',
      value: overallAnalytics?.total_sessions || 0,
      icon: '📹',
      color: 'gray',
      change: '+3',
      changeType: 'positive',
      tooltip: 'Total Sessions - The complete count of facial recognition sessions/recordings processed by the system'
    },
    {
      title: 'Unique Visitors',
      value: overallAnalytics?.unique_visitors || 0,
      icon: '👤',
      color: 'gray',
      change: '+8%',
      changeType: 'positive',
      tooltip: 'Unique Visitors - The number of distinct individuals identified and registered in the facial recognition system'
    },
    {
      title: 'Quality Pass Rate',
      value: `${overallAnalytics?.quality_pass_rate || 0}%`,
      icon: '📊',
      color: 'gray',
      change: '+2%',
      changeType: 'positive',
      tooltip: 'Quality Pass Rate - Percentage of face detections that meet the minimum quality standards for recognition'
    }
  ];

  const getStatusColor = (status) => {
    switch (status) {
      case 'connected':
      case 'online':
      case 'active':
        return 'text-green-300';
      case 'disconnected':
      case 'offline':
      case 'inactive':
        return 'text-red-300';
      default:
        return 'text-yellow-300';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'connected':
      case 'online':
      case 'active':
        return '● Connected';
      case 'disconnected':
      case 'offline':
      case 'inactive':
        return '● Disconnected';
      default:
        return '● Unknown';
    }
  };

  // Show loading if store is still loading or if we're loading dashboard data
  if (storeLoading || loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-400 mx-auto mb-4"></div>
          <p className="text-gray-400">
            {storeLoading ? 'Loading store configuration...' : 'Loading dashboard data...'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-100">Dashboard</h1>
          <p className="text-gray-400">System overview and real-time metrics</p>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-400">
          <span className="opacity-60">📊</span>
          <span>Real-time analytics</span>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {metrics.map((metric, index) => (
          <MetricCard key={index} {...metric} />
        ))}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Sessions - Takes 2 columns */}
        <div className="lg:col-span-2">
          <LiveSessions />
        </div>

        {/* Recent Visitors */}
        <div>
          <RecentVisitors />
        </div>
      </div>

      {/* Quality Metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-gray-900/40 backdrop-blur-xl border border-gray-800/30 rounded-2xl shadow-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-semibold text-gray-100">Quality Overview</h3>
              <Tooltip text="Quality Overview - Real-time analytics showing face detection accuracy and quality metrics for the recognition system">
                <span className="text-gray-500 hover:text-gray-300 transition-colors cursor-help text-sm">
                  ℹ️
                </span>
              </Tooltip>
            </div>
            <span className="opacity-60">📈</span>
          </div>
          {overallAnalytics && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-gray-300">Detection Rate</span>
                  <Tooltip text="Detection Rate - Percentage of successful face detections from all processed frames or images">
                    <span className="text-gray-500 hover:text-gray-300 transition-colors cursor-help text-xs">
                      ℹ️
                    </span>
                  </Tooltip>
                </div>
                <span className="text-gray-100 font-semibold">
                  {overallAnalytics.detection_rate}%
                </span>
              </div>
              <div className="w-full bg-gray-800 rounded-full h-2">
                <div 
                  className="bg-blue-400 h-2 rounded-full transition-all duration-500"
                  style={{ width: `${overallAnalytics.detection_rate}%` }}
                ></div>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-gray-300">Quality Pass Rate</span>
                  <Tooltip text="Quality Pass Rate - Percentage of detected faces that meet the quality threshold for reliable recognition">
                    <span className="text-gray-500 hover:text-gray-300 transition-colors cursor-help text-xs">
                      ℹ️
                    </span>
                  </Tooltip>
                </div>
                <span className="text-gray-100 font-semibold">
                  {overallAnalytics.quality_pass_rate}%
                </span>
              </div>
              <div className="w-full bg-gray-800 rounded-full h-2">
                <div 
                  className="bg-green-400 h-2 rounded-full transition-all duration-500"
                  style={{ width: `${overallAnalytics.quality_pass_rate}%` }}
                ></div>
              </div>

              <div className="pt-4 border-t border-gray-700/30">
                <div className="flex items-center gap-2 mb-3">
                  <h4 className="text-sm font-medium text-gray-300">Rejection Reasons</h4>
                  <Tooltip text="Rejection Reasons - Breakdown of why certain face detections were rejected during quality assessment">
                    <span className="text-gray-500 hover:text-gray-300 transition-colors cursor-help text-xs">
                      ℹ️
                    </span>
                  </Tooltip>
                </div>
                <div className="space-y-2">
                  {Object.entries(overallAnalytics.rejection_reasons || {}).map(([reason, count]) => (
                    <div key={reason} className="flex items-center justify-between text-sm">
                      <span className="text-gray-400 capitalize">{reason.replace('_', ' ')}</span>
                      <span className="text-gray-100 font-medium">{count}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="bg-gray-900/40 backdrop-blur-xl border border-gray-800/30 rounded-2xl shadow-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-semibold text-gray-100">System Status</h3>
              <Tooltip text="System Status - Real-time health monitoring of database connectivity, API endpoints, and processing services">
                <span className="text-gray-500 hover:text-gray-300 transition-colors cursor-help text-sm">
                  ℹ️
                </span>
              </Tooltip>
            </div>
            <span className="opacity-60">🖥️</span>
          </div>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-gray-300">Database Status</span>
                <Tooltip text="Database Status - ChromaDB connection and data availability">
                  <span className="text-gray-500 hover:text-gray-300 transition-colors cursor-help text-xs">
                    ℹ️
                  </span>
                </Tooltip>
              </div>
              <span className={getStatusColor(connectionStatus.database)}>
                {getStatusText(connectionStatus.database)}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-gray-300">API Status</span>
                <Tooltip text="API Status - Flask backend server connectivity and response health">
                  <span className="text-gray-500 hover:text-gray-300 transition-colors cursor-help text-xs">
                    ℹ️
                  </span>
                </Tooltip>
              </div>
              <span className={getStatusColor(connectionStatus.api)}>
                {getStatusText(connectionStatus.api)}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-gray-300">Processing</span>
                <Tooltip text="Processing Status - Face recognition pipeline and analysis engine health">
                  <span className="text-gray-500 hover:text-gray-300 transition-colors cursor-help text-xs">
                    ℹ️
                  </span>
                </Tooltip>
              </div>
              <span className={getStatusColor(connectionStatus.processing)}>
                {getStatusText(connectionStatus.processing)}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
