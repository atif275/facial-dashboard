import { Link, useLocation } from 'react-router-dom';
import { useStore } from '../context/StoreContext';

const Sidebar = ({ isOpen }) => {
  const location = useLocation();
  const { currentStore, connectionStatus } = useStore();

  const navigation = [
    { name: 'Dashboard', href: '/', icon: '📊' },
    { name: 'Sessions', href: '/sessions', icon: '📹' },
    { name: 'People', href: '/people', icon: '👥' },
    { name: 'Analytics', href: '/analytics', icon: '📈' },
    { name: 'Search', href: '/search', icon: '🔍' },
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

  return (
    <div className={`
      ${isOpen ? 'translate-x-0' : '-translate-x-full'}
      fixed lg:static inset-y-0 left-0 z-50 w-64 bg-gray-900/40 backdrop-blur-xl border-r border-gray-800/30 transition-transform duration-300 ease-in-out
    `}>
      <div className="flex flex-col h-full">
        {/* Logo and Store Info */}
        <div className="p-6 border-b border-gray-800/30">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 rounded-xl bg-blue-500/10 border border-blue-500/20">
              <span className="text-blue-300 text-xl opacity-80">🎯</span>
            </div>
            <div>
              <h1 className="text-lg font-bold text-gray-100">Facial Registration</h1>
              <p className="text-sm text-gray-400">Dashboard</p>
            </div>
          </div>

          {/* Current Store */}
          {currentStore && (
            <div className="space-y-3">
              <div className="p-3 rounded-xl bg-gray-800/20 border border-gray-700/20">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-300">{currentStore.name}</span>
                  <span className={`text-xs ${getStatusColor(connectionStatus.api)}`}>●</span>
                </div>
                <p className="text-xs text-gray-400">{currentStore.location}</p>
                <p className="text-xs text-gray-500 mt-1">{currentStore.description}</p>
              </div>
              
              {/* Connection Status */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-gray-400">Database</span>
                  <span className={getStatusColor(connectionStatus.database)}>
                    {connectionStatus.database === 'connected' ? '●' : '●'}
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-gray-400">API</span>
                  <span className={getStatusColor(connectionStatus.api)}>
                    {connectionStatus.api === 'online' ? '●' : '●'}
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-gray-400">Processing</span>
                  <span className={getStatusColor(connectionStatus.processing)}>
                    {connectionStatus.processing === 'active' ? '●' : '●'}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-6">
          <ul className="space-y-2">
            {navigation.map((item) => {
              const isActive = location.pathname === item.href;
              return (
                <li key={item.name}>
                  <Link
                    to={item.href}
                    className={`
                      flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200
                      ${isActive
                        ? 'bg-blue-500/10 border border-blue-500/20 text-blue-300'
                        : 'text-gray-400 hover:bg-gray-800/20 hover:text-gray-300 hover:border-gray-700/20 border border-transparent'
                      }
                    `}
                  >
                    <span className="text-lg opacity-80">{item.icon}</span>
                    {item.name}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Footer */}
        <div className="p-6 border-t border-gray-800/30">
          <div className="text-center">
            <p className="text-xs text-gray-500">Facial Registration System</p>
            <p className="text-xs text-gray-600 mt-1">v1.0.0</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
