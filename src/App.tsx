import React, { useState, useEffect, useMemo } from 'react';
import ProfileSidebar, { ProfileType } from './components/ProfileSidebar';
import Header from './components/Header';

// ייבוא הנתונים
import servicesData from './data/services.json';
import neighborhoodData from './data/neighbour.json';
import CityStatsSidebar from './components/CitySidebar';

declare global {
  interface Window {
    govmap: any;
  }
}

const App: React.FC = () => {
  const [selectedProfile, setSelectedProfile] = useState<ProfileType>('א');

  // 1. חישוב נתונים אמיתיים לסיידבר הימני מתוך ה-JSON
  // משתמשים ב-useMemo כדי לא לחשב מחדש בכל רינדור
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


  const displayServices = () => {
    if (!window.govmap) return;

    const servicesWithLocation = servicesData.filter(item => item.wkt);

    //קבלת מידע כמה מרקרים מיהיה
    console.log(servicesWithLocation);
    window.govmap.displayGeometries({
      wkts: servicesWithLocation.map(item => item.wkt),
      names: servicesWithLocation.map(item => item['כותרת מענה']),
      geometryType: 1,
      defaultSymbol: {
        url: 'https://www.govmap.gov.il/images/marker.png', // אייקון המרקר
        width: 20,
        height: 24
      },
      clearExisting: false, // מנקה מרקרים קודמים לפני הציור החדש
      project: true // קריטי! אומר למפה להמיר מקואורדינטות עולמיות לרשת ישראל,
      ,
      data: {
        tooltips: servicesWithLocation.map(item => `שירות: ${item['כותרת מענה']}\nכתובת: ${item['כתובת']}`), // טולטיפים עם מידע נוסף
        headers: servicesWithLocation.map(item => item['כותרת מענה']), // כותרות בבועה
        bubbleUrl: 'https://www.google.co.il'
      },
    });
  };

  // 1. פונקציית המרה חסינה למבנה MultiPolygon
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
    return [...rgb, opacity]; // מחזיר למשל [239, 68, 68, 0.6]
  };


const displayRiskLayers = (profile: ProfileType) => {
  if (!window.govmap) return;

  const allWkts: string[] = [];
  const allSymbols: any[] = [];
  const allNames: string[] = [];
  const allTooltips: string[] = []; 

  neighborhoodData.features.forEach((feature: any) => {
    let count = 0;
    const props = feature.properties;

    if (profile === 'א') count = props.פרופיל_1_לא_נשוי_נכה || 0;
    else if (profile === 'ב') count = props.פרופיל_2_לא_נשוי_לא_נכה_מעל_גיל_71_הכנסה_מתחת_ל_2375 || 0;
    else if (profile === 'ג') count = props.פרופיל_3_לא_נשוי_לא_נכה_מעל_גיל_71_הכנסה_מעל_2375_לא_אקדמאי || 0;

    const colorHex = count > 20 ? '#ef4444' : count > 10 ? '#fb923c' : count > 0 ? '#fde047' : '#e5e7eb';
    const rgba = getRGBA(colorHex, 0.6);

    const featureWkts = convertGeoJSONToWKT(feature);
    
    featureWkts.forEach(wkt => {
      allWkts.push(wkt);
      allNames.push(props.EZ_NAME); 
      // המידע שיופיע בתוך הבועה (אפשר להוסיף ירידת שורה עם \n)
      allTooltips.push(`שכונה: ${props.EZ_NAME}\nקשישים בפרופיל ${profile}: ${count}`);
      
      allSymbols.push({
        fillColor: rgba,
        outlineColor: [255, 255, 255, 1],
        outlineWidth: 1
      });
    });
  });

  window.govmap.displayGeometries({
    wkts: allWkts,
    geometryType: 3,
    symbols: allSymbols,
    names: allNames, // כותרות הבועות
    clearExisting: true,
    project: false,
    data: {
      tooltips: allTooltips, // הטקסט שיופיע בבועה
      headers: allNames     // כותרת מודגשת בבועה
    }
  }).then(() => {
    // מיד אחרי שהשכונות צוירו - מוסיפים את השירותים מחדש מעל
    displayServices();
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
          layers: ["arcgis_hybrid"], // שכבות רקע ריקות כדי לראות את הצבעים שלנו טוב יותר
          showIdentify: true,
          level: 6,
          center: { x: 220000, y: 630000 }, // מרכז ירושלים ברשת ישראל
          layersMode: 1,
          onLoad: () => {
            displayServices(); // הצגת שירותים על המפה
            displayRiskLayers(selectedProfile); // הצגת שכבות הסיכון לפי הפרופיל הנבחר}
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

  return (
    <div className="flex flex-col h-screen w-full bg-gray-100 overflow-hidden" dir="rtl">
      <Header />
      <div className="flex flex-1 overflow-hidden">

        <CityStatsSidebar
          total={stats.total}
          atRisk={stats.atRisk}
          avg={stats.avg}
        />

        <main className="flex-1 relative">
          <div id="map-container" className="w-full h-full"></div>
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