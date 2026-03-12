import React, { useState, useEffect, useMemo } from 'react';
import ProfileSidebar, { ProfileType } from './components/ProfileSidebar';
import Header from './components/Header';
import CityStatsSidebar from './components/CitySidebar';

import servicesData from './data/services.json';
import neighborhoodData from './data/neighbour.json';

declare global {
  interface Window {
    govmap: any;
  }
}

const PROFILE_1: string = 'פרופיל_1_לא_נשוי_נכה';
const PROFILE_2: string = 'פרופיל_2_לא_נשוי_לא_נכה_מעל_גיל_71_הכנסה_מתחת_ל_2375';
const PROFILE_3: string = 'פרופיל_3_לא_נשוי_לא_נכה_מעל_גיל_71_הכנסה_מעל_2375_לא_אקדמאי';

const App: React.FC = () => {
  const [selectedProfile, setSelectedProfile] = useState<ProfileType>('א');
  const [viewMode, setViewMode] = useState<'map' | 'list'>('map');
  const stats = useMemo(() => {
    const total = neighborhoodData.features.reduce((acc: number, f: any) => acc + (f.properties.סה_כ_קשישים_באזור || 0), 0);
    const atRisk = neighborhoodData.features.reduce((acc: number, f: any) => acc + (f.properties.סה_כ_קשישים_במצבי_סיכון || 0), 0);
    const profileCounts = {
      'א': neighborhoodData.features.reduce((acc: number, f: any) => acc + (f.properties.פרופיל_1_לא_נשוי_נכה || 0), 0),
      'ב': neighborhoodData.features.reduce((acc: number, f: any) => acc + (f.properties.פרופיל_2_לא_נשוי_לא_נכה_מעל_גיל_71_הכנסה_מתחת_ל_2375 || 0), 0),
      'ג': neighborhoodData.features.reduce((acc: number, f: any) => acc + (f.properties.פרופיל_3_לא_נשוי_לא_נכה_מעל_גיל_71_הכנסה_מעל_2375_לא_אקדמאי || 0), 0),
    };
    const avg = total > 0 ? (atRisk / total).toFixed(3) : "0";

    return {
      total: total.toLocaleString(),
      atRisk: atRisk.toLocaleString(),
      atRiskNumber: atRisk, // מספר גולמי לחישובי אחוזים
      avg: avg,
      profileCounts // מעבירים את המערך עם הסכומים
    };
  }, []);


  // const displayServices = () => {
  //   if (!window.govmap) return;

  //   const servicesWithLocation = servicesData.filter(item => item.wkt);

  //   //קבלת מידע כמה מרקרים מיהיה
  //   console.log(servicesWithLocation);
  //   window.govmap.displayGeometries({
  //     wkts: servicesWithLocation.map(item => item.wkt),
  //     names: servicesWithLocation.map(item => item['כותרת מענה']),
  //     geometryType: 1,
  //     defaultSymbol: {
  //       url: 'https://www.govmap.gov.il/images/marker.png', // אייקון המרקר
  //       width: 20,
  //       height: 24
  //     },
  //     clearExisting: false, // מנקה מרקרים קודמים לפני הציור החדש
  //     project: true // קריטי! אומר למפה להמיר מקואורדינטות עולמיות לרשת ישראל,
  //     ,
  //     data: {
  //       tooltips: servicesWithLocation.map(item => `שירות: ${item['כותרת מענה']}\nכתובת: ${item['כתובת']}`), // טולטיפים עם מידע נוסף
  //       headers: servicesWithLocation.map(item => item['כותרת מענה']), // כותרות בבועה
  //       bubbleUrl: 'https://www.google.co.il'
  //     },
  //   });
  // };

  const convertGeoJSONToWKT = (feature: any): string[] => {
    const { type, coordinates } = feature.geometry;

    if (type === 'MultiPolygon') {
      // MultiPolygon: [[[[x,y], [x,y]]]]
      return coordinates.map((polygon: any) => {
        const rings = polygon.map((ring: any) =>
          ring.map((coord: any) => `${coord[0]} ${coord[1]}`).join(', ')
        ).join('), (');
        return `POLYGON((${rings}))`;
      });
    }

    // Polygon רגיל: [[[x,y], [x,y]]]
    const rings = coordinates.map((ring: any) =>
      ring.map((coord: any) => `${coord[0]} ${coord[1]}`).join(', ')
    ).join('), (');
    return [`POLYGON((${rings}))`];
  };

  const getRGBA = (profileColor: string, opacity: number = 0.6): number[] => {
    const colors: Record<string, number[]> = {
      '#ef4444': [239, 68, 68],  // אדום (סיכון גבוה)
      '#fb923c': [251, 146, 60],  // כתום (סיכון בינוני)
      '#fde047': [253, 224, 71],  // צהוב (סיכון נמוך)
      '#e5e7eb': [229, 231, 235], // אפור (אין נתונים)
    };
    const rgb = colors[profileColor] || [200, 200, 200];
    return [...rgb, opacity];
  };

  const displayRiskLayers = (profile: ProfileType) => {
    if (!window.govmap) return;

    const allWkts: string[] = [];
    const allSymbols: any[] = [];
    const allNames: string[] = [];
    const allGeomTypes: number[] = [];

    neighborhoodData.features.forEach((feature: any) => {
      const props = feature.properties;
      const totalInArea = props.סה_כ_קשישים_באזור || 1;
      let count = 0;

      if (profile === 'א') count = props[PROFILE_1] || 0;
      else if (profile === 'ב') count = props[PROFILE_2] || 0;
      else if (profile === 'ג') count = props[PROFILE_3] || 0;

      const percentage = (count / totalInArea) * 100;
      const colorHex = percentage > 15 ? '#ef4444' : percentage > 8 ? '#fb923c' : percentage > 0 ? '#fde047' : '#e5e7eb';
      const rgba = getRGBA(colorHex, 0.6);
      const featureWkts = convertGeoJSONToWKT(feature);

      const fullInfo = `${props.EZ_NAME}\n----------------\nפרופיל: ${profile}\nכמות: ${count}\nריכוז: ${percentage.toFixed(1)}%`;

      featureWkts.forEach(wkt => {
        allWkts.push(wkt);
        allNames.push(fullInfo);
        allGeomTypes.push(3);
        allSymbols.push({
          fillColor: rgba,
          outlineColor: [255, 255, 255, 1],
          outlineWidth: 1
        });
      });
    });

    // הוספת מרקרים
    const servicesWithLocation = servicesData.filter(item => item.wkt);
    servicesWithLocation.forEach(service => {
      allWkts.push(service.wkt);
      allNames.push(`${service['כותרת מענה']}\nכתובת: ${service['כתובת']}`);
      allGeomTypes.push(1);
      allSymbols.push({
        url: 'https://www.govmap.gov.il/images/marker.png',
        width: 20,
        height: 24
      });
    });

    window.govmap.displayGeometries({
      wkts: allWkts,
      geometryTypes: allGeomTypes,
      symbols: allSymbols,
      names: allNames,
      clearExisting: true,
      project: true,
      data: {
        headers: allNames,
        tooltips: allNames
      }
    });
  };
  useEffect(() => {
    if (window.govmap) {
      displayRiskLayers(selectedProfile);
    }
  }, [selectedProfile]);

  // אתחול המפה
  useEffect(() => {
    const initMap = () => {
      if (window.govmap) {
        window.govmap.createMap('map-container', {
          token: (import.meta as any).env.VITE_GOVMAP_TOKEN,
          layers: ["arcgis_hybrid"], 
          showIdentify: true,
          isIdentifyAll: true,
          level: 6,
          center: { x: 220000, y: 630000 }, 
          layersMode: 1,
          onLoad: () => {
            displayRiskLayers(selectedProfile); 
          }
        });
      }
    };

    if (window.govmap) {
      initMap();
    } else {
      window.addEventListener('load', initMap);
    }
    return () => window.removeEventListener('load', initMap);
  }, []);

  const renderOptionBtn = (
    { label, mode }: { label: string; mode: 'map' | 'list' }
  ) => {
    return (
      <button
        onClick={() => setViewMode(mode)}
        className={`flex-1 py-1.5 text-sm font-bold z-10 transition-colors cursor-pointer ${viewMode === mode ? 'text-blue-600' : 'text-gray-500'
          }`}
      >
        {label}
      </button>
    )
  }

  return (
    <div className="flex flex-col h-screen w-full bg-gray-100 overflow-hidden" dir="rtl">
      <Header />
      <div className="flex flex-1 overflow-hidden">

        <CityStatsSidebar
          total={stats.total}
          atRisk={stats.atRisk}
          avg={stats.avg}
        />
        <main className='flex-1 relative'>
          <div className={`flex-1 relative ${viewMode === 'map' ? 'block w-full h-full' : 'hidden'}`}>
            <div id="map-container" className="w-full h-full"></div>
          </div>

        {viewMode === 'list' && (
            <div className="p-6">
              <h2 className="text-xl font-bold text-gray-800 mb-4">רשימת שכונות ומספר הקשישים בסיכון</h2>
              <div className="space-y-3 max-h-[70vh] overflow-y-auto">
                {neighborhoodData.features.map((feature: any) => (
                  <div key={feature.properties.EZ_NAME} className="p-4 bg-white rounded-lg shadow-sm border border-gray-200">
                    <h3 className="text-lg font-semibold text-gray-700">{feature.properties.EZ_NAME}</h3>
                    <p className="text-sm text-gray-500">סה"כ קשישים: {feature.properties.סה_כ_קשישים_באזור || 0}</p>
                    <p className="text-sm text-gray-500">קשישים בסיכון: {feature.properties.סה_כ_קשישים_במצבי_סיכון || 0}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="absolute z-20 bottom-4 left-4 flex items-center gap-4">
            <span className="text-sm font-bold text-gray-600">תצוגה:</span>
            <div className="flex bg-gray-200 p-1 rounded-xl w-48 relative">
              <div
                className={`absolute top-1 bottom-1 w-[calc(50%-4px)] bg-white rounded-lg shadow-sm transition-all duration-300 ease-in-out ${viewMode === 'map' ? 'right-1' : 'right-[calc(50%+1px)]'
                  }`}
              />

              {renderOptionBtn({ label: 'מפה', mode: 'map' })}
              {renderOptionBtn({ label: 'רשימה', mode: 'list' })}
            </div>
          </div>
        </main>
        <ProfileSidebar
          selectedProfile={selectedProfile}
          onProfileChange={(p) => setSelectedProfile(p)}
          profileCount={stats.profileCounts[selectedProfile]} // מעבירים את המספר של הפרופיל הנבחר
          totalAtRisk={stats.atRiskNumber} // מעבירים את סך כל הקשישים בסיכון לחישוב אחוז
        />
      </div>
    </div>
  );
}



export default App;