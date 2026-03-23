

import React, { useState } from 'react';
import NeighborhoodListItem from "./ProfileLine";
import { PROFILES } from '../constants/profiles';
import ToggleSwitch from './ToggleSwitch';
import ServicesTable from './ServicesTable';

const NeighborhoodListView = ({ neighborhoods, selectedCategories, isInSidebar = false }) => {
  const [activeTab, setActiveTab] = useState<'risk' | 'solutions'>('risk');

  const scaleMax = 1400;
  const steps = [0, 200, 400, 600, 800, 1000, 1200, 1400];

  return (
    <div className="w-full h-full flex flex-col bg-white ${activeTab === 'risk' ? 'overflow-hidden' : 'overflow-auto'} font-sans shadow-lg rounded-xl border border-gray-100" dir="rtl">
      <div className="bg-gray-50 border-b border-gray-100">
        <ToggleSwitch
          currentValue={activeTab}
          onChange={(value) => setActiveTab(value)}
          options={[
            { label: 'מצבי סיכון', value: 'risk' },
            { label: 'מענים', value: 'solutions' }
          ]}
          className="w-full"
        />
      </div>
      <div className="flex-1 flex flex-col overflow-hidden text-right">
        {activeTab === 'risk' ? (
          <div className="w-full h-full flex flex-col bg-white overflow-hidden font-sans shadow-lg border border-gray-100" dir="rtl">
            <div className="flex-1 overflow-y-auto px-4 pt-4 custom-scrollbar">
              {neighborhoods.features.map((feature, index) => {
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
                    scaleMax={scaleMax}
                    isInSidebar={isInSidebar}
                  />
                );
              })}
            </div>

            <div className="pb-6 pt-2 pr-[128px] pl-4 border-t border-gray-100 bg-gray-50/50">
              <div className="flex justify-between items-start w-full pr-1">
                {steps.map((step) => (
                  <div key={step} className="flex flex-col items-center relative">
                    <div className="w-[1px] h-2 bg-gray-300 mb-1"></div>
                    <span className="text-[10px] text-gray-400 font-black">{step}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex justify-center gap-6 border-b border-gray-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-red-500 rounded-full shadow-sm"></div>
                <span className="text-xs font-bold text-gray-600">פרופיל א'</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-orange-500 rounded-full shadow-sm"></div>
                <span className="text-xs font-bold text-gray-600">פרופיל ב'</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-yellow-400 rounded-full shadow-sm"></div>
                <span className="text-xs font-bold text-gray-600">פרופיל ג'</span>
              </div>
            </div>


          </div>
        ) : (
          <div className="flex-1 overflow-hidden">
            <ServicesTable selectedCategories={selectedCategories} />
          </div>
        )}
      </div>
    </div>
  );
};

export default NeighborhoodListView;

