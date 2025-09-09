import { useState, useEffect } from 'react';
import { useStore } from '../context/StoreContext';
import { PieChart, Pie, Cell, BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as ChartTooltip, ResponsiveContainer, Legend } from 'recharts';
import Tooltip from '../components/Tooltip';

const Analytics = () => {
  const { getOverallAnalytics, getBusinessAnalytics } = useStore();
  const [overallAnalytics, setOverallAnalytics] = useState(null);
  const [selectedDateData, setSelectedDateData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [dateLoading, setDateLoading] = useState(false);
  const [showOverallRaw, setShowOverallRaw] = useState(false);
  const [showBusinessRaw, setShowBusinessRaw] = useState(false);
  const [selectedDate, setSelectedDate] = useState(null);
  
  // Weekly Analytics State
  const [showWeeklyAnalytics, setShowWeeklyAnalytics] = useState(false);
  const [weeklyData, setWeeklyData] = useState(null);
  const [weeklyLoading, setWeeklyLoading] = useState(false);
  
  // Monthly Analytics State
  const [showMonthlyAnalytics, setShowMonthlyAnalytics] = useState(false);
  const [monthlyData, setMonthlyData] = useState(null);
  const [monthlyLoading, setMonthlyLoading] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState(null);
  const [availableMonths, setAvailableMonths] = useState([]);

  useEffect(() => {
    loadAnalyticsData();
  }, []);

  const loadAnalyticsData = async () => {
    try {
      setLoading(true);
      
      // Set today's date as default and load today's data
      const today = new Date().toISOString().split('T')[0]; // Format: YYYY-MM-DD
      setSelectedDate(today);
      console.log('📅 Loading data for today:', today);
      
      // Load today's business analytics
      await loadDateData(today);
      
    } catch (error) {
      console.error('Error loading analytics data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Load overall analytics only when requested
  const loadOverallAnalytics = async () => {
    try {
      console.log('📊 Loading overall analytics...');
      const overall = await getOverallAnalytics();
      setOverallAnalytics(overall.overall_analytics);
      console.log('✅ Overall analytics loaded:', overall.overall_analytics);
    } catch (error) {
      console.error('Error loading overall analytics:', error);
      setOverallAnalytics(null);
    }
  };

  const loadDateData = async (date) => {
    try {
      setDateLoading(true);
      console.log(`📅 Loading business analytics for date: ${date}`);
      
      const business = await getBusinessAnalytics(date);
      setSelectedDateData(business.business_analytics);
      
      // Check if data is empty (all zeros)
      const hasData = business.business_analytics && (
        business.business_analytics.unique_customers > 0 ||
        business.business_analytics.total_visits > 0 ||
        business.business_analytics.faces_detected > 0
      );
      
      if (!hasData) {
        console.log(`❌ No data found for date: ${date}`);
      } else {
        console.log(`✅ Data loaded for date: ${date}`, business.business_analytics);
      }
      
    } catch (error) {
      console.error(`Error loading data for date ${date}:`, error);
      setSelectedDateData(null);
    } finally {
      setDateLoading(false);
    }
  };

  // Navigation functions
  const goToPreviousDay = async () => {
    const currentDate = new Date(selectedDate);
    currentDate.setDate(currentDate.getDate() - 1);
    const previousDate = currentDate.toISOString().split('T')[0];
    
    setSelectedDate(previousDate);
    await loadDateData(previousDate);
  };

  const goToNextDay = async () => {
    const currentDate = new Date(selectedDate);
    currentDate.setDate(currentDate.getDate() + 1);
    const nextDate = currentDate.toISOString().split('T')[0];
    
    // Don't allow future dates
    const today = new Date().toISOString().split('T')[0];
    if (nextDate <= today) {
      setSelectedDate(nextDate);
      await loadDateData(nextDate);
    }
  };

  const canGoToNext = () => {
    const currentDate = new Date(selectedDate);
    currentDate.setDate(currentDate.getDate() + 1);
    const nextDate = currentDate.toISOString().split('T')[0];
    const today = new Date().toISOString().split('T')[0];
    return nextDate <= today;
  };

  // Check if selected date data has any meaningful data
  const hasDataForSelectedDate = () => {
    return selectedDateData && (
      selectedDateData.unique_customers > 0 ||
      selectedDateData.total_visits > 0 ||
      selectedDateData.faces_detected > 0
    );
  };

  // Weekly Analytics Functions
  const loadWeeklyAnalytics = async () => {
    try {
      setWeeklyLoading(true);
      console.log('📅 Loading weekly analytics (7 days from today)...');
      
      const today = new Date();
      const weeklyPromises = [];
      const dates = [];
      
      // Get last 7 days including today
      for (let i = 6; i >= 0; i--) {
        const date = new Date(today);
        date.setDate(today.getDate() - i);
        const dateStr = date.toISOString().split('T')[0];
        dates.push(dateStr);
        weeklyPromises.push(getBusinessAnalytics(dateStr));
      }
      
      const weeklyResults = await Promise.all(weeklyPromises);
      
      // Aggregate weekly data
      const aggregatedData = {
        dates: dates,
        total_unique_customers: 0,
        total_visits: 0,
        total_faces_detected: 0,
        total_quality_passed: 0,
        total_sessions_processed: 0,
        total_repeat_customers: 0,
        total_frequent_visitors: 0,
        gender_distribution: { male: 0, female: 0, unknown: 0 },
        age_groups: {
          babies_0_2: 0,
          children_3_16: 0,
          young_adults_17_30: 0,
          middle_aged_31_45: 0,
          old_adults_45_plus: 0,
          unknown: 0
        },
        rejection_reasons: {
          blur: 0,
          extreme_pose: 0,
          low_confidence: 0,
          no_face: 0,
          small_face: 0,
          missing_landmarks: 0
        },
        daily_breakdown: []
      };
      
      weeklyResults.forEach((result, index) => {
        const data = result.business_analytics;
        if (data) {
          aggregatedData.total_unique_customers += data.unique_customers || 0;
          aggregatedData.total_visits += data.total_visits || 0;
          aggregatedData.total_faces_detected += data.faces_detected || 0;
          aggregatedData.total_quality_passed += data.quality_passed || 0;
          aggregatedData.total_sessions_processed += data.sessions_processed || 0;
          aggregatedData.total_repeat_customers += data.repeat_customers || 0;
          aggregatedData.total_frequent_visitors += data.frequent_visitors || 0;
          
          // Aggregate gender distribution
          if (data.gender_distribution) {
            aggregatedData.gender_distribution.male += data.gender_distribution.male || 0;
            aggregatedData.gender_distribution.female += data.gender_distribution.female || 0;
            aggregatedData.gender_distribution.unknown += data.gender_distribution.unknown || 0;
          }
          
          // Aggregate age groups
          if (data.age_groups) {
            Object.keys(aggregatedData.age_groups).forEach(key => {
              aggregatedData.age_groups[key] += data.age_groups[key] || 0;
            });
          }
          
          // Aggregate rejection reasons
          if (data.rejection_reasons) {
            Object.keys(aggregatedData.rejection_reasons).forEach(key => {
              aggregatedData.rejection_reasons[key] += data.rejection_reasons[key] || 0;
            });
          }
          
          // Add daily breakdown
          aggregatedData.daily_breakdown.push({
            date: dates[index],
            ...data
          });
        }
      });
      
      setWeeklyData(aggregatedData);
      console.log('✅ Weekly analytics loaded:', aggregatedData);
      
    } catch (error) {
      console.error('Error loading weekly analytics:', error);
      setWeeklyData(null);
    } finally {
      setWeeklyLoading(false);
    }
  };

  // Monthly Analytics Functions
  const loadMonthlyAnalytics = async (monthOffset = 0) => {
    try {
      setMonthlyLoading(true);
      
      const today = new Date();
      const targetDate = new Date(today.getFullYear(), today.getMonth() - monthOffset, 1);
      const year = targetDate.getFullYear();
      const month = targetDate.getMonth();
      const monthStr = `${year}-${String(month + 1).padStart(2, '0')}`;
      
      console.log(`📅 Loading monthly analytics for ${monthStr}...`);
      
      // Get all dates in the month
      const daysInMonth = new Date(year, month + 1, 0).getDate();
      const monthlyPromises = [];
      const dates = [];
      
      for (let day = 1; day <= daysInMonth; day++) {
        const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        dates.push(dateStr);
        monthlyPromises.push(getBusinessAnalytics(dateStr));
      }
      
      const monthlyResults = await Promise.all(monthlyPromises);
      
      // Check if any data exists for this month
      const hasAnyData = monthlyResults.some(result => {
        const data = result.business_analytics;
        return data && (
          data.unique_customers > 0 ||
          data.total_visits > 0 ||
          data.faces_detected > 0
        );
      });
      
      if (!hasAnyData) {
        setMonthlyData({ hasData: false, month: monthStr, monthName: targetDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' }) });
        console.log(`❌ No data found for month: ${monthStr}`);
        return;
      }
      
      // Aggregate monthly data
      const aggregatedData = {
        hasData: true,
        month: monthStr,
        monthName: targetDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
        dates: dates,
        total_unique_customers: 0,
        total_visits: 0,
        total_faces_detected: 0,
        total_quality_passed: 0,
        total_sessions_processed: 0,
        total_repeat_customers: 0,
        total_frequent_visitors: 0,
        gender_distribution: { male: 0, female: 0, unknown: 0 },
        age_groups: {
          babies_0_2: 0,
          children_3_16: 0,
          young_adults_17_30: 0,
          middle_aged_31_45: 0,
          old_adults_45_plus: 0,
          unknown: 0
        },
        rejection_reasons: {
          blur: 0,
          extreme_pose: 0,
          low_confidence: 0,
          no_face: 0,
          small_face: 0,
          missing_landmarks: 0
        },
        daily_breakdown: []
      };
      
      // Create daily breakdown for ALL days, filling zeros for missing data
      monthlyResults.forEach((result, index) => {
        const data = result.business_analytics;
        const dateStr = dates[index];
        
        if (data && (data.unique_customers > 0 || data.total_visits > 0 || data.faces_detected > 0)) {
          // Has data - aggregate totals and add to daily breakdown
          aggregatedData.total_unique_customers += data.unique_customers || 0;
          aggregatedData.total_visits += data.total_visits || 0;
          aggregatedData.total_faces_detected += data.faces_detected || 0;
          aggregatedData.total_quality_passed += data.quality_passed || 0;
          aggregatedData.total_sessions_processed += data.sessions_processed || 0;
          aggregatedData.total_repeat_customers += data.repeat_customers || 0;
          aggregatedData.total_frequent_visitors += data.frequent_visitors || 0;
          
          // Aggregate gender distribution
          if (data.gender_distribution) {
            aggregatedData.gender_distribution.male += data.gender_distribution.male || 0;
            aggregatedData.gender_distribution.female += data.gender_distribution.female || 0;
            aggregatedData.gender_distribution.unknown += data.gender_distribution.unknown || 0;
          }
          
          // Aggregate age groups
          if (data.age_groups) {
            Object.keys(aggregatedData.age_groups).forEach(key => {
              aggregatedData.age_groups[key] += data.age_groups[key] || 0;
            });
          }
          
          // Aggregate rejection reasons
          if (data.rejection_reasons) {
            Object.keys(aggregatedData.rejection_reasons).forEach(key => {
              aggregatedData.rejection_reasons[key] += data.rejection_reasons[key] || 0;
            });
          }
          
          // Add actual data to daily breakdown
          aggregatedData.daily_breakdown.push({
            date: dateStr,
            ...data
          });
        } else {
          // No data - add empty entry with zeros
          aggregatedData.daily_breakdown.push({
            date: dateStr,
            unique_customers: 0,
            total_visits: 0,
            faces_detected: 0,
            quality_passed: 0,
            sessions_processed: 0,
            repeat_customers: 0,
            frequent_visitors: 0,
            gender_distribution: { male: 0, female: 0, unknown: 0 },
            age_groups: {
              babies_0_2: 0,
              children_3_16: 0,
              young_adults_17_30: 0,
              middle_aged_31_45: 0,
              old_adults_45_plus: 0,
              unknown: 0
            },
            rejection_reasons: {
              blur: 0,
              extreme_pose: 0,
              low_confidence: 0,
              no_face: 0,
              small_face: 0,
              missing_landmarks: 0
            }
          });
        }
      });
      
      setMonthlyData(aggregatedData);
      console.log(`✅ Monthly analytics loaded for ${monthStr}:`, aggregatedData);
      
    } catch (error) {
      console.error('Error loading monthly analytics:', error);
      setMonthlyData(null);
    } finally {
      setMonthlyLoading(false);
    }
  };

  // Initialize available months (current month and 3 months back)
  const initializeAvailableMonths = () => {
    const today = new Date();
    const months = [];
    
    for (let i = 0; i < 4; i++) {
      const date = new Date(today.getFullYear(), today.getMonth() - i, 1);
      const monthStr = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      const monthName = date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
      months.push({ value: i, label: monthName, monthStr });
    }
    
    setAvailableMonths(months);
    setSelectedMonth(0); // Current month
  };

  // Handle dropdown toggles
  const handleWeeklyToggle = async () => {
    if (!showWeeklyAnalytics && !weeklyData) {
      await loadWeeklyAnalytics();
    }
    setShowWeeklyAnalytics(!showWeeklyAnalytics);
  };

  const handleMonthlyToggle = async () => {
    if (!showMonthlyAnalytics && !monthlyData) {
      initializeAvailableMonths();
      await loadMonthlyAnalytics(0); // Load current month
    }
    setShowMonthlyAnalytics(!showMonthlyAnalytics);
  };

  const handleMonthChange = async (monthOffset) => {
    setSelectedMonth(monthOffset);
    await loadMonthlyAnalytics(monthOffset);
  };

  const handleOverallToggle = async () => {
    if (!showOverallRaw && !overallAnalytics) {
      await loadOverallAnalytics();
    }
    setShowOverallRaw(!showOverallRaw);
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
          <h1 className="text-2xl font-bold text-gray-100">Analytics</h1>
          <p className="text-gray-400">Per-day analytics data and insights</p>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-400">
          <span className="opacity-60">📊</span>
          <span>Analytics overview</span>
        </div>
      </div>

      {/* Date Navigation */}
      {selectedDate && (
        <div className="bg-gray-900/40 backdrop-blur-xl border border-gray-800/30 rounded-2xl shadow-lg p-6">
          <div className="flex flex-col space-y-4">
            {/* Header */}
            <div className="flex items-center gap-3">
              <span className="text-2xl">📅</span>
              <h3 className="text-lg font-semibold text-gray-100">Analytics Date</h3>
            </div>
            
            {/* Date Selector */}
            <div className="flex items-center justify-center">
              <div className="flex items-center bg-gray-800/30 rounded-xl p-2 gap-2">
                {/* Previous Day Button */}
                <button
                  onClick={goToPreviousDay}
                  disabled={dateLoading}
                  className="flex items-center justify-center w-10 h-10 bg-gray-700/40 hover:bg-gray-600/60 rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed group"
                  title="Previous Day"
                >
                  <span className="text-gray-300 group-hover:text-white transition-colors">
                    {dateLoading ? (
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-400"></div>
                    ) : (
                      '←'
                    )}
                  </span>
                </button>
                
                {/* Date Display */}
                <div className="px-6 py-2 bg-gray-800/60 rounded-lg min-w-[200px]">
                  <div className="text-center">
                    <div className="text-lg font-bold text-gray-100">
                      {new Date(selectedDate).toLocaleDateString('en-US', {
                        weekday: 'short',
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric'
                      })}
                    </div>
                    <div className="text-xs text-gray-400 mt-1">
                      {selectedDate}
                    </div>
                  </div>
                </div>
                
                {/* Next Day Button */}
                <button
                  onClick={goToNextDay}
                  disabled={!canGoToNext() || dateLoading}
                  className="flex items-center justify-center w-10 h-10 bg-gray-700/40 hover:bg-gray-600/60 rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed group"
                  title="Next Day"
                >
                  <span className="text-gray-300 group-hover:text-white transition-colors">→</span>
                </button>
              </div>
            </div>
            
            {/* Status and Quick Actions */}
            <div className="flex items-center justify-between">
              {/* Status Indicator */}
              <div className="flex items-center gap-2">
                {dateLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-blue-400"></div>
                    <span className="text-sm text-blue-400">Loading analytics...</span>
                  </>
                ) : hasDataForSelectedDate() ? (
                  <>
                    <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                    <span className="text-sm text-green-400">Data available</span>
                  </>
                ) : (
                  <>
                    <div className="w-3 h-3 bg-gray-500 rounded-full"></div>
                    <span className="text-sm text-gray-400">No data found</span>
                  </>
                )}
              </div>
              
              {/* Quick Actions */}
              <div className="flex items-center gap-2">
                {/* Date Picker */}
                <input
                  type="date"
                  value={selectedDate}
                  max={new Date().toISOString().split('T')[0]}
                  onChange={async (e) => {
                    const newDate = e.target.value;
                    if (newDate) {
                      setSelectedDate(newDate);
                      await loadDateData(newDate);
                    }
                  }}
                  disabled={dateLoading}
                  className="px-2 py-1 bg-gray-800/60 border border-gray-700/30 rounded-lg text-xs text-gray-300 hover:border-gray-600/50 focus:border-blue-500/50 focus:outline-none transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                />
                
                {/* Today Button */}
                {selectedDate !== new Date().toISOString().split('T')[0] && (
                  <button
                    onClick={async () => {
                      const today = new Date().toISOString().split('T')[0];
                      setSelectedDate(today);
                      await loadDateData(today);
                    }}
                    disabled={dateLoading}
                    className="px-3 py-1 bg-blue-600/20 hover:bg-blue-600/40 border border-blue-500/30 rounded-lg text-xs text-blue-300 hover:text-blue-200 transition-all duration-200 disabled:opacity-50"
                  >
                    Today
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Daily Analytics Display */}
      {dateLoading ? (
        <div className="bg-gray-900/40 backdrop-blur-xl border border-gray-800/30 rounded-2xl shadow-lg p-6">
          <div className="flex items-center justify-center h-32">
            <div className="text-center">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-400 mx-auto mb-3"></div>
              <p className="text-gray-400">Loading analytics for {selectedDate}...</p>
            </div>
          </div>
        </div>
      ) : !hasDataForSelectedDate() ? (
        <div className="bg-gray-900/40 backdrop-blur-xl border border-gray-800/30 rounded-2xl shadow-lg p-6">
          <div className="text-center py-12">
            <span className="text-6xl text-gray-600 mb-4 block opacity-50">📊</span>
            <h3 className="text-xl font-semibold text-gray-100 mb-2">No Data Found</h3>
            <p className="text-gray-400 mb-4">No analytics data available for {selectedDate}</p>
            <p className="text-sm text-gray-500">
              This could mean no sessions were processed on this date, or data hasn't been generated yet.
            </p>
          </div>
        </div>
      ) : selectedDateData && (
        <div className="space-y-6">
          {/* Daily Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-gray-900/40 backdrop-blur-xl border border-gray-800/30 rounded-2xl shadow-lg p-6">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <p className="text-sm text-gray-400">Unique Customers</p>
                    <Tooltip text="Unique Customers - Number of distinct individuals identified on this specific date">
                      <span className="text-gray-500 hover:text-gray-300 transition-colors cursor-help text-xs">
                        ℹ️
                      </span>
                    </Tooltip>
                  </div>
                  <p className="text-3xl font-bold text-gray-100">{selectedDateData.unique_customers}</p>
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
                    <p className="text-sm text-gray-400">Total Visits</p>
                    <Tooltip text="Total Visits - Total number of customer visits detected and processed on this date">
                      <span className="text-gray-500 hover:text-gray-300 transition-colors cursor-help text-xs">
                        ℹ️
                      </span>
                    </Tooltip>
                  </div>
                  <p className="text-3xl font-bold text-gray-100">{selectedDateData.total_visits}</p>
                </div>
                <div className="p-3 rounded-xl bg-green-500/10 border border-green-500/20">
                  <span className="text-green-300 text-xl opacity-80">📊</span>
                </div>
              </div>
            </div>

            <div className="bg-gray-900/40 backdrop-blur-xl border border-gray-800/30 rounded-2xl shadow-lg p-6">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <p className="text-sm text-gray-400">Faces Detected</p>
                    <Tooltip text="Faces Detected - Total number of face detections across all sessions processed on this date">
                      <span className="text-gray-500 hover:text-gray-300 transition-colors cursor-help text-xs">
                        ℹ️
                      </span>
                    </Tooltip>
                  </div>
                  <p className="text-3xl font-bold text-gray-100">{selectedDateData.faces_detected}</p>
                </div>
                <div className="p-3 rounded-xl bg-purple-500/10 border border-purple-500/20">
                  <span className="text-purple-300 text-xl opacity-80">🎯</span>
                </div>
              </div>
            </div>

            <div className="bg-gray-900/40 backdrop-blur-xl border border-gray-800/30 rounded-2xl shadow-lg p-6">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <p className="text-sm text-gray-400">Quality Pass Rate</p>
                    <Tooltip text="Quality Pass Rate - Percentage of detected faces that met quality standards for recognition. Formula: (Quality Passed ÷ Faces Detected) × 100">
                      <span className="text-gray-500 hover:text-gray-300 transition-colors cursor-help text-xs">
                        ℹ️
                      </span>
                    </Tooltip>
                  </div>
                  <p className="text-3xl font-bold text-gray-100">
                    {Math.round((selectedDateData.quality_passed / selectedDateData.faces_detected) * 100)}%
                  </p>
                </div>
                <div className="p-3 rounded-xl bg-orange-500/10 border border-orange-500/20">
                  <span className="text-orange-300 text-xl opacity-80">✅</span>
                </div>
              </div>
            </div>
          </div>

          {/* Charts Section */}
          <div className="space-y-6">
            <div className="flex items-center gap-3 mb-4">
              <span className="text-2xl">📊</span>
              <h3 className="text-xl font-semibold text-gray-100">Analytics Charts</h3>
              <Tooltip text="Analytics Charts - Visual representation of daily analytics data including demographics, quality metrics, and customer insights">
                <span className="text-gray-500 hover:text-gray-300 transition-colors cursor-help text-sm">
                  ℹ️
                </span>
              </Tooltip>
            </div>

            {/* First Row - Pie Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Gender Distribution Pie Chart */}
              <div className="bg-gray-900/40 backdrop-blur-xl border border-gray-800/30 rounded-2xl shadow-lg p-6">
                <h4 className="text-lg font-semibold text-gray-100 mb-6">Gender Distribution</h4>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={[
                          { name: 'Male', value: selectedDateData.gender_distribution?.male || 0, color: '#3B82F6' },
                          { name: 'Female', value: selectedDateData.gender_distribution?.female || 0, color: '#EC4899' },
                          { name: 'Unknown', value: selectedDateData.gender_distribution?.unknown || 0, color: '#6B7280' }
                        ]}
                        cx="50%"
                        cy="50%"
                        outerRadius={80}
                        innerRadius={40}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {[
                          { name: 'Male', value: selectedDateData.gender_distribution?.male || 0, color: '#3B82F6' },
                          { name: 'Female', value: selectedDateData.gender_distribution?.female || 0, color: '#EC4899' },
                          { name: 'Unknown', value: selectedDateData.gender_distribution?.unknown || 0, color: '#6B7280' }
                        ].map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <ChartTooltip 
                        contentStyle={{ 
                          backgroundColor: '#1F2937', 
                          border: '1px solid #374151',
                          borderRadius: '8px',
                          color: '#F9FAFB'
                        }}
                        labelStyle={{ color: '#F9FAFB' }}
                        itemStyle={{ color: '#F9FAFB' }}
                      />
                      <Legend 
                        wrapperStyle={{ color: '#F9FAFB' }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Rejection Reasons Pie Chart */}
              <div className="bg-gray-900/40 backdrop-blur-xl border border-gray-800/30 rounded-2xl shadow-lg p-6">
                <h4 className="text-lg font-semibold text-gray-100 mb-6">Rejection Reasons</h4>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={[
                          { name: 'Blur', value: selectedDateData.rejection_reasons?.blur || 0, color: '#EF4444' },
                          { name: 'Extreme Pose', value: selectedDateData.rejection_reasons?.extreme_pose || 0, color: '#F97316' },
                          { name: 'Low Confidence', value: selectedDateData.rejection_reasons?.low_confidence || 0, color: '#EAB308' },
                          { name: 'No Face', value: selectedDateData.rejection_reasons?.no_face || 0, color: '#8B5CF6' },
                          { name: 'Small Face', value: selectedDateData.rejection_reasons?.small_face || 0, color: '#06B6D4' },
                          { name: 'Missing Landmarks', value: selectedDateData.rejection_reasons?.missing_landmarks || 0, color: '#10B981' }
                        ].filter(item => item.value > 0)}
                        cx="50%"
                        cy="50%"
                        outerRadius={80}
                        innerRadius={40}
                        paddingAngle={2}
                        dataKey="value"
                      >
                        {[
                          { name: 'Blur', value: selectedDateData.rejection_reasons?.blur || 0, color: '#EF4444' },
                          { name: 'Extreme Pose', value: selectedDateData.rejection_reasons?.extreme_pose || 0, color: '#F97316' },
                          { name: 'Low Confidence', value: selectedDateData.rejection_reasons?.low_confidence || 0, color: '#EAB308' },
                          { name: 'No Face', value: selectedDateData.rejection_reasons?.no_face || 0, color: '#8B5CF6' },
                          { name: 'Small Face', value: selectedDateData.rejection_reasons?.small_face || 0, color: '#06B6D4' },
                          { name: 'Missing Landmarks', value: selectedDateData.rejection_reasons?.missing_landmarks || 0, color: '#10B981' }
                        ].filter(item => item.value > 0).map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <ChartTooltip 
                        contentStyle={{ 
                          backgroundColor: '#1F2937', 
                          border: '1px solid #374151',
                          borderRadius: '8px',
                          color: '#F9FAFB'
                        }}
                        labelStyle={{ color: '#F9FAFB' }}
                        itemStyle={{ color: '#F9FAFB' }}
                      />
                      <Legend 
                        wrapperStyle={{ color: '#F9FAFB' }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

            {/* Second Row - Bar Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Age Groups Bar Chart */}
              <div className="bg-gray-900/40 backdrop-blur-xl border border-gray-800/30 rounded-2xl shadow-lg p-6">
                <h4 className="text-lg font-semibold text-gray-100 mb-6">Age Distribution</h4>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={[
                        { name: 'Babies\n(0-2)', value: selectedDateData.age_groups?.babies_0_2 || 0 },
                        { name: 'Children\n(3-16)', value: selectedDateData.age_groups?.children_3_16 || 0 },
                        { name: 'Young Adults\n(17-30)', value: selectedDateData.age_groups?.young_adults_17_30 || 0 },
                        { name: 'Middle Aged\n(31-45)', value: selectedDateData.age_groups?.middle_aged_31_45 || 0 },
                        { name: 'Older Adults\n(45+)', value: selectedDateData.age_groups?.old_adults_45_plus || 0 },
                        { name: 'Unknown', value: selectedDateData.age_groups?.unknown || 0 }
                      ]}
                      margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                      <XAxis 
                        dataKey="name" 
                        stroke="#9CA3AF"
                        fontSize={12}
                        tick={{ fill: '#9CA3AF' }}
                      />
                      <YAxis 
                        stroke="#9CA3AF"
                        fontSize={12}
                        tick={{ fill: '#9CA3AF' }}
                      />
                      <ChartTooltip 
                        contentStyle={{ 
                          backgroundColor: '#1F2937', 
                          border: '1px solid #374151',
                          borderRadius: '8px',
                          color: '#F9FAFB'
                        }}
                        labelStyle={{ color: '#F9FAFB' }}
                        itemStyle={{ color: '#F9FAFB' }}
                      />
                      <Bar dataKey="value" fill="#3B82F6" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Quality Metrics Bar Chart */}
              <div className="bg-gray-900/40 backdrop-blur-xl border border-gray-800/30 rounded-2xl shadow-lg p-6">
                <h4 className="text-lg font-semibold text-gray-100 mb-6">Processing Quality</h4>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={[
                        { 
                          name: 'Faces Detected', 
                          value: selectedDateData.faces_detected || 0,
                          color: '#3B82F6'
                        },
                        { 
                          name: 'Quality Passed', 
                          value: selectedDateData.quality_passed || 0,
                          color: '#10B981'
                        },
                        { 
                          name: 'Quality Failed', 
                          value: (selectedDateData.faces_detected || 0) - (selectedDateData.quality_passed || 0),
                          color: '#EF4444'
                        }
                      ]}
                      margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                      <XAxis 
                        dataKey="name" 
                        stroke="#9CA3AF"
                        fontSize={12}
                        tick={{ fill: '#9CA3AF' }}
                      />
                      <YAxis 
                        stroke="#9CA3AF"
                        fontSize={12}
                        tick={{ fill: '#9CA3AF' }}
                      />
                      <ChartTooltip 
                        contentStyle={{ 
                          backgroundColor: '#1F2937', 
                          border: '1px solid #374151',
                          borderRadius: '8px',
                          color: '#F9FAFB'
                        }}
                        labelStyle={{ color: '#F9FAFB' }}
                        itemStyle={{ color: '#F9FAFB' }}
                      />
                      <Bar dataKey="value" fill="#3B82F6" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

            {/* Third Row - Customer Insights */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Customer Type Distribution */}
              <div className="bg-gray-900/40 backdrop-blur-xl border border-gray-800/30 rounded-2xl shadow-lg p-6">
                <h4 className="text-lg font-semibold text-gray-100 mb-6">Customer Insights</h4>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={[
                          { 
                            name: 'New Customers', 
                            value: (selectedDateData.unique_customers || 0) - (selectedDateData.repeat_customers || 0),
                            color: '#10B981' 
                          },
                          { 
                            name: 'Repeat Customers', 
                            value: selectedDateData.repeat_customers || 0,
                            color: '#F59E0B' 
                          },
                          { 
                            name: 'Frequent Visitors', 
                            value: selectedDateData.frequent_visitors || 0,
                            color: '#8B5CF6' 
                          }
                        ].filter(item => item.value > 0)}
                        cx="50%"
                        cy="50%"
                        outerRadius={80}
                        innerRadius={40}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {[
                          { 
                            name: 'New Customers', 
                            value: (selectedDateData.unique_customers || 0) - (selectedDateData.repeat_customers || 0),
                            color: '#10B981' 
                          },
                          { 
                            name: 'Repeat Customers', 
                            value: selectedDateData.repeat_customers || 0,
                            color: '#F59E0B' 
                          },
                          { 
                            name: 'Frequent Visitors', 
                            value: selectedDateData.frequent_visitors || 0,
                            color: '#8B5CF6' 
                          }
                        ].filter(item => item.value > 0).map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <ChartTooltip 
                        contentStyle={{ 
                          backgroundColor: '#1F2937', 
                          border: '1px solid #374151',
                          borderRadius: '8px',
                          color: '#F9FAFB'
                        }}
                        labelStyle={{ color: '#F9FAFB' }}
                        itemStyle={{ color: '#F9FAFB' }}
                      />
                      <Legend 
                        wrapperStyle={{ color: '#F9FAFB' }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Sessions vs Visits */}
              <div className="bg-gray-900/40 backdrop-blur-xl border border-gray-800/30 rounded-2xl shadow-lg p-6">
                <h4 className="text-lg font-semibold text-gray-100 mb-6">Activity Overview</h4>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={[
                        { 
                          name: 'Sessions Processed', 
                          value: selectedDateData.sessions_processed || 0,
                          color: '#3B82F6'
                        },
                        { 
                          name: 'Total Visits', 
                          value: selectedDateData.total_visits || 0,
                          color: '#10B981'
                        },
                        { 
                          name: 'Unique Customers', 
                          value: selectedDateData.unique_customers || 0,
                          color: '#F59E0B'
                        }
                      ]}
                      margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                      <XAxis 
                        dataKey="name" 
                        stroke="#9CA3AF"
                        fontSize={12}
                        tick={{ fill: '#9CA3AF' }}
                      />
                      <YAxis 
                        stroke="#9CA3AF"
                        fontSize={12}
                        tick={{ fill: '#9CA3AF' }}
                      />
                      <ChartTooltip 
                        contentStyle={{ 
                          backgroundColor: '#1F2937', 
                          border: '1px solid #374151',
                          borderRadius: '8px',
                          color: '#F9FAFB'
                        }}
                        labelStyle={{ color: '#F9FAFB' }}
                        itemStyle={{ color: '#F9FAFB' }}
                      />
                      <Bar dataKey="value" fill="#3B82F6" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          </div>

          {/* Demographics */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-gray-900/40 backdrop-blur-xl border border-gray-800/30 rounded-2xl shadow-lg p-6">
              <div className="flex items-center gap-2 mb-4">
                <h3 className="text-lg font-semibold text-gray-100">Gender Distribution</h3>
                <Tooltip text="Gender Distribution - Breakdown of customer demographics by gender for the selected date">
                  <span className="text-gray-500 hover:text-gray-300 transition-colors cursor-help text-sm">
                    ℹ️
                  </span>
                </Tooltip>
              </div>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-gray-300">Male</span>
                  <span className="text-gray-100 font-semibold">{selectedDateData.gender_distribution.male}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-300">Female</span>
                  <span className="text-gray-100 font-semibold">{selectedDateData.gender_distribution.female}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-300">Unknown</span>
                  <span className="text-gray-100 font-semibold">{selectedDateData.gender_distribution.unknown}</span>
                </div>
              </div>
            </div>

            <div className="bg-gray-900/40 backdrop-blur-xl border border-gray-800/30 rounded-2xl shadow-lg p-6">
              <div className="flex items-center gap-2 mb-4">
                <h3 className="text-lg font-semibold text-gray-100">Age Groups</h3>
                <Tooltip text="Age Groups - Distribution of customers across different age ranges for the selected date">
                  <span className="text-gray-500 hover:text-gray-300 transition-colors cursor-help text-sm">
                    ℹ️
                  </span>
                </Tooltip>
              </div>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-gray-300">Babies (0-2)</span>
                  <span className="text-gray-100 font-semibold">{selectedDateData.age_groups.babies_0_2}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-300">Children (3-16)</span>
                  <span className="text-gray-100 font-semibold">{selectedDateData.age_groups.children_3_16}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-300">Young Adults (17-30)</span>
                  <span className="text-gray-100 font-semibold">{selectedDateData.age_groups.young_adults_17_30}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-300">Middle-aged (31-45)</span>
                  <span className="text-gray-100 font-semibold">{selectedDateData.age_groups.middle_aged_31_45}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-300">Older Adults (45+)</span>
                  <span className="text-gray-100 font-semibold">{selectedDateData.age_groups.old_adults_45_plus}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Customer Details */}
          <div className="bg-gray-900/40 backdrop-blur-xl border border-gray-800/30 rounded-2xl shadow-lg p-6">
            <div className="flex items-center gap-2 mb-4">
              <h3 className="text-lg font-semibold text-gray-100">
                Customer Details ({selectedDateData.customer_details.length} customers)
              </h3>
              <Tooltip text="Customer Details - Detailed table of individual customers identified on this date with their demographics and visit information">
                <span className="text-gray-500 hover:text-gray-300 transition-colors cursor-help text-sm">
                  ℹ️
                </span>
              </Tooltip>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-700/30">
                    <th className="text-left text-gray-400 pb-2">Person ID</th>
                    <th className="text-left text-gray-400 pb-2">Age</th>
                    <th className="text-left text-gray-400 pb-2">Gender</th>
                    <th className="text-left text-gray-400 pb-2">Visits</th>
                    <th className="text-left text-gray-400 pb-2">Sessions</th>
                    <th className="text-left text-gray-400 pb-2">Repeat Customer</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedDateData.customer_details.slice(0, 10).map((customer, index) => (
                    <tr key={index} className="border-b border-gray-800/30">
                      <td className="py-2 text-gray-100 font-medium">{customer.person_id}</td>
                      <td className="py-2 text-gray-300">{customer.age}</td>
                      <td className="py-2 text-gray-300">
                        {customer.gender === 0 ? 'Female' : customer.gender === 1 ? 'Male' : 'Unknown'}
                      </td>
                      <td className="py-2 text-gray-300">{customer.daily_visit_count}</td>
                      <td className="py-2 text-gray-300">{customer.session_names.length}</td>
                      <td className="py-2">
                        <span className={`px-2 py-1 rounded text-xs ${
                          customer.is_repeat_customer 
                            ? 'bg-green-500/20 text-green-300' 
                            : 'bg-gray-500/20 text-gray-400'
                        }`}>
                          {customer.is_repeat_customer ? 'Yes' : 'No'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {selectedDateData.customer_details.length > 10 && (
                <p className="text-sm text-gray-400 mt-3">
                  Showing 10 of {selectedDateData.customer_details.length} customers
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Weekly Analytics */}
      <div className="bg-gray-900/40 backdrop-blur-xl border border-gray-800/30 rounded-2xl shadow-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <span className="text-2xl">📊</span>
            <h3 className="text-lg font-semibold text-gray-100">Weekly Analytics</h3>
            <span className="text-sm text-gray-400">(Last 7 days)</span>
            <Tooltip text="Weekly Analytics - Aggregated analytics data for the last 7 days including today, with daily breakdowns and trends">
              <span className="text-gray-500 hover:text-gray-300 transition-colors cursor-help text-sm">
                ℹ️
              </span>
            </Tooltip>
          </div>
          <button
            onClick={handleWeeklyToggle}
            disabled={weeklyLoading}
            className="flex items-center gap-2 px-3 py-1 bg-gray-800/40 border border-gray-700/30 rounded-lg hover:bg-gray-800/60 transition-colors text-sm disabled:opacity-50"
          >
            {weeklyLoading ? (
              <>
                <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-gray-400"></div>
                <span className="text-gray-300">Loading...</span>
              </>
            ) : (
              <>
                <span className="text-gray-300">{showWeeklyAnalytics ? 'Hide' : 'Show'} Weekly Data</span>
                <span className="text-gray-400">{showWeeklyAnalytics ? '▼' : '▶'}</span>
              </>
            )}
          </button>
        </div>
        
        {showWeeklyAnalytics && weeklyData && (
          <div className="space-y-6">
            {/* Weekly Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-gray-800/20 border border-gray-700/20 rounded-xl p-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-400">{weeklyData.total_unique_customers}</div>
                  <div className="text-sm text-gray-400">Total Unique Customers</div>
                </div>
              </div>
              <div className="bg-gray-800/20 border border-gray-700/20 rounded-xl p-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-400">{weeklyData.total_visits}</div>
                  <div className="text-sm text-gray-400">Total Visits</div>
                </div>
              </div>
              <div className="bg-gray-800/20 border border-gray-700/20 rounded-xl p-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-400">{weeklyData.total_faces_detected}</div>
                  <div className="text-sm text-gray-400">Faces Detected</div>
                </div>
              </div>
              <div className="bg-gray-800/20 border border-gray-700/20 rounded-xl p-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-orange-400">
                    {weeklyData.total_faces_detected > 0 
                      ? Math.round((weeklyData.total_quality_passed / weeklyData.total_faces_detected) * 100) 
                      : 0}%
                  </div>
                  <div className="text-sm text-gray-400">Quality Pass Rate</div>
                </div>
              </div>
            </div>

            {/* Weekly Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Weekly Gender Distribution */}
              <div className="bg-gray-800/20 border border-gray-700/20 rounded-xl p-4">
                <h4 className="text-md font-semibold text-gray-100 mb-4">Gender Distribution</h4>
                <div className="h-60">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={[
                          { name: 'Male', value: weeklyData.gender_distribution?.male || 0, color: '#3B82F6' },
                          { name: 'Female', value: weeklyData.gender_distribution?.female || 0, color: '#EC4899' },
                          { name: 'Unknown', value: weeklyData.gender_distribution?.unknown || 0, color: '#6B7280' }
                        ]}
                        cx="50%"
                        cy="50%"
                        outerRadius={60}
                        innerRadius={30}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {[
                          { name: 'Male', value: weeklyData.gender_distribution?.male || 0, color: '#3B82F6' },
                          { name: 'Female', value: weeklyData.gender_distribution?.female || 0, color: '#EC4899' },
                          { name: 'Unknown', value: weeklyData.gender_distribution?.unknown || 0, color: '#6B7280' }
                        ].map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <ChartTooltip 
                        contentStyle={{ 
                          backgroundColor: '#1F2937', 
                          border: '1px solid #374151',
                          borderRadius: '8px',
                          color: '#F9FAFB'
                        }}
                        labelStyle={{ color: '#F9FAFB' }}
                        itemStyle={{ color: '#F9FAFB' }}
                      />
                      <Legend wrapperStyle={{ color: '#F9FAFB', fontSize: '12px' }} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Weekly Daily Customer Count Bar Chart */}
              <div className="bg-gray-800/20 border border-gray-700/20 rounded-xl p-4">
                <h4 className="text-md font-semibold text-gray-100 mb-4">Daily Customer Count</h4>
                <div className="h-60">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={weeklyData.daily_breakdown.map(day => ({
                        date: day.date,
                        customers: day.unique_customers || 0,
                        dayLabel: new Date(day.date).toLocaleDateString('en-US', { weekday: 'short', day: 'numeric' })
                      }))}
                      margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                      <XAxis 
                        dataKey="dayLabel" 
                        stroke="#9CA3AF"
                        fontSize={10}
                        tick={{ fill: '#9CA3AF' }}
                        angle={-45}
                        textAnchor="end"
                        height={60}
                      />
                      <YAxis 
                        stroke="#9CA3AF"
                        fontSize={10}
                        tick={{ fill: '#9CA3AF' }}
                      />
                      <ChartTooltip 
                        contentStyle={{ 
                          backgroundColor: '#1F2937', 
                          border: '1px solid #374151',
                          borderRadius: '8px',
                          color: '#F9FAFB'
                        }}
                        labelStyle={{ color: '#F9FAFB' }}
                        itemStyle={{ color: '#F9FAFB' }}
                        labelFormatter={(label, payload) => {
                          if (payload && payload[0]) {
                            return new Date(payload[0].payload.date).toLocaleDateString('en-US', { 
                              weekday: 'long', 
                              month: 'short', 
                              day: 'numeric' 
                            });
                          }
                          return label;
                        }}
                      />
                      <Bar dataKey="customers" fill="#3B82F6" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Weekly Daily Trend Line Chart */}
              <div className="bg-gray-800/20 border border-gray-700/20 rounded-xl p-4">
                <h4 className="text-md font-semibold text-gray-100 mb-4">Daily Trend</h4>
                <div className="h-60">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={weeklyData.daily_breakdown}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                      <XAxis 
                        dataKey="date" 
                        stroke="#9CA3AF"
                        fontSize={10}
                        tick={{ fill: '#9CA3AF' }}
                        tickFormatter={(date) => new Date(date).getDate()}
                      />
                      <YAxis 
                        stroke="#9CA3AF"
                        fontSize={10}
                        tick={{ fill: '#9CA3AF' }}
                      />
                      <ChartTooltip 
                        contentStyle={{ 
                          backgroundColor: '#1F2937', 
                          border: '1px solid #374151',
                          borderRadius: '8px',
                          color: '#F9FAFB'
                        }}
                        labelStyle={{ color: '#F9FAFB' }}
                        itemStyle={{ color: '#F9FAFB' }}
                      />
                      <Line type="monotone" dataKey="unique_customers" stroke="#3B82F6" strokeWidth={2} />
                      <Line type="monotone" dataKey="total_visits" stroke="#10B981" strokeWidth={2} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Monthly Analytics */}
      <div className="bg-gray-900/40 backdrop-blur-xl border border-gray-800/30 rounded-2xl shadow-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <span className="text-2xl">📅</span>
            <h3 className="text-lg font-semibold text-gray-100">Monthly Analytics</h3>
            <span className="text-sm text-gray-400">(Up to 3 months back)</span>
            <Tooltip text="Monthly Analytics - Comprehensive monthly data aggregation with ability to navigate up to 3 months back, showing daily breakdowns and monthly summaries">
              <span className="text-gray-500 hover:text-gray-300 transition-colors cursor-help text-sm">
                ℹ️
              </span>
            </Tooltip>
          </div>
          <button
            onClick={handleMonthlyToggle}
            disabled={monthlyLoading}
            className="flex items-center gap-2 px-3 py-1 bg-gray-800/40 border border-gray-700/30 rounded-lg hover:bg-gray-800/60 transition-colors text-sm disabled:opacity-50"
          >
            {monthlyLoading ? (
              <>
                <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-gray-400"></div>
                <span className="text-gray-300">Loading...</span>
              </>
            ) : (
              <>
                <span className="text-gray-300">{showMonthlyAnalytics ? 'Hide' : 'Show'} Monthly Data</span>
                <span className="text-gray-400">{showMonthlyAnalytics ? '▼' : '▶'}</span>
              </>
            )}
          </button>
        </div>
        
        {showMonthlyAnalytics && (
          <div className="space-y-6">
            {/* Month Selector */}
            {availableMonths.length > 0 && (
              <div className="flex items-center gap-4">
                <span className="text-sm text-gray-400">Select Month:</span>
                <div className="flex gap-2 flex-wrap">
                  {availableMonths.map((month, index) => (
                    <button
                      key={month.value}
                      onClick={() => handleMonthChange(month.value)}
                      disabled={monthlyLoading}
                      className={`px-3 py-2 rounded-lg text-sm transition-colors disabled:opacity-50 ${
                        selectedMonth === month.value
                          ? 'bg-blue-600/40 border border-blue-500/30 text-blue-300'
                          : 'bg-gray-800/40 border border-gray-700/30 text-gray-300 hover:bg-gray-800/60'
                      }`}
                    >
                      {month.label}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Monthly Data Display */}
            {monthlyData && (
              <div>
                {monthlyData.hasData ? (
                  <div className="space-y-6">
                    {/* Monthly Summary Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                      <div className="bg-gray-800/20 border border-gray-700/20 rounded-xl p-4">
                        <div className="text-center">
                          <div className="text-2xl font-bold text-blue-400">{monthlyData.total_unique_customers}</div>
                          <div className="text-sm text-gray-400">Total Unique Customers</div>
                        </div>
                      </div>
                      <div className="bg-gray-800/20 border border-gray-700/20 rounded-xl p-4">
                        <div className="text-center">
                          <div className="text-2xl font-bold text-green-400">{monthlyData.total_visits}</div>
                          <div className="text-sm text-gray-400">Total Visits</div>
                        </div>
                      </div>
                      <div className="bg-gray-800/20 border border-gray-700/20 rounded-xl p-4">
                        <div className="text-center">
                          <div className="text-2xl font-bold text-purple-400">{monthlyData.total_faces_detected}</div>
                          <div className="text-sm text-gray-400">Faces Detected</div>
                        </div>
                      </div>
                      <div className="bg-gray-800/20 border border-gray-700/20 rounded-xl p-4">
                        <div className="text-center">
                          <div className="text-2xl font-bold text-orange-400">
                            {monthlyData.total_faces_detected > 0 
                              ? Math.round((monthlyData.total_quality_passed / monthlyData.total_faces_detected) * 100) 
                              : 0}%
                          </div>
                          <div className="text-sm text-gray-400">Quality Pass Rate</div>
                        </div>
                      </div>
                    </div>

                    {/* Monthly Charts */}
                    <div className="space-y-6">
                      {/* Monthly Daily Customer Count Bar Chart */}
                      <div className="bg-gray-800/20 border border-gray-700/20 rounded-xl p-4">
                        <h4 className="text-md font-semibold text-gray-100 mb-4">Daily Customer Count - {monthlyData.monthName}</h4>
                        <div className="h-80">
                          <ResponsiveContainer width="100%" height="100%">
                            <BarChart
                              data={monthlyData.daily_breakdown.map(day => ({
                                date: day.date,
                                customers: day.unique_customers || 0,
                                dayLabel: new Date(day.date).getDate()
                              }))}
                              margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                            >
                              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                              <XAxis 
                                dataKey="dayLabel" 
                                stroke="#9CA3AF"
                                fontSize={10}
                                tick={{ fill: '#9CA3AF' }}
                                interval={Math.ceil(monthlyData.daily_breakdown.length / 10)} // Show ~10 labels for better readability
                                domain={['dataMin', 'dataMax']}
                              />
                              <YAxis 
                                stroke="#9CA3AF"
                                fontSize={10}
                                tick={{ fill: '#9CA3AF' }}
                              />
                              <ChartTooltip 
                                contentStyle={{ 
                                  backgroundColor: '#1F2937', 
                                  border: '1px solid #374151',
                                  borderRadius: '8px',
                                  color: '#F9FAFB'
                                }}
                                labelStyle={{ color: '#F9FAFB' }}
                                itemStyle={{ color: '#F9FAFB' }}
                                labelFormatter={(label, payload) => {
                                  if (payload && payload[0]) {
                                    return new Date(payload[0].payload.date).toLocaleDateString('en-US', { 
                                      weekday: 'long', 
                                      month: 'long', 
                                      day: 'numeric',
                                      year: 'numeric'
                                    });
                                  }
                                  return `Day ${label}`;
                                }}
                              />
                              <Bar 
                                dataKey="customers" 
                                fill="#3B82F6" 
                                radius={[2, 2, 0, 0]}
                                stroke="#2563EB"
                                strokeWidth={1}
                              />
                            </BarChart>
                          </ResponsiveContainer>
                        </div>
                      </div>

                      {/* Secondary Charts Row */}
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Monthly Gender Distribution */}
                        <div className="bg-gray-800/20 border border-gray-700/20 rounded-xl p-4">
                          <h4 className="text-md font-semibold text-gray-100 mb-4">Gender Distribution</h4>
                          <div className="h-60">
                            <ResponsiveContainer width="100%" height="100%">
                              <PieChart>
                                <Pie
                                  data={[
                                    { name: 'Male', value: monthlyData.gender_distribution?.male || 0, color: '#3B82F6' },
                                    { name: 'Female', value: monthlyData.gender_distribution?.female || 0, color: '#EC4899' },
                                    { name: 'Unknown', value: monthlyData.gender_distribution?.unknown || 0, color: '#6B7280' }
                                  ]}
                                  cx="50%"
                                  cy="50%"
                                  outerRadius={60}
                                  innerRadius={30}
                                  paddingAngle={5}
                                  dataKey="value"
                                >
                                  {[
                                    { name: 'Male', value: monthlyData.gender_distribution?.male || 0, color: '#3B82F6' },
                                    { name: 'Female', value: monthlyData.gender_distribution?.female || 0, color: '#EC4899' },
                                    { name: 'Unknown', value: monthlyData.gender_distribution?.unknown || 0, color: '#6B7280' }
                                  ].map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.color} />
                                  ))}
                                </Pie>
                                <ChartTooltip 
                                  contentStyle={{ 
                                    backgroundColor: '#1F2937', 
                                    border: '1px solid #374151',
                                    borderRadius: '8px',
                                    color: '#F9FAFB'
                                  }}
                                  labelStyle={{ color: '#F9FAFB' }}
                                  itemStyle={{ color: '#F9FAFB' }}
                                />
                                <Legend wrapperStyle={{ color: '#F9FAFB', fontSize: '12px' }} />
                              </PieChart>
                            </ResponsiveContainer>
                          </div>
                        </div>

                        {/* Monthly Age Distribution */}
                        <div className="bg-gray-800/20 border border-gray-700/20 rounded-xl p-4">
                          <h4 className="text-md font-semibold text-gray-100 mb-4">Age Distribution</h4>
                          <div className="h-60">
                            <ResponsiveContainer width="100%" height="100%">
                              <BarChart
                                data={[
                                  { name: 'Babies', value: monthlyData.age_groups?.babies_0_2 || 0 },
                                  { name: 'Children', value: monthlyData.age_groups?.children_3_16 || 0 },
                                  { name: 'Young', value: monthlyData.age_groups?.young_adults_17_30 || 0 },
                                  { name: 'Middle', value: monthlyData.age_groups?.middle_aged_31_45 || 0 },
                                  { name: 'Older', value: monthlyData.age_groups?.old_adults_45_plus || 0 }
                                ]}
                                margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                              >
                                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                                <XAxis 
                                  dataKey="name" 
                                  stroke="#9CA3AF"
                                  fontSize={10}
                                  tick={{ fill: '#9CA3AF' }}
                                />
                                <YAxis 
                                  stroke="#9CA3AF"
                                  fontSize={10}
                                  tick={{ fill: '#9CA3AF' }}
                                />
                                <ChartTooltip 
                                  contentStyle={{ 
                                    backgroundColor: '#1F2937', 
                                    border: '1px solid #374151',
                                    borderRadius: '8px',
                                    color: '#F9FAFB'
                                  }}
                                  labelStyle={{ color: '#F9FAFB' }}
                                  itemStyle={{ color: '#F9FAFB' }}
                                />
                                <Bar dataKey="value" fill="#3B82F6" radius={[4, 4, 0, 0]} />
                              </BarChart>
                            </ResponsiveContainer>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <span className="text-4xl text-gray-600 mb-3 block opacity-50">📅</span>
                    <h4 className="text-lg font-semibold text-gray-100 mb-2">No Data Found</h4>
                    <p className="text-gray-400">No analytics data available for {monthlyData.monthName}</p>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Overall Analytics */}
      <div className="bg-gray-900/40 backdrop-blur-xl border border-gray-800/30 rounded-2xl shadow-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <span className="text-2xl">📈</span>
            <h3 className="text-lg font-semibold text-gray-100">Overall Analytics</h3>
            <span className="text-sm text-gray-400">(System-wide statistics)</span>
            <Tooltip text="Overall Analytics - System-wide performance metrics and statistics aggregated across all dates, sessions, and stores">
              <span className="text-gray-500 hover:text-gray-300 transition-colors cursor-help text-sm">
                ℹ️
              </span>
            </Tooltip>
          </div>
          <button
            onClick={handleOverallToggle}
            disabled={!showOverallRaw && !overallAnalytics && loading}
            className="flex items-center gap-2 px-3 py-1 bg-gray-800/40 border border-gray-700/30 rounded-lg hover:bg-gray-800/60 transition-colors text-sm disabled:opacity-50"
          >
            {!showOverallRaw && !overallAnalytics ? (
              <>
                <span className="text-gray-300">Load Analytics</span>
                <span className="text-gray-400">▶</span>
              </>
            ) : showOverallRaw ? (
              <>
                <span className="text-gray-300">Hide Data</span>
                <span className="text-gray-400">▼</span>
              </>
            ) : (
              <>
                <span className="text-gray-300">Show Data</span>
                <span className="text-gray-400">▶</span>
              </>
            )}
          </button>
        </div>
        
        {showOverallRaw && overallAnalytics && (
          <div className="space-y-6">
            {/* Key Metrics Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-gray-800/20 border border-gray-700/20 rounded-xl p-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-400">{overallAnalytics.total_faces?.toLocaleString() || 0}</div>
                  <div className="text-sm text-gray-400">Total Faces</div>
                </div>
              </div>
              <div className="bg-gray-800/20 border border-gray-700/20 rounded-xl p-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-400">{overallAnalytics.total_sessions?.toLocaleString() || 0}</div>
                  <div className="text-sm text-gray-400">Total Sessions</div>
                </div>
              </div>
              <div className="bg-gray-800/20 border border-gray-700/20 rounded-xl p-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-400">{overallAnalytics.unique_visitors?.toLocaleString() || 0}</div>
                  <div className="text-sm text-gray-400">Unique Visitors</div>
                </div>
              </div>
              <div className="bg-gray-800/20 border border-gray-700/20 rounded-xl p-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-orange-400">
                    {overallAnalytics.quality_pass_rate ? `${overallAnalytics.quality_pass_rate}%` : '0%'}
                  </div>
                  <div className="text-sm text-gray-400">Quality Pass Rate</div>
                </div>
              </div>
            </div>

            {/* Detailed Metrics */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* System Performance */}
              <div className="bg-gray-800/20 border border-gray-700/20 rounded-xl p-4">
                <h4 className="text-md font-semibold text-gray-100 mb-4 flex items-center gap-2">
                  <span className="text-lg">⚡</span>
                  System Performance
                </h4>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-300">Detection Rate</span>
                    <span className="text-gray-100 font-medium">
                      {overallAnalytics.detection_rate ? `${overallAnalytics.detection_rate}%` : 'N/A'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-300">Quality Pass Rate</span>
                    <span className="text-gray-100 font-medium">
                      {overallAnalytics.quality_pass_rate ? `${overallAnalytics.quality_pass_rate}%` : 'N/A'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-300">Last Updated</span>
                    <span className="text-gray-100 font-medium">
                      {overallAnalytics.last_updated ? new Date(overallAnalytics.last_updated).toLocaleString() : 'N/A'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Rejection Reasons */}
              <div className="bg-gray-800/20 border border-gray-700/20 rounded-xl p-4">
                <h4 className="text-md font-semibold text-gray-100 mb-4 flex items-center gap-2">
                  <span className="text-lg">🚫</span>
                  Rejection Reasons
                </h4>
                <div className="space-y-3">
                  {overallAnalytics.rejection_reasons && Object.entries(overallAnalytics.rejection_reasons).map(([reason, count]) => (
                    <div key={reason} className="flex items-center justify-between">
                      <span className="text-gray-300 capitalize">{reason.replace('_', ' ')}</span>
                      <span className="text-gray-100 font-medium">{count?.toLocaleString() || 0}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Raw Data Section */}
            <div className="bg-gray-800/20 border border-gray-700/20 rounded-xl p-4">
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-md font-semibold text-gray-100 flex items-center gap-2">
                  <span className="text-lg">🔍</span>
                  Raw Data
                </h4>
                <span className="text-xs text-gray-500">JSON Format</span>
              </div>
              <div className="bg-gray-900/40 rounded-lg p-3 max-h-96 overflow-y-auto">
                <pre className="text-xs text-gray-300 overflow-x-auto whitespace-pre-wrap">
                  {JSON.stringify(overallAnalytics, null, 2)}
                </pre>
              </div>
            </div>
          </div>
        )}

        {showOverallRaw && !overallAnalytics && (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-400 mx-auto mb-3"></div>
            <p className="text-gray-400">Loading overall analytics...</p>
          </div>
        )}
      </div>

      {/* Raw Business Analytics */}
      <div className="bg-gray-900/40 backdrop-blur-xl border border-gray-800/30 rounded-2xl shadow-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <span className="text-2xl">📋</span>
            <h3 className="text-lg font-semibold text-gray-100">Business Analytics</h3>
            <span className="text-sm text-gray-400">(Daily data for {selectedDate})</span>
            <Tooltip text="Business Analytics - Raw JSON data from the API containing detailed business metrics and customer information for the selected date">
              <span className="text-gray-500 hover:text-gray-300 transition-colors cursor-help text-sm">
                ℹ️
              </span>
            </Tooltip>
          </div>
          <button
            onClick={() => setShowBusinessRaw(!showBusinessRaw)}
            className="flex items-center gap-2 px-3 py-1 bg-gray-800/40 border border-gray-700/30 rounded-lg hover:bg-gray-800/60 transition-colors text-sm"
          >
            <span className="text-gray-300">{showBusinessRaw ? 'Hide' : 'Show'} Raw Data</span>
            <span className="text-gray-400">{showBusinessRaw ? '▼' : '▶'}</span>
          </button>
        </div>
        
        {showBusinessRaw && (
          <div className="space-y-4">
            {selectedDateData ? (
              <div className="bg-gray-800/20 border border-gray-700/20 rounded-xl p-4">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-md font-semibold text-gray-100 flex items-center gap-2">
                    <span className="text-lg">🔍</span>
                    Raw Data for {selectedDate}
                  </h4>
                  <span className="text-xs text-gray-500">JSON Format</span>
                </div>
                <div className="bg-gray-900/40 rounded-lg p-3 max-h-96 overflow-y-auto">
                  <pre className="text-xs text-gray-300 overflow-x-auto whitespace-pre-wrap">
                    {JSON.stringify(selectedDateData, null, 2)}
                  </pre>
                </div>
              </div>
            ) : dateLoading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-400 mx-auto mb-3"></div>
                <p className="text-gray-400">Loading business analytics for {selectedDate}...</p>
              </div>
            ) : (
              <div className="text-center py-8">
                <span className="text-4xl text-gray-600 mb-3 block opacity-50">📋</span>
                <h4 className="text-lg font-semibold text-gray-100 mb-2">No Data Available</h4>
                <p className="text-gray-400">No business analytics data found for {selectedDate}</p>
                <p className="text-sm text-gray-500 mt-2">
                  This could mean no sessions were processed on this date.
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Analytics;