import React from 'react';

const defaultMetrics = [
  {
    label: 'TOTAL USERS',
    value: '24,892',
    detail: '+12% from last month',
    accent: 'text-[#2563eb]',
    isDark: false,
  },
  {
    label: 'ACTIVE SESSIONS',
    value: '1,402',
    detail: 'Live system load: 42%',
    accent: 'text-[#888]',
    isDark: false,
  },
  {
    label: 'NEW SIGNUPS',
    value: '842',
    detail: 'Current month cycle',
    accent: 'text-white/70',
    isDark: true,
  },
];

const StatsCard = ({ metrics = defaultMetrics }) => {
  return (
    <div className="relative mb-8 md:mb-12">
      <div className="flex flex-col md:flex-row relative z-10 mt-0">
        {metrics.map((metric, index) => {
          const isLast = index === metrics.length - 1;
          const isDark = Boolean(metric.isDark);
          return (
            <div
              key={metric.label}
              className={`flex-1 py-5 px-6 md:py-7 md:px-10 border flex flex-col ${
                isDark ? 'bg-black text-white border-black' : 'bg-white text-[#111] border-[#e0e0e0]'
              } ${
                isLast ? 'border-black' : 'border-[#e0e0e0] border-b-0 md:border-b md:border-r-0'
              }`}
            >
              <div className={`text-[8px] md:text-[9px] font-extrabold tracking-[1px] mb-3 md:mb-5 ${isDark ? 'text-white/55' : 'text-[#a0a0a0]'}`}>
                {metric.label}
              </div>
              <div className="text-[36px] md:text-[48px] font-black tracking-[-1.5px] md:tracking-[-2px] leading-none mb-2 md:mb-2.5">
                {metric.value}
              </div>
              <div className={`text-[9px] md:text-[10px] font-bold ${metric.accent || (isDark ? 'text-white/70' : 'text-[#2563eb]')}`}>
                {metric.detail}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default StatsCard;
