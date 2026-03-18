import React from 'react';

interface TooltipData {
  title: string;
  all: number | string;
  profile1: number;
  profile2: number;
  profile3: number;
}

interface NeighborhoodTooltipProps {
  info: TooltipData | null;
  onClose: () => void;
}

const NeighborhoodTooltip: React.FC<NeighborhoodTooltipProps> = ({ info, onClose }) => {
  if (!info) return null;

  // הגדרת הפרופילים בצורה גנרית
  const profileConfigs = [
    { label: "פרופיל א'", value: info.profile1, bgColor: "bg-red-100", textColor: "text-red-700", hoverColor: "group-hover:text-red-600" },
    { label: "פרופיל ב'", value: info.profile2, bgColor: "bg-orange-100", textColor: "text-orange-700", hoverColor: "group-hover:text-orange-600" },
    { label: "פרופיל ג'", value: info.profile3, bgColor: "bg-yellow-100", textColor: "text-yellow-700", hoverColor: "group-hover:text-yellow-600" },
  ];

  return (
    <div className="absolute top-6 right-6 bg-white rounded-xl shadow-2xl max-w-sm w-72 text-right overflow-hidden z-50 border border-gray-100 animate-in fade-in slide-in-from-bottom-4 duration-300" dir="rtl">
      
      <div className="bg-blue-900 text-white px-4 py-3 flex flex-row justify-between items-center">
        <h3 className="font-bold text-lg leading-tight tracking-wide truncate ml-4">
          {info.title}
        </h3>
        <button 
          onClick={onClose}
          className="text-white/70 hover:text-white transition-colors text-2xl leading-none focus:outline-none p-1 shrink-0"
        >
          ×
        </button>
      </div>

      <div className="p-4 space-y-4">
        <div className="flex justify-between items-center bg-gray-50 p-3 rounded-lg border border-gray-100">
          <span className="text-gray-600 font-medium">סה"כ קשישים באזור</span>
          <span className="text-gray-900 font-bold text-xl">{info.all}</span>
        </div>

        <div className="space-y-3">
          {profileConfigs.map((profile, index) => (
            <div key={index} className="flex justify-between items-center group px-1">
              <span className={`text-gray-700 font-medium transition-colors ${profile.hoverColor}`}>
                {profile.label}
              </span>
              <div className={`${profile.bgColor} ${profile.textColor} min-w-[42px] text-center px-3 py-1 rounded-full text-sm font-bold shadow-sm`}>
                {profile.value}
              </div>
            </div>
          ))}
        </div>       
      </div>
    </div>
  );
};

export default NeighborhoodTooltip;