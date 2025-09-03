// Time utility functions for handling UTC to local timezone conversion

// Get current time in UTC
export const getCurrentUTC = () => {
  return new Date().toISOString();
};

// Convert UTC timestamp to local time
export const utcToLocal = (utcTimestamp) => {
  if (!utcTimestamp) return null;
  return new Date(utcTimestamp);
};

// Calculate time difference between now and a UTC timestamp
export const getTimeAgo = (utcTimestamp) => {
  if (!utcTimestamp) return 'Unknown';
  
  try {
    // Get current time in UTC
    const now = new Date();
    const utcNow = new Date(now.toISOString());
    
    // Parse the UTC timestamp properly
    let targetTime;
    if (utcTimestamp.includes('Z')) {
      // Already has UTC indicator
      targetTime = new Date(utcTimestamp);
    } else if (utcTimestamp.includes('+')) {
      // Has timezone offset
      targetTime = new Date(utcTimestamp);
    } else {
      // Assume it's UTC but add 'Z' to ensure proper parsing
      targetTime = new Date(utcTimestamp + 'Z');
    }
    
    // Calculate difference in UTC
    const diffMs = utcNow - targetTime;
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    return `${diffDays}d ago`;
  } catch (error) {
    console.error('Error calculating time ago:', error);
    return 'Unknown';
  }
};

// Format timestamp for display (UTC to local)
export const formatTimestamp = (utcTimestamp) => {
  if (!utcTimestamp) return 'Unknown';
  const localTime = utcToLocal(utcTimestamp);
  return localTime.toLocaleString();
};

// Format date for display (UTC to local)
export const formatDate = (utcTimestamp) => {
  if (!utcTimestamp) return 'Unknown';
  const localTime = utcToLocal(utcTimestamp);
  return localTime.toLocaleDateString();
};

// Calculate duration between two UTC timestamps
export const calculateDuration = (startUtc, endUtc) => {
  if (!startUtc || !endUtc) return 'Unknown';
  const start = new Date(startUtc);
  const end = new Date(endUtc);
  const diffMs = end - start;
  
  const diffMins = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  
  if (diffMins < 60) return `${diffMins}m`;
  if (diffHours < 24) return `${diffHours}h`;
  return `${diffDays}d`;
};

// Get timezone offset for display
export const getTimezoneOffset = () => {
  const offset = new Date().getTimezoneOffset();
  const hours = Math.abs(Math.floor(offset / 60));
  const minutes = Math.abs(offset % 60);
  const sign = offset > 0 ? '-' : '+';
  return `${sign}${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
};
