import React from 'react';
import StatBox from './StatsBox';

interface CityStatsSidebarProps {
  total: string;
  atRisk: string;
  avg: string;
}



const CityStatsSidebar: React.FC<CityStatsSidebarProps> = ({ total, atRisk, avg }) => {
  return (
    <aside className="w-80 bg-[#323232] text-white p-6 flex flex-col shadow-xl z-10">
      <h1 className="text-2xl font-bold text-center mb-10 tracking-tight">ירושלים</h1>
      <div className="space-y-4">
        <StatBox title="סה''כ קשישים" value={total} />
        <StatBox title="קשישים בסיכון" value={atRisk} />
        <StatBox title="אחוז ממוצע" value={`${(Number(avg) * 100).toFixed(1)}%`} />
      </div>
      
      <div className="mt-auto pt-6 border-t border-gray-700 text-gray-400 text-[10px] text-center">
        נתונים מבוססים על אזורים סטטיסטיים ירושלים
      </div>
    </aside>
  );
};

export default CityStatsSidebar;