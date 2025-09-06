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
      console.log('Loading configuration...');
      const response = await fetch('/config.json');
      if (!response.ok) {
        throw new Error(`Failed to load config: ${response.status}`);
      }
      const config = await response.json();
      console.log('Config loaded:', config);
      setStores(config.stores);
      
      // Set default store (only active stores)
      const activeStores = config.stores.filter(store => store.status === 'active');
      const defaultStore = activeStores.find(store => store.id === config.default_store) || activeStores[0];
      console.log('Default store set:', defaultStore);
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

    const healthUrl = `${store.api_endpoint}/health`;
    
    console.log('🏥 Health Check Request:', {
      url: healthUrl,
      store: store.name,
      timestamp: new Date().toISOString()
    });

    const startTime = Date.now();

    try {
      // Check API health
      const healthResponse = await fetch(healthUrl, {
        method: 'GET',
        timeout: 5000
      });

      const endTime = Date.now();
      const duration = endTime - startTime;

      if (healthResponse.ok) {
        const healthData = await healthResponse.json();
        
        console.log('✅ Health Check Success:', {
          status: healthResponse.status,
          duration: `${duration}ms`,
          healthData: healthData,
          timestamp: new Date().toISOString()
        });

        setConnectionStatus({
          database: healthData.database_status || 'connected',
          api: 'online',
          processing: healthData.processing_status || 'active'
        });
      } else {
        console.warn('⚠️ Health Check Failed:', {
          status: healthResponse.status,
          statusText: healthResponse.statusText,
          duration: `${duration}ms`,
          timestamp: new Date().toISOString()
        });

        setConnectionStatus({
          database: 'disconnected',
          api: 'offline',
          processing: 'inactive'
        });
      }
    } catch (error) {
      const endTime = Date.now();
      const duration = endTime - startTime;
      
      console.error('💥 Health Check Error:', {
        error: error.message,
        duration: `${duration}ms`,
        timestamp: new Date().toISOString()
      });

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
    
    // Log outgoing request
    console.log('🚀 API Request:', {
      method: options.method || 'GET',
      url: url,
      endpoint: endpoint,
      store: currentStore.name,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      body: options.body ? JSON.parse(options.body) : undefined,
      timestamp: new Date().toISOString()
    });

    const startTime = Date.now();
    
    try {
      const response = await fetch(url, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
      });

      const endTime = Date.now();
      const duration = endTime - startTime;

      if (!response.ok) {
        console.error('❌ API Error Response:', {
          status: response.status,
          statusText: response.statusText,
          url: url,
          duration: `${duration}ms`,
          timestamp: new Date().toISOString()
        });
        throw new Error(`API call failed: ${response.status}`);
      }

      const data = await response.json();
      
      // Log successful response
      console.log('✅ API Response:', {
        status: response.status,
        url: url,
        duration: `${duration}ms`,
        dataSize: JSON.stringify(data).length,
        data: data,
        timestamp: new Date().toISOString()
      });

      return data;
    } catch (error) {
      const endTime = Date.now();
      const duration = endTime - startTime;
      
      console.error('💥 API Request Failed:', {
        error: error.message,
        url: url,
        duration: `${duration}ms`,
        timestamp: new Date().toISOString()
      });
      
      throw error;
    }
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
      console.log('Business analytics:', response);
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
