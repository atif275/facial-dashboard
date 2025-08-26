import { useState, useEffect } from 'react';
import { useStore } from '../context/StoreContext';

const Header = ({ onMenuClick }) => {
  const { currentStore, stores, switchStore, connectionStatus } = useStore();
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const handleStoreChange = (e) => {
    const storeId = e.target.value;
    if (storeId) {
      switchStore(storeId);
    }
  };

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

  const getStatusIcon = (status) => {
    switch (status) {
      case 'connected':
      case 'online':
      case 'active':
        return '●';
      case 'disconnected':
      case 'offline':
      case 'inactive':
        return '●';
      default:
        return '●';
    }
  };

  return (
    <header className="bg-gray-900/40 backdrop-blur-xl border-b border-gray-800/30 px-6 py-4">
      <div className="flex items-center justify-between">
        {/* Left side - Menu button */}
        <div className="flex items-center gap-4">
          <button
            onClick={onMenuClick}
            className="p-2 rounded-xl bg-gray-800/40 border border-gray-700/30 hover:bg-gray-800/60 hover:border-gray-600/50 transition-all duration-200"
          >
            <span className="text-gray-300 text-lg opacity-80">☰</span>
          </button>
        </div>

        {/* Center - Store selector */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-400 opacity-60">🏪</span>
            <select
              value={currentStore?.id || ''}
              onChange={handleStoreChange}
              className="bg-gray-800/40 border border-gray-700/30 rounded-xl px-3 py-2 text-gray-100 focus:outline-none focus:border-blue-500/50 transition-colors text-sm"
            >
              {stores.map((store) => (
                <option 
                  key={store.id} 
                  value={store.id}
                  disabled={store.status === 'inactive'}
                  className={store.status === 'inactive' ? 'text-gray-500' : 'text-gray-100'}
                >
                  {store.status === 'active' ? '🟢' : '🔴'} {store.name} - {store.location}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Right side - Status and time */}
        <div className="flex items-center gap-6">
          {/* Connection Status */}
          <div className="flex items-center gap-4 text-sm">
            <div className="flex items-center gap-2">
              <span className={`${getStatusColor(connectionStatus.database)} ${getStatusIcon(connectionStatus.database)}`}></span>
              <span className="text-gray-400">Database</span>
            </div>
            <div className="flex items-center gap-2">
              <span className={`${getStatusColor(connectionStatus.api)} ${getStatusIcon(connectionStatus.api)}`}></span>
              <span className="text-gray-400">API</span>
            </div>
            <div className="flex items-center gap-2">
              <span className={`${getStatusColor(connectionStatus.processing)} ${getStatusIcon(connectionStatus.processing)}`}></span>
              <span className="text-gray-400">Processing</span>
            </div>
          </div>

          {/* Current Time */}
          <div className="flex items-center gap-2 text-sm text-gray-400">
            <span className="opacity-60">🕐</span>
            <span>{currentTime.toLocaleTimeString()}</span>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
