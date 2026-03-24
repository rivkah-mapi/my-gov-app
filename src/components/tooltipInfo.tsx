import React from 'react';
import NeighborhoodListItem from './ProfileLine';
import neighborhoodData from '../data/neighbour.json';
import { PROFILES } from '../constants/profiles';

interface TooltipData {
  title?: string;
  all?: number | string;
  profile1?: number;
  profile2?: number;
  profile3?: number;
  isService?: boolean;
  service?: {
    title?: string;
    address?: string;
    link?: string;
  };
  isCity?: boolean;
}

interface NeighborhoodTooltipProps {
  info: TooltipData | null;
  onClose: () => void;
}

const NeighborhoodTooltip: React.FC<NeighborhoodTooltipProps> = ({ info, onClose }) => {
  console.log('iiiiii', info)
  if (!info) return null;

  const isService = info.isService;
  const isCity = info.isCity;

  return (
    <>
      {!isCity ? (
        <div
          className="absolute bottom-6 right-6 left-6 bg-white rounded-xl shadow-2xl w-[85%] text-right overflow-hidden z-50 border border-gray-100 animate-in fade-in slide-in-from-bottom-4 duration-300"
          dir="rtl"
        >
          {/* Header */}
          <div
            className={`${isService ? 'bg-emerald-700' : 'bg-blue-900'} text-white px-4 py-3 flex flex-row justify-between items-center`}
          >
            <div
              className="font-bold text-md leading-tight ml-4"
              title={isService ? info.service?.title : info.title || 'פרטי מידע'}
            >
              {isService ? info.service?.title : info.title || 'פרטי מידע'}
            </div>
            <button
              onClick={onClose}
              className="text-white/70 hover:text-white transition-colors text-2xl leading-none p-1 shrink-0"
            >
              ×
            </button>
          </div>

          {/* Content */}
          <div className="p-2">
            {isService ? (
              <div className="space-y-2">
                <div className="bg-emerald-50 p-3 rounded-lg border border-emerald-100 text-sm">
                  <p className="text-emerald-900 font-bold mb-1">כתובת:</p>
                  <p className="text-emerald-800">{info.service?.address || 'לא צוינה כתובת'}</p>
                  <p className="text-emerald-900 font-bold  mt-1">
                    <a
                      href={info.service?.link || '#'}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-emerald-700 hover:text-emerald-900 underline"
                    >
                      למידע נוסף
                    </a>
                  </p>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {/* <div className="flex justify-between items-center bg-gray-50 p-3 rounded-lg border border-gray-100">
                  <span className="text-gray-600 font-medium">סה"כ קשישים באזור</span>
                  <span className="text-gray-900 font-bold text-xl">{info.all}</span>
                </div> */}

                <div className="space-y-3">
                  {[
                    { label: "פרופיל א'", value: info.profile1, bg: "bg-red-100", txt: "text-red-700" },
                    { label: "פרופיל ב'", value: info.profile2, bg: "bg-orange-100", txt: "text-orange-700" },
                    { label: "פרופיל ג'", value: info.profile3, bg: "bg-yellow-100", txt: "text-yellow-700" }
                  ].map((p, i) => (
                    <div key={i} className="flex justify-between items-center px-1">
                      <span className="text-gray-700 font-medium">{p.label}</span>
                      <div className={`${p.bg} ${p.txt} min-w-[42px] text-center px-3 py-1 rounded-full text-sm font-bold shadow-sm`}>
                        {p.value ?? 0}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div
          className="absolute bottom-6 right-6 left-6 bg-white rounded-xl shadow-2xl w-[85%] text-right overflow-auto z-50 border border-gray-100 animate-in fade-in slide-in-from-bottom-4 duration-300 max-h-[30%]"
        >
          <div className='text-black text-center font-bold text-md mt-2'>מצבי סיכון לפי שכונות</div>
          <div className="max-h-[30%] overflow-auto custom-scrollbar px-2 pt-2">
            {neighborhoodData.features.map((feature, index) => {
              const p = feature.properties;
              const stats = {
                a: p[PROFILES.PROFILE_1] || 0,
                b: p[PROFILES.PROFILE_2] || 0,
                g: p[PROFILES.PROFILE_3] || 0,
                total_all: p[PROFILES.PROFILE_ALL] || 0
              };

              return (
                <NeighborhoodListItem
                  key={index}
                  name={p.EZ_NAME}
                  stats={stats}
                  isInSidebar={true}
                />
              );
            })}
          </div>
        </div>
      )}
    </>
  );
};

export default NeighborhoodTooltip;