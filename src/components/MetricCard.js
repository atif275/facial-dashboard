const MetricCard = ({ title, value, icon, color, change, changeType }) => {
  // Apple-inspired subtle color palette
  const colorClasses = {
    blue: 'bg-blue-500/10 text-blue-300 border-blue-500/20',
    green: 'bg-green-500/10 text-green-300 border-green-500/20',
    purple: 'bg-purple-500/10 text-purple-300 border-purple-500/20',
    orange: 'bg-orange-500/10 text-orange-300 border-orange-500/20',
    gray: 'bg-gray-500/10 text-gray-300 border-gray-500/20',
  };

  return (
    <div className="bg-gray-900/40 backdrop-blur-xl border border-gray-800/30 rounded-2xl shadow-lg p-6 hover:bg-gray-900/60 hover:border-gray-700/40 transition-all duration-300">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-sm text-gray-400 font-medium">{title}</p>
          <p className="text-3xl font-bold text-gray-100">{value.toLocaleString()}</p>
          {change && (
            <div className={`text-xs font-medium mt-1 flex items-center gap-1 ${changeType === 'positive' ? 'text-green-300' : 'text-red-300'}`}>
              <span className="text-xs">{changeType === 'positive' ? '↗' : '↘'}</span>
              <span>{change}</span>
            </div>
          )}
        </div>
        <div className={`p-3 rounded-xl border ${colorClasses[color] || colorClasses.gray}`}>
          <span className="text-xl opacity-80">{icon}</span>
        </div>
      </div>
    </div>
  );
};

export default MetricCard;
