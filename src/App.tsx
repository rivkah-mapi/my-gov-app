import React, { useState, useEffect } from 'react';
import ProfileSidebar, { ProfileType } from './components/ProfileSidebar'; 
import Header from './components/Header';

import servicesData from './data/services.json';

declare global {
  interface Window {
    govmap: any;
  }
}

// הגדרת טיפוס לנתוני הפילטרים
interface FilterItem {
  id: string;
  label: string;
  status: string;
  active: boolean | null;
}

const App: React.FC = () => {
  const [filters, setFilters] = useState<FilterItem[]>([
    { id: 'married', label: 'נשואים', status: 'X', active: false },
    { id: 'disabled', label: 'בעל מגבלה', status: 'V', active: true },
    { id: 'academic', label: 'אקדמאים', status: '-', active: null },
    { id: 'age', label: 'בני 71 ומעלה', status: '-', active: null },
    { id: 'income', label: 'הכנסה מעל 2375', status: '-', active: null },
  ]);

  const [selectedProfile, setSelectedProfile] = useState<ProfileType>('א');

 const displayServicesOnMap = () => {
  if (!window.govmap) return;

  const geometries = servicesData.map((service) => {
    // קביעת צבע לפי קטגוריה (ניתן להתאים לפי הצורך)
    const color = service.קטגוריה === 'אנפורמטייביים' ? '#3B82F6' : 
                  service.קטגוריה === 'אביזרים תומכים לאדם וביתו' ? '#10B981' : '#F59E0B';

    return {
      // שימוש בכתובת המלאה לדיוק מקסימלי
      address: `${service.כתובת}, ${service.שכונה}, ${service.עיר}`,
      symbol: {
        color: color,
        size: 10,
        outlineColor: '#ffffff',
        outlineWidth: 2
      },
      attributes: {
        title: service['כותרת מענה'],
        category: service.קטגוריה,
        provider: service['נותן שירות']
      }
    };
  });

  console.log('Geometries to display on map:', geometries);

 window.govmap.displayGeometries({
    geometries: geometries,
    clearExisting: true,
    zoomTo: true,
    // זו הדרך הנכונה לקבל תשובה ב-SDK הזה:
    callback: (response: any) => {
      console.log("תגובה מהמפה:", response);
      if (response && response.status === 'success') {
        console.log("הנקודות צוירו בהצלחה!");
      } else {
        console.warn("הציור הסתיים, אך ייתכן וחלק מהכתובות לא נמצאו.");
      }
    }
  });
};

const testMarker = () => {
  if (!window.govmap) return;

  window.govmap.displayGeometries({
    geometries: [{
      // קואורדינטות גלובליות של ירושלים (Longitude, Latitude)
      wkts: ["POINT(35.2137 31.7683)"], 
      geomType: 1, 
      symbol: {
        color: "#ff0000",
        size: 20,
        outlineColor: "#ffffff",
        outlineWidth: 2
      }
    }],
    clearExisting: true,
    zoomTo: true,
    // הוספת הפרמטר הזה חשובה כדי שהמפה תדע שמדובר ב-GPS רגיל
    project: true 
  });
};
 
  useEffect(() => {
    // פונקציה לאתחול המפה
    const initMap = () => {
      if (window.govmap) {
        window.govmap.createMap('map-container', {
          token: '5a4b8472-f724-44b4-9366-5e5e3343361e', // טוקן בדיקה ציבורי (כדאי להחליף בפרטי בהמשך)
          layers: ["PARCELS", "ADDRESSES"],
          showIdentify: true,
          level: 10,
          center: { x: 34.7818, y: 32.0853 },
          layersMode: 1 // מצב שכבות
        });
      }
      const timer = setTimeout(() => {
     // displayServicesOnMap();
     testMarker();
    }, 3000);

    return () => clearTimeout(timer);
    };

    // בדיקה שהסקריפט נטען
    if (window.govmap) {
      initMap();
    } else {
      // אם הסקריפט טרם נטען, נמתין לאירוע הטעינה
      window.addEventListener('load', initMap);
    }
    
    return () => window.removeEventListener('load', initMap);
  }, []);

  return (
    <div className="flex flex-col h-screen w-full bg-gray-100 overflow-hidden" dir="rtl">
     <Header />
     <div className="flex flex-1 overflow-hidden">


 
      <aside className="w-80 bg-[#323232] text-white p-6 flex flex-col">
        <h1 className="text-2xl font-bold text-center mb-10">ירושלים</h1>
        <div className="space-y-4">
          <StatBox title="סה''כ קשישים" value="90,029" />
          <StatBox title="קשישים בסיכון" value="24,948" />
          <StatBox title="אחוז ממוצע" value="0.277" />
        </div>
      </aside>

       <main className="flex-1 relative">
        <div 
          id="map-container" 
          className="w-full h-full"
          style={{ backgroundColor: '#e5e7eb' }} // צבע רקע זמני עד שהמפה עולה
        ></div>
      </main>

        <ProfileSidebar
        selectedProfile={selectedProfile} 
        onProfileChange={(p) => setSelectedProfile(p)} 
      />
      </div>
    </div>
  );
}

// הגדרת Props לרכיב ה-StatBox
interface StatBoxProps {
  title: string;
  value: string;
}

const StatBox: React.FC<StatBoxProps> = ({ title, value }) => (
  <div className="border border-gray-600 p-4 rounded-sm flex flex-col items-center">
    <p className="text-xs text-gray-300 mb-2">{title}</p>
    <p className="text-xl font-semibold">{value}</p>
  </div>
);

export default App;