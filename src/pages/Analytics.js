import { useState, useEffect } from 'react';
import { useStore } from '../context/StoreContext';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';
import { formatDate } from '../utils/timeUtils';

const Analytics = () => {
  const { getDailyMetrics, getQualityMetrics, getSystemStats, getBusinessAnalytics } = useStore();
  const [dailyMetrics, setDailyMetrics] = useState(null);
  const [qualityMetrics, setQualityMetrics] = useState(null);
  const [systemStats, setSystemStats] = useState(null);
  const [businessAnalytics, setBusinessAnalytics] = useState(null);
  const [selectedDate, setSelectedDate] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAnalyticsData();
  }, []);

  const loadAnalyticsData = async () => {
    try {
      setLoading(true);
      const [daily, quality, stats, business] = await Promise.all([
        getDailyMetrics(),
        getQualityMetrics(),
        getSystemStats(),
        getBusinessAnalytics()
      ]);
      
      setDailyMetrics(daily.daily_metrics);
      setQualityMetrics(quality.quality_metrics);
      setSystemStats(stats.system_stats);
      setBusinessAnalytics(business.business_analytics);
    } catch (error) {
      console.error('Error loading analytics data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Get available dates from business analytics
  const getAvailableDates = () => {
    if (!businessAnalytics?.daily_records) return [];
    return [...new Set(businessAnalytics.daily_records.map(record => record.date))].sort();
  };

  // Get analytics for selected date
  const getDateAnalytics = (date) => {
    if (!businessAnalytics?.daily_records) return null;
    
    const dayRecords = businessAnalytics.daily_records.filter(record => record.date === date);
    if (dayRecords.length === 0) return null;

    const uniqueCustomers = new Set(dayRecords.map(record => record.person_id));
    const totalVisits = dayRecords.reduce((sum, record) => sum + record.daily_visit_count, 0);
    const repeatCustomers = dayRecords.filter(record => record.is_repeat_customer).length;
    const frequentVisitors = dayRecords.filter(record => record.daily_visit_count > 1).length;

    const genderDistribution = {
      female: dayRecords.filter(record => record.gender === 0).length,
      male: dayRecords.filter(record => record.gender === 1).length,
      unknown: dayRecords.filter(record => record.gender === -1).length
    };

    // Age group distribution
    const ageGroups = {
      'Babies (0-2)': 0,
      'Children (3-16)': 0,
      'Young Adults (17-30)': 0,
      'Middle-aged Adults (31-45)': 0,
      'Old Adults (Above 45)': 0,
      'Unknown': 0
    };

    dayRecords.forEach(record => {
      const age = record.age;
      if (!age || age < 0) {
        ageGroups['Unknown']++;
      } else if (age >= 0 && age <= 2) {
        ageGroups['Babies (0-2)']++;
      } else if (age >= 3 && age <= 16) {
        ageGroups['Children (3-16)']++;
      } else if (age >= 17 && age <= 30) {
        ageGroups['Young Adults (17-30)']++;
      } else if (age >= 31 && age <= 45) {
        ageGroups['Middle-aged Adults (31-45)']++;
      } else if (age > 45) {
        ageGroups['Old Adults (Above 45)']++;
      } else {
        ageGroups['Unknown']++;
      }
    });

    return {
      date,
      uniqueCustomers: uniqueCustomers.size,
      totalVisits,
      repeatCustomers,
      frequentVisitors,
      genderDistribution,
      ageGroups,
      customerDetails: dayRecords
    };
  };

  // Calendar component
  const Calendar = () => {
    const availableDates = getAvailableDates();
    const currentDate = new Date();
    const currentMonth = currentDate.getMonth();
    const currentYear = currentDate.getFullYear();
    
    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
    const firstDayOfMonth = new Date(currentYear, currentMonth, 1).getDay();
    
    const calendarDays = [];
    for (let i = 0; i < firstDayOfMonth; i++) {
      calendarDays.push(null);
    }
    
    for (let day = 1; day <= daysInMonth; day++) {
      const dateString = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      const hasData = availableDates.includes(dateString);
      calendarDays.push({ day, date: dateString, hasData });
    }

    return (
      <div className="bg-gray-900/40 backdrop-blur-xl border border-gray-800/30 rounded-2xl shadow-lg p-6">
        <h3 className="text-lg font-semibold text-gray-100 mb-4">Business Analytics Calendar</h3>
        <div className="grid grid-cols-7 gap-1 mb-2">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
            <div key={day} className="text-center text-sm text-gray-400 p-2">
              {day}
            </div>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-1">
          {calendarDays.map((dayData, index) => (
            <div
              key={index}
              className={`p-2 text-center text-sm rounded-lg cursor-pointer transition-all ${
                dayData === null
                  ? 'text-gray-600'
                  : dayData.hasData
                  ? 'bg-blue-500/20 text-blue-300 hover:bg-blue-500/30 border border-blue-500/30'
                  : 'text-gray-500 hover:bg-gray-800/30'
              } ${selectedDate === dayData?.date ? 'ring-2 ring-blue-500' : ''}`}
              onClick={() => dayData?.hasData && setSelectedDate(dayData.date)}
            >
              {dayData?.day || ''}
            </div>
          ))}
        </div>
      </div>
    );
  };

  // Business Analytics Details
  const BusinessAnalyticsDetails = () => {
    if (!selectedDate) {
      return (
        <div className="bg-gray-900/40 backdrop-blur-xl border border-gray-800/30 rounded-2xl shadow-lg p-6">
          <h3 className="text-lg font-semibold text-gray-100 mb-4">Business Analytics</h3>
          <p className="text-gray-400 text-center py-8">Select a date from the calendar to view business analytics</p>
        </div>
      );
    }

    const analytics = getDateAnalytics(selectedDate);
    if (!analytics) return null;

    return (
      <div className="bg-gray-900/40 backdrop-blur-xl border border-gray-800/30 rounded-2xl shadow-lg p-6">
        <h3 className="text-lg font-semibold text-gray-100 mb-4">
          Business Analytics - {formatDate(selectedDate)}
        </h3>
        
        {/* Key Metrics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="text-center p-4 bg-gray-800/20 rounded-xl">
            <p className="text-2xl font-bold text-gray-100">{analytics.uniqueCustomers}</p>
            <p className="text-sm text-gray-400">👥 Unique Customers</p>
          </div>
          <div className="text-center p-4 bg-gray-800/20 rounded-xl">
            <p className="text-2xl font-bold text-gray-100">{analytics.totalVisits}</p>
            <p className="text-sm text-gray-400">🚶 Total Visits</p>
          </div>
          <div className="text-center p-4 bg-gray-800/20 rounded-xl">
            <p className="text-2xl font-bold text-gray-100">{analytics.repeatCustomers}</p>
            <p className="text-sm text-gray-400">🔄 Repeat Customers</p>
          </div>
          <div className="text-center p-4 bg-gray-800/20 rounded-xl">
            <p className="text-2xl font-bold text-gray-100">{analytics.frequentVisitors}</p>
            <p className="text-sm text-gray-400">⚡ Frequent Visitors</p>
          </div>
        </div>

        {/* Gender Distribution */}
        <div className="mb-6">
          <h4 className="text-md font-semibold text-gray-100 mb-3">👫 Gender Distribution</h4>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-gray-300">Female</span>
              <span className="text-gray-100 font-medium">{analytics.genderDistribution.female} customers</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-300">Male</span>
              <span className="text-gray-100 font-medium">{analytics.genderDistribution.male} customers</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-300">Unknown</span>
              <span className="text-gray-100 font-medium">{analytics.genderDistribution.unknown} customers</span>
            </div>
          </div>
        </div>

        {/* Age Group Distribution */}
        <div className="mb-6">
          <h4 className="text-md font-semibold text-gray-100 mb-3">👴 Age Group Distribution</h4>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-gray-300">Babies (0-2)</span>
              <span className="text-gray-100 font-medium">{analytics.ageGroups['Babies (0-2)']} customers</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-300">Children (3-16)</span>
              <span className="text-gray-100 font-medium">{analytics.ageGroups['Children (3-16)']} customers</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-300">Young Adults (17-30)</span>
              <span className="text-gray-100 font-medium">{analytics.ageGroups['Young Adults (17-30)']} customers</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-300">Middle-aged Adults (31-45)</span>
              <span className="text-gray-100 font-medium">{analytics.ageGroups['Middle-aged Adults (31-45)']} customers</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-300">Old Adults (Above 45)</span>
              <span className="text-gray-100 font-medium">{analytics.ageGroups['Old Adults (Above 45)']} customers</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-300">Unknown</span>
              <span className="text-gray-100 font-medium">{analytics.ageGroups['Unknown']} customers</span>
            </div>
          </div>
        </div>

        {/* Customer Details */}
        <div>
          <h4 className="text-md font-semibold text-gray-100 mb-3">📋 Customer Details</h4>
          <div className="space-y-3 max-h-64 overflow-y-auto">
            {analytics.customerDetails.map((customer, index) => (
              <div key={index} className="bg-gray-800/20 rounded-lg p-3">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-gray-100 font-medium">{customer.person_id}</span>
                  <span className={`text-xs px-2 py-1 rounded ${
                    customer.is_repeat_customer 
                      ? 'bg-green-500/20 text-green-300' 
                      : 'bg-blue-500/20 text-blue-300'
                  }`}>
                    {customer.is_repeat_customer ? 'Repeat' : 'New'}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-sm text-gray-400">
                  <div>Age: {customer.age}</div>
                  <div>Gender: {customer.gender === 0 ? 'Female' : customer.gender === 1 ? 'Male' : 'Unknown'}</div>
                  <div>Visits: {customer.daily_visit_count}</div>
                  <div>Sessions: {customer.session_names.length}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  // Prepare chart data
  const chartData = dailyMetrics?.daily_face_counts?.map((count, index) => ({
    day: `Day ${index + 1}`,
    faces: count,
    sessions: dailyMetrics?.daily_session_counts?.[index] || 0,
    quality: dailyMetrics?.daily_quality_pass_counts?.[index] || 0
  })) || [];

  const qualityData = qualityMetrics?.rejection_reasons ? 
    Object.entries(qualityMetrics.rejection_reasons).map(([reason, count]) => ({
      name: reason.replace('_', ' '),
      value: count
    })) : [];

  const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'];

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
          <h1 className="text-2xl font-bold text-gray-100">Analytics</h1>
          <p className="text-gray-400">Comprehensive insights and performance metrics</p>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-400">
          <span className="opacity-60">📊</span>
          <span>Real-time data</span>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-gray-900/40 backdrop-blur-xl border border-gray-800/30 rounded-2xl shadow-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-400">Total Faces</p>
              <p className="text-3xl font-bold text-gray-100">{systemStats?.total_faces?.toLocaleString() || 0}</p>
            </div>
            <div className="p-3 rounded-xl bg-blue-500/10 border border-blue-500/20">
              <span className="text-blue-300 text-xl opacity-80">👥</span>
            </div>
          </div>
        </div>

        <div className="bg-gray-900/40 backdrop-blur-xl border border-gray-800/30 rounded-2xl shadow-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-400">Quality Rate</p>
              <p className="text-3xl font-bold text-gray-100">{qualityMetrics?.quality_pass_rate_percent || 0}%</p>
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
              <p className="text-3xl font-bold text-gray-100">{qualityMetrics?.detection_rate_percent || 0}%</p>
            </div>
            <div className="p-3 rounded-xl bg-purple-500/10 border border-purple-500/20">
              <span className="text-purple-300 text-xl opacity-80">🎯</span>
            </div>
          </div>
        </div>

        <div className="bg-gray-900/40 backdrop-blur-xl border border-gray-800/30 rounded-2xl shadow-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-400">Unique Visitors</p>
              <p className="text-3xl font-bold text-gray-100">{systemStats?.unique_person_ids?.toLocaleString() || 0}</p>
            </div>
            <div className="p-3 rounded-xl bg-orange-500/10 border border-orange-500/20">
              <span className="text-orange-300 text-xl opacity-80">👤</span>
            </div>
          </div>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Daily Trends */}
        <div className="bg-gray-900/40 backdrop-blur-xl border border-gray-800/30 rounded-2xl shadow-lg p-6">
          <h3 className="text-lg font-semibold text-gray-100 mb-4">Daily Trends</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="day" stroke="#9CA3AF" />
              <YAxis stroke="#9CA3AF" />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#1F2937', 
                  border: '1px solid #374151',
                  borderRadius: '8px',
                  color: '#F9FAFB'
                }}
              />
              <Line type="monotone" dataKey="faces" stroke="#3B82F6" strokeWidth={2} />
              <Line type="monotone" dataKey="sessions" stroke="#10B981" strokeWidth={2} />
              <Line type="monotone" dataKey="quality" stroke="#F59E0B" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Rejection Reasons */}
        <div className="bg-gray-900/40 backdrop-blur-xl border border-gray-800/30 rounded-2xl shadow-lg p-6">
          <h3 className="text-lg font-semibold text-gray-100 mb-4">Rejection Reasons</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={qualityData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {qualityData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#1F2937', 
                  border: '1px solid #374151',
                  borderRadius: '8px',
                  color: '#F9FAFB'
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Quality Metrics Details */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-gray-900/40 backdrop-blur-xl border border-gray-800/30 rounded-2xl shadow-lg p-6">
          <h3 className="text-lg font-semibold text-gray-100 mb-4">Quality Overview</h3>
          <div className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-gray-300">Detection Rate</span>
                <span className="text-gray-100 font-semibold">{qualityMetrics?.detection_rate_percent}%</span>
              </div>
              <div className="w-full bg-gray-800 rounded-full h-2">
                <div 
                  className="bg-blue-400 h-2 rounded-full transition-all duration-500"
                  style={{ width: `${qualityMetrics?.detection_rate_percent || 0}%` }}
                ></div>
              </div>
            </div>
            
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-gray-300">Quality Pass Rate</span>
                <span className="text-gray-100 font-semibold">{qualityMetrics?.quality_pass_rate_percent}%</span>
              </div>
              <div className="w-full bg-gray-800 rounded-full h-2">
                <div 
                  className="bg-green-400 h-2 rounded-full transition-all duration-500"
                  style={{ width: `${qualityMetrics?.quality_pass_rate_percent || 0}%` }}
                ></div>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-gray-900/40 backdrop-blur-xl border border-gray-800/30 rounded-2xl shadow-lg p-6">
          <h3 className="text-lg font-semibold text-gray-100 mb-4">System Performance</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-gray-300">Total Sessions</span>
              <span className="text-gray-100 font-semibold">{systemStats?.total_sessions?.toLocaleString() || 0}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-300">Average Faces/Session</span>
              <span className="text-gray-100 font-semibold">
                {systemStats?.total_faces && systemStats?.total_sessions 
                  ? Math.round(systemStats.total_faces / systemStats.total_sessions) 
                  : 0}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-300">Success Rate</span>
              <span className="text-gray-100 font-semibold">
                {qualityMetrics?.quality_pass_rate_percent && qualityMetrics?.detection_rate_percent
                  ? Math.round((qualityMetrics.quality_pass_rate_percent * qualityMetrics.detection_rate_percent) / 100)
                  : 0}%
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Business Analytics Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Calendar />
        <BusinessAnalyticsDetails />
      </div>
    </div>
  );
};

export default Analytics;
