import { useState, useEffect } from 'react';
import { useStore } from '../context/StoreContext';
import MetricCard from '../components/MetricCard';
import LiveSessions from '../components/LiveSessions';
import RecentVisitors from '../components/RecentVisitors';

const Dashboard = () => {
  const { getSystemStats, getQualityMetrics, getDailyMetrics, connectionStatus } = useStore();
  const [systemStats, setSystemStats] = useState(null);
  const [qualityMetrics, setQualityMetrics] = useState(null);
  const [dailyMetrics, setDailyMetrics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const [stats, quality, daily] = await Promise.all([
        getSystemStats(),
        getQualityMetrics(),
        getDailyMetrics()
      ]);
      
      setSystemStats(stats.system_stats);
      setQualityMetrics(quality.quality_metrics);
      setDailyMetrics(daily.daily_metrics);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
      // Set default values if API fails
      setSystemStats({
        total_faces: 0,
        total_sessions: 0,
        unique_person_ids: 0
      });
      setQualityMetrics({
        quality_pass_rate_percent: 0,
        detection_rate_percent: 0,
        rejection_reasons: {}
      });
      setDailyMetrics({
        daily_face_counts: [],
        daily_session_counts: [],
        daily_quality_pass_counts: []
      });
    } finally {
      setLoading(false);
    }
  };

  const metrics = [
    {
      title: 'Total Faces',
      value: systemStats?.total_faces || 0,
      icon: '👥',
      color: 'gray',
      change: '+12%',
      changeType: 'positive'
    },
    {
      title: 'Active Sessions',
      value: systemStats?.total_sessions || 0,
      icon: '📹',
      color: 'gray',
      change: '+3',
      changeType: 'positive'
    },
    {
      title: 'Unique Visitors',
      value: systemStats?.unique_person_ids || 0,
      icon: '👤',
      color: 'gray',
      change: '+8%',
      changeType: 'positive'
    },
    {
      title: 'Quality Score',
      value: `${qualityMetrics?.quality_pass_rate_percent || 0}%`,
      icon: '📊',
      color: 'gray',
      change: '+2%',
      changeType: 'positive'
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

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-400"></div>
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
          <span className="opacity-60">●</span>
          <span>Live updates enabled</span>
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
        {/* Live Sessions - Takes 2 columns */}
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
            <h3 className="text-lg font-semibold text-gray-100">Quality Overview</h3>
            <span className="opacity-60">📈</span>
          </div>
          {qualityMetrics && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-gray-300">Detection Rate</span>
                <span className="text-gray-100 font-semibold">
                  {qualityMetrics.detection_rate_percent}%
                </span>
              </div>
              <div className="w-full bg-gray-800 rounded-full h-2">
                <div 
                  className="bg-blue-400 h-2 rounded-full transition-all duration-500"
                  style={{ width: `${qualityMetrics.detection_rate_percent}%` }}
                ></div>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-gray-300">Quality Pass Rate</span>
                <span className="text-gray-100 font-semibold">
                  {qualityMetrics.quality_pass_rate_percent}%
                </span>
              </div>
              <div className="w-full bg-gray-800 rounded-full h-2">
                <div 
                  className="bg-green-400 h-2 rounded-full transition-all duration-500"
                  style={{ width: `${qualityMetrics.quality_pass_rate_percent}%` }}
                ></div>
              </div>

              <div className="pt-4 border-t border-gray-700/30">
                <h4 className="text-sm font-medium text-gray-300 mb-3">Rejection Reasons</h4>
                <div className="space-y-2">
                  {Object.entries(qualityMetrics.rejection_reasons || {}).map(([reason, count]) => (
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
            <h3 className="text-lg font-semibold text-gray-100">System Status</h3>
            <span className="opacity-60">🖥️</span>
          </div>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-gray-300">Database Status</span>
              <span className={getStatusColor(connectionStatus.database)}>
                {getStatusText(connectionStatus.database)}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-300">API Status</span>
              <span className={getStatusColor(connectionStatus.api)}>
                {getStatusText(connectionStatus.api)}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-300">Processing</span>
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
