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
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const [currentPage, setCurrentPage] = useState(0);
  const [daysPerPage] = useState(10);

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

    const goToPreviousMonth = () => {
      if (currentMonth === 0) {
        setCurrentMonth(11);
        setCurrentYear(currentYear - 1);
      } else {
        setCurrentMonth(currentMonth - 1);
      }
    };

    const goToNextMonth = () => {
      const now = new Date();
      const nextMonth = currentMonth + 1;
      const nextYear = currentYear;
      
      // Don't allow going to future months
      if (nextYear > now.getFullYear() || (nextYear === now.getFullYear() && nextMonth > now.getMonth())) {
        return;
      }
      
      if (nextMonth > 11) {
        setCurrentMonth(0);
        setCurrentYear(currentYear + 1);
      } else {
        setCurrentMonth(nextMonth);
      }
    };

    const goToCurrentMonth = () => {
      const now = new Date();
      setCurrentMonth(now.getMonth());
      setCurrentYear(now.getFullYear());
    };

    const monthNames = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];

    return (
      <div className="bg-gray-900/40 backdrop-blur-xl border border-gray-800/30 rounded-2xl shadow-lg p-6">
        {/* Calendar Header with Navigation */}
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-100">Business Analytics Calendar</h3>
          <div className="flex items-center gap-2">
            <button
              onClick={goToPreviousMonth}
              className="p-2 rounded-lg bg-gray-800/40 border border-gray-700/30 hover:bg-gray-800/60 transition-colors"
            >
              <span className="text-gray-300">◀</span>
            </button>
            <div className="text-center min-w-[120px]">
              <div className="text-sm font-medium text-gray-100">
                {monthNames[currentMonth]} {currentYear}
              </div>
            </div>
            <button
              onClick={goToNextMonth}
              className="p-2 rounded-lg bg-gray-800/40 border border-gray-700/30 hover:bg-gray-800/60 transition-colors"
            >
              <span className="text-gray-300">▶</span>
            </button>
            <button
              onClick={goToCurrentMonth}
              className="px-3 py-1 rounded-lg bg-blue-500/20 border border-blue-500/30 hover:bg-blue-500/30 transition-colors text-xs text-blue-300"
            >
              Today
            </button>
          </div>
        </div>

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
        
        {/* Calendar Footer with Info */}
        <div className="mt-4 pt-4 border-t border-gray-700/30">
          <div className="flex items-center justify-between text-xs text-gray-400">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 rounded bg-blue-500/20 border border-blue-500/30"></div>
                <span>Has Data</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 rounded bg-gray-800/30"></div>
                <span>No Data</span>
              </div>
            </div>
            <div className="text-right">
              <div>Available dates: {availableDates.length}</div>
              <div>Date range: {availableDates.length > 0 ? `${availableDates[0]} to ${availableDates[availableDates.length - 1]}` : 'No data'}</div>
            </div>
          </div>
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

  // Prepare daily customer data with gender distribution
  const prepareDailyCustomerData = () => {
    if (!businessAnalytics?.daily_records) return [];
    
    // Group records by date
    const dailyGroups = {};
    businessAnalytics.daily_records.forEach(record => {
      const date = record.date;
      if (!dailyGroups[date]) {
        dailyGroups[date] = [];
      }
      dailyGroups[date].push(record);
    });

    // Convert to chart data format
    return Object.entries(dailyGroups).map(([date, records]) => {
      const uniqueCustomers = new Set(records.map(record => record.person_id));
      const genderCounts = {
        male: 0,
        female: 0,
        unknown: 0
      };

      // Count unique customers by gender
      uniqueCustomers.forEach(personId => {
        const customerRecord = records.find(record => record.person_id === personId);
        if (customerRecord) {
          if (customerRecord.gender === 1) genderCounts.male++;
          else if (customerRecord.gender === 0) genderCounts.female++;
          else genderCounts.unknown++;
        }
      });

      return {
        date: date,
        day: new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        totalCustomers: uniqueCustomers.size,
        male: genderCounts.male,
        female: genderCounts.female,
        unknown: genderCounts.unknown
      };
    }).sort((a, b) => new Date(a.date) - new Date(b.date));
  };

  const dailyCustomerData = prepareDailyCustomerData();

  // Pagination logic for daily customer data
  const totalPages = Math.ceil(dailyCustomerData.length / daysPerPage);
  const startIndex = currentPage * daysPerPage;
  const endIndex = startIndex + daysPerPage;
  const currentPageData = dailyCustomerData.slice(startIndex, endIndex);

  // Navigation functions
  const goToNextPage = () => {
    if (currentPage < totalPages - 1) {
      setCurrentPage(currentPage + 1);
    }
  };

  const goToPreviousPage = () => {
    if (currentPage > 0) {
      setCurrentPage(currentPage - 1);
    }
  };

  const goToLatestPage = () => {
    setCurrentPage(0); // Latest data is at page 0
  };

  // Reset to latest page when data changes
  useEffect(() => {
    if (dailyCustomerData.length > 0) {
      setCurrentPage(0);
    }
  }, [dailyCustomerData.length]);

  console.log('Daily Metrics:', dailyMetrics);
  console.log('Chart Data:', chartData);

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
          {chartData.length === 0 ? (
            <p className="text-gray-400 text-center py-8">No data available for daily trends.</p>
          ) : (
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
          )}
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

      {/* Daily Customer Count with Gender Distribution */}
      <div className="bg-gray-900/40 backdrop-blur-xl border border-gray-800/30 rounded-2xl shadow-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-100">Daily Customer Count</h3>
            {dailyCustomerData.length > 0 && (
              <p className="text-sm text-gray-400 mt-1">
                Showing {currentPageData.length} of {dailyCustomerData.length} days 
                (Page {currentPage + 1} of {totalPages})
              </p>
            )}
          </div>
          <div className="flex items-center gap-4 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded bg-blue-500"></div>
              <span className="text-gray-300">Male</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded bg-pink-500"></div>
              <span className="text-gray-300">Female</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded bg-gray-500"></div>
              <span className="text-gray-300">Unknown</span>
            </div>
          </div>
        </div>

        {/* Navigation Controls */}
        {dailyCustomerData.length > daysPerPage && (
          <div className="flex items-center justify-between mb-4 p-3 bg-gray-800/20 rounded-lg">
            <div className="flex items-center gap-2">
              <button
                onClick={goToPreviousPage}
                disabled={currentPage === 0}
                className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                  currentPage === 0
                    ? 'bg-gray-700/30 text-gray-500 cursor-not-allowed'
                    : 'bg-gray-700/50 text-gray-300 hover:bg-gray-700/70'
                }`}
              >
                ← Previous 10 Days
              </button>
              <button
                onClick={goToLatestPage}
                className="px-3 py-1 rounded-lg text-sm font-medium bg-blue-500/20 text-blue-300 hover:bg-blue-500/30 transition-colors"
              >
                Latest
              </button>
            </div>
            
            <div className="text-sm text-gray-400">
              {currentPageData.length > 0 && (
                <>
                  {currentPageData[currentPageData.length - 1].day} to {currentPageData[0].day}
                </>
              )}
            </div>
            
            <button
              onClick={goToNextPage}
              disabled={currentPage === totalPages - 1}
              className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                currentPage === totalPages - 1
                  ? 'bg-gray-700/30 text-gray-500 cursor-not-allowed'
                  : 'bg-gray-700/50 text-gray-300 hover:bg-gray-700/70'
              }`}
            >
              Next 10 Days →
            </button>
          </div>
        )}
        
        {dailyCustomerData.length === 0 ? (
          <p className="text-gray-400 text-center py-8">No customer data available for daily analysis.</p>
        ) : (
          <div className="space-y-4">
            <ResponsiveContainer width="100%" height={400}>
              <BarChart 
                data={currentPageData} 
                margin={{ 
                  top: 20, 
                  right: 30, 
                  left: 20, 
                  bottom: 60
                }}
                barCategoryGap="10%"
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis 
                  dataKey="day" 
                  stroke="#9CA3AF"
                  fontSize={12}
                  angle={-45}
                  textAnchor="end"
                  height={60}
                />
                <YAxis stroke="#9CA3AF" />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#1F2937', 
                    border: '1px solid #374151',
                    borderRadius: '8px',
                    color: '#F9FAFB'
                  }}
                  formatter={(value, name) => [
                    value, 
                    name === 'male' ? 'Male' : name === 'female' ? 'Female' : 'Unknown'
                  ]}
                  labelFormatter={(label) => `Date: ${label}`}
                />
                <Bar dataKey="male" stackId="gender" fill="#3B82F6" name="male" />
                <Bar dataKey="female" stackId="gender" fill="#EC4899" name="female" />
                <Bar dataKey="unknown" stackId="gender" fill="#6B7280" name="unknown" />
              </BarChart>
            </ResponsiveContainer>
            
            {/* Current Page Data Table */}
            <div className="mt-4">
              <h4 className="text-sm font-medium text-gray-300 mb-2">Current Page Details</h4>
              <div className="max-h-64 overflow-y-auto bg-gray-800/20 rounded-lg">
                <table className="w-full text-sm">
                  <thead className="sticky top-0 bg-gray-800/40">
                    <tr className="border-b border-gray-700/30">
                      <th className="text-left p-3 text-gray-300">Date</th>
                      <th className="text-center p-3 text-gray-300">Total</th>
                      <th className="text-center p-3 text-gray-300">Male</th>
                      <th className="text-center p-3 text-gray-300">Female</th>
                      <th className="text-center p-3 text-gray-300">Unknown</th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentPageData.map((day, index) => (
                      <tr key={index} className="border-b border-gray-700/20 hover:bg-gray-800/10">
                        <td className="p-3 text-gray-300">{day.day}</td>
                        <td className="p-3 text-center text-gray-100 font-medium">{day.totalCustomers}</td>
                        <td className="p-3 text-center text-blue-300">{day.male}</td>
                        <td className="p-3 text-center text-pink-300">{day.female}</td>
                        <td className="p-3 text-center text-gray-400">{day.unknown}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
        
        {/* Summary Stats */}
        {dailyCustomerData.length > 0 && (
          <div className="mt-4 pt-4 border-t border-gray-700/30">
            {/* Current 10-Day Period Summary */}
            <div className="mb-6">
              <h4 className="text-sm font-medium text-gray-300 mb-3 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                Current 10-Day Period Summary
              </h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div className="text-center p-3 bg-gray-800/20 rounded-lg">
                  <p className="text-gray-400">Days in Period</p>
                  <p className="text-lg font-semibold text-gray-100">{currentPageData.length}</p>
                </div>
                <div className="text-center p-3 bg-gray-800/20 rounded-lg">
                  <p className="text-gray-400">Total Customers</p>
                  <p className="text-lg font-semibold text-gray-100">
                    {currentPageData.reduce((sum, day) => sum + day.totalCustomers, 0)}
                  </p>
                </div>
                <div className="text-center p-3 bg-gray-800/20 rounded-lg">
                  <p className="text-gray-400">Avg Daily</p>
                  <p className="text-lg font-semibold text-gray-100">
                    {currentPageData.length > 0 ? Math.round(currentPageData.reduce((sum, day) => sum + day.totalCustomers, 0) / currentPageData.length) : 0}
                  </p>
                </div>
                <div className="text-center p-3 bg-gray-800/20 rounded-lg">
                  <p className="text-gray-400">Peak Day</p>
                  <p className="text-lg font-semibold text-gray-100">
                    {currentPageData.length > 0 ? Math.max(...currentPageData.map(day => day.totalCustomers)) : 0}
                  </p>
                </div>
              </div>
              
              {/* Gender Breakdown for Current Period */}
              <div className="mt-3 grid grid-cols-3 gap-4 text-sm">
                <div className="text-center p-2 bg-blue-500/10 rounded-lg">
                  <p className="text-blue-300 font-medium">
                    {currentPageData.reduce((sum, day) => sum + day.male, 0)} Male
                  </p>
                </div>
                <div className="text-center p-2 bg-pink-500/10 rounded-lg">
                  <p className="text-pink-300 font-medium">
                    {currentPageData.reduce((sum, day) => sum + day.female, 0)} Female
                  </p>
                </div>
                <div className="text-center p-2 bg-gray-500/10 rounded-lg">
                  <p className="text-gray-300 font-medium">
                    {currentPageData.reduce((sum, day) => sum + day.unknown, 0)} Unknown
                  </p>
                </div>
              </div>
            </div>
            
            {/* Overall Statistics */}
            <div className="pt-4 border-t border-gray-700/20">
              <h4 className="text-sm font-medium text-gray-300 mb-3 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-green-500"></span>
                Overall Statistics (All Time)
              </h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div className="text-center p-3 bg-gray-800/20 rounded-lg">
                  <p className="text-gray-400">Total Days</p>
                  <p className="text-lg font-semibold text-gray-100">{dailyCustomerData.length}</p>
                </div>
                <div className="text-center p-3 bg-gray-800/20 rounded-lg">
                  <p className="text-gray-400">Total Customers</p>
                  <p className="text-lg font-semibold text-gray-100">
                    {dailyCustomerData.reduce((sum, day) => sum + day.totalCustomers, 0)}
                  </p>
                </div>
                <div className="text-center p-3 bg-gray-800/20 rounded-lg">
                  <p className="text-gray-400">Overall Avg Daily</p>
                  <p className="text-lg font-semibold text-gray-100">
                    {Math.round(dailyCustomerData.reduce((sum, day) => sum + day.totalCustomers, 0) / dailyCustomerData.length)}
                  </p>
                </div>
                <div className="text-center p-3 bg-gray-800/20 rounded-lg">
                  <p className="text-gray-400">All-Time Peak</p>
                  <p className="text-lg font-semibold text-gray-100">
                    {Math.max(...dailyCustomerData.map(day => day.totalCustomers))}
                  </p>
                </div>
              </div>
              
              {/* Overall Gender Breakdown */}
              <div className="mt-3 grid grid-cols-3 gap-4 text-sm">
                <div className="text-center p-2 bg-blue-500/10 rounded-lg">
                  <p className="text-blue-300 font-medium">
                    {dailyCustomerData.reduce((sum, day) => sum + day.male, 0)} Total Male
                  </p>
                </div>
                <div className="text-center p-2 bg-pink-500/10 rounded-lg">
                  <p className="text-pink-300 font-medium">
                    {dailyCustomerData.reduce((sum, day) => sum + day.female, 0)} Total Female
                  </p>
                </div>
                <div className="text-center p-2 bg-gray-500/10 rounded-lg">
                  <p className="text-gray-300 font-medium">
                    {dailyCustomerData.reduce((sum, day) => sum + day.unknown, 0)} Total Unknown
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
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
