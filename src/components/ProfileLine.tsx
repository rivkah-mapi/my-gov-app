const NeighborhoodListItem = ({ name, stats, scaleMax }) => {
  const riskTotal = stats.a + stats.b + stats.g;
  const nonRiskCount = Math.max(0, stats.total_all - riskTotal);
  
  const fullBarWidth = Math.min((stats.total_all / scaleMax) * 100, 100);

  const widthA = (stats.a / stats.total_all) * 100;
  const widthB = (stats.b / stats.total_all) * 100;
  const widthG = (stats.g / stats.total_all) * 100;
  const widthNonRisk = (nonRiskCount / stats.total_all) * 100;

  return (
    <div className="flex items-center gap-3 py-2.5 px-2 hover:bg-gray-50 transition-colors border-b border-gray-50 group">
      <div className="w-24 text-right shrink-0">
        <span className="text-[11px] font-bold text-gray-700 truncate block" title={name}>
          {name}
        </span>
      </div>

      <div className="flex-1 relative h-5 flex items-center">
        <div 
          className="h-2.5 flex rounded-sm overflow-hidden shadow-sm transition-all duration-1000 ease-out"
          style={{ width: `${fullBarWidth}%` }}
        >
          <div 
            style={{ width: `${widthA}%` }} 
            className="bg-red-500 h-full border-r border-white/20" 
            title={`פרופיל א': ${stats.a.toLocaleString()}`}
          />
          <div 
            style={{ width: `${widthB}%` }} 
            className="bg-orange-500 h-full border-r border-white/20" 
            title={`פרופיל ב': ${stats.b.toLocaleString()}`}
          />
          <div 
            style={{ width: `${widthG}%` }} 
            className="bg-yellow-400 h-full border-r border-white/20" 
            title={`פרופיל ג': ${stats.g.toLocaleString()}`}
          />
          <div 
            style={{ width: `${widthNonRisk}%` }} 
            className="bg-gray-200 h-full" 
            title={`שאר הקשישים: ${nonRiskCount.toLocaleString()}`}
          />
        </div>
      </div>
    </div>
  );
};

export default NeighborhoodListItem;