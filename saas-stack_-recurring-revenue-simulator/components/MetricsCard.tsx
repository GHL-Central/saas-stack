
import React from 'react';

interface MetricsCardProps {
  label: string;
  value: string;
  icon: React.ReactNode;
  trend?: string;
  trendPositive?: boolean;
}

const MetricsCard: React.FC<MetricsCardProps> = ({ label, value, icon, trend, trendPositive }) => {
  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-start justify-between">
      <div>
        <p className="text-slate-500 text-sm font-medium mb-1">{label}</p>
        <h3 className="text-2xl font-bold text-slate-900">{value}</h3>
        {trend && (
          <p className={`text-xs mt-2 font-semibold ${trendPositive ? 'text-emerald-600' : 'text-rose-600'}`}>
            {trend}
          </p>
        )}
      </div>
      <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl">
        {icon}
      </div>
    </div>
  );
};

export default MetricsCard;
