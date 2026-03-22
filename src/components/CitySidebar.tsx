import React from 'react';
import StatBox from './StatsBox';
import NeighborhoodTooltip from './tooltipInfo';

interface CityStatsSidebarProps {
  total: string;
  atRisk: string;
  avg: string;
  tooltipInfo: any;
  closeTooltip: () => void;
}



const CityStatsSidebar: React.FC<CityStatsSidebarProps> = ({ total, atRisk, avg, tooltipInfo, closeTooltip }) => {
  return (
    <aside className="relative w-80 bg-[#323232] text-white p-6 flex flex-col shadow-xl z-10">
      <h1 className="text-2xl font-bold text-center my-5 tracking-tight pt-8">ירושלים</h1>
      <div className="space-y-2">
        <StatBox title="סה''כ קשישים" value={total} />
        <StatBox title="קשישים בסיכון" value={atRisk} />
        <StatBox title="אחוז ממוצע" value={`${(Number(avg) * 100).toFixed(1)}%`} />
      </div>

      <NeighborhoodTooltip info={tooltipInfo} onClose={closeTooltip} />

    </aside>
  );
};

export default CityStatsSidebar;