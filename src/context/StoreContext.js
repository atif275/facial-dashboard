import { createContext, useContext, useState, useEffect } from 'react';

const StoreContext = createContext();

export const useStore = () => {
  const context = useContext(StoreContext);
  if (!context) {
    throw new Error('useStore must be used within a StoreProvider');
  }
  return context;
};

export const StoreProvider = ({ children }) => {
  const [currentStore, setCurrentStore] = useState(null);
  const [stores, setStores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [connectionStatus, setConnectionStatus] = useState({
    database: 'unknown',
    api: 'unknown',
    processing: 'unknown'
  });

  // Load configuration
  useEffect(() => {
    loadConfig();
  }, []);

  // Health check interval
  useEffect(() => {
    if (currentStore) {
      const interval = setInterval(checkHealth, 300000); // Check every 30 seconds
      return () => clearInterval(interval);
    }
  }, [currentStore]);

  const loadConfig = async () => {
    try {
      const response = await fetch('/config.json');
      const config = await response.json();
      setStores(config.stores);
      
      // Set default store (only active stores)
      const activeStores = config.stores.filter(store => store.status === 'active');
      const defaultStore = activeStores.find(store => store.id === config.default_store) || activeStores[0];
      setCurrentStore(defaultStore);
      
      // Initial health check
      if (defaultStore) {
        await checkHealth(defaultStore);
      }
    } catch (error) {
      console.error('Error loading config:', error);
      setError('Failed to load configuration');
    } finally {
      setLoading(false);
    }
  };

  const checkHealth = async (store = currentStore) => {
    if (!store) return;

    try {
      // Check API health
      const healthResponse = await fetch(`${store.api_endpoint}/health`, {
        method: 'GET',
        timeout: 5000
      });

      if (healthResponse.ok) {
        const healthData = await healthResponse.json();
        setConnectionStatus({
          database: healthData.database_status || 'connected',
          api: 'online',
          processing: healthData.processing_status || 'active'
        });
      } else {
        setConnectionStatus({
          database: 'disconnected',
          api: 'offline',
          processing: 'inactive'
        });
      }
    } catch (error) {
      console.error('Health check failed:', error);
      setConnectionStatus({
        database: 'disconnected',
        api: 'offline',
        processing: 'inactive'
      });
    }
  };

  const switchStore = async (storeId) => {
    const store = stores.find(s => s.id === storeId);
    if (store && store.status === 'active') {
      setCurrentStore(store);
      setLoading(true);
      await checkHealth(store);
      setLoading(false);
    } else {
      console.warn('Cannot switch to inactive store:', storeId);
    }
  };

  const makeApiCall = async (endpoint, options = {}) => {
    if (!currentStore) {
      throw new Error('No store selected');
    }

    const url = `${currentStore.api_endpoint}${endpoint}`;
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    if (!response.ok) {
      throw new Error(`API call failed: ${response.status}`);
    }

    return response.json();
  };

  // API functions
  const getSystemStats = async () => {
    return makeApiCall('/system/stats');
  };

  const getSessions = async (limit = 10, offset = 0) => {
    return makeApiCall(`/sessions?limit=${limit}&offset=${offset}`);
  };

  const getSessionDetails = async (sessionName) => {
    return makeApiCall(`/sessions/${encodeURIComponent(sessionName)}`);
  };

  const getPeople = async (limit = 10, offset = 0) => {
    return makeApiCall(`/persons?limit=${limit}&offset=${offset}`);
  };

  const getPersonDetails = async (personId) => {
    return makeApiCall(`/persons/${encodeURIComponent(personId)}`);
  };

  const getQualityMetrics = async () => {
    return makeApiCall('/quality/metrics');
  };

  const getDailyMetrics = async () => {
    return makeApiCall('/daily/metrics');
  };

  const getBusinessAnalytics = async () => {
    try {
      const response = await makeApiCall('/business_analytics');
      return response;
    } catch (error) {
      console.error('Error fetching business analytics:', error);
      throw error;
    }
  };

  const searchData = async (query, searchType) => {
    return makeApiCall('/search', {
      method: 'POST',
      body: JSON.stringify({ query, type: searchType }),
    });
  };

  const value = {
    currentStore,
    stores,
    loading,
    error,
    connectionStatus,
    switchStore,
    checkHealth,
    getSystemStats,
    getSessions,
    getSessionDetails,
    getPeople,
    getPersonDetails,
    getQualityMetrics,
    getDailyMetrics,
    getBusinessAnalytics,
    searchData,
  };

  return (
    <StoreContext.Provider value={value}>
      {children}
    </StoreContext.Provider>
  );
};
