import React from 'react';
import NeighborhoodListView from './NeighborhoodListView';
import ToggleSwitch from './ToggleSwitch';

interface MainViewProps {
  viewMode: 'map' | 'list';
  neighborhoodData: any;
  onViewModeChange: (mode: 'map' | 'list') => void;
}

const MainView: React.FC<MainViewProps> = ({ viewMode, neighborhoodData, onViewModeChange }) => {
  return (
    <main className="flex-1 relative">
      <div className={`w-full h-full ${viewMode === 'map' ? 'block' : 'hidden'}`}>
        <div id="map-container" className="w-full h-full"></div>
      </div>

      {viewMode === 'list' && (
        <NeighborhoodListView neighborhoods={neighborhoodData} />
      )}
      <div className="absolute z-20 bottom-6 left-6 flex items-center gap-4">

        <ToggleSwitch
          currentValue={viewMode}
          onChange={onViewModeChange}
          options={[
            { label: 'מפה', value: 'map' },
            { label: 'רשימה', value: 'list' }
          ]}
          className='w-48'
        ></ToggleSwitch>
      </div>
    </main>
  );
};

export default MainView;