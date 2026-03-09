import React from 'react';

// הגדרת הטיפוסים
export type ProfileType = 'א' | 'ב' | 'ג';

interface Criterion {
  id: string;
  label: string;
}

interface ProfileSidebarProps {
  selectedProfile: ProfileType;
  onProfileChange: (profile: ProfileType) => void;
  profileCount: number; // מספר הקשישים בפרופיל הספציפי
  totalAtRisk: number;  // סך כל הקשישים בסיכון (לצורך חישוב אחוז)
}

const criteria: Criterion[] = [
  { id: 'married', label: 'נשואים' },
  { id: 'disabled', label: 'בעל מגבלה' },
  { id: 'academic', label: 'אקדמאים' },
  { id: 'age', label: 'בני 71 ומעלה' },
  { id: 'income', label: 'הכנסה מעל 2375' },
];

// לוגיקה קבועה להצגת הרכב הפרופיל
const profileLogic: Record<ProfileType, Record<string, string>> = {
  'א': { married: 'X', disabled: 'V', academic: '-', age: '-', income: '-' },
  'ב': { married: 'X', disabled: 'X', academic: '-', age: 'V', income: 'X' },
  'ג': { married: 'X', disabled: 'X', academic: 'X', age: 'V', income: 'V' },
};

const ProfileSidebar: React.FC<ProfileSidebarProps> = ({ 
  selectedProfile, 
  onProfileChange, 
  profileCount, 
  totalAtRisk 
}) => {

  // חישוב אחוז הפרופיל מתוך כלל הקשישים בסיכון
  const percentage = totalAtRisk > 0 
    ? ((profileCount / totalAtRisk) * 100).toFixed(1) 
    : "0";

  return (
    <aside className="w-80 bg-white border-l border-gray-200 flex flex-col shadow-md h-full">
      {/* כותרת ובחירת פרופיל */}
      <div className="p-6 border-b border-gray-100">
        <h2 className="text-lg font-bold text-gray-800 mb-6">הרכב פרופיל בסיכון גבוה</h2>
        
        <div className="flex justify-around items-center mb-4">
          {([ 'א', 'ב', 'ג' ] as ProfileType[]).map((p) => (
            <button
              key={p}
              onClick={() => onProfileChange(p)}
              className={`w-12 h-12 rounded-full border-2 flex items-center justify-center font-bold transition-all cursor-pointer
                ${selectedProfile === p 
                  ? 'border-blue-600 bg-blue-50 text-blue-600 shadow-md scale-110' 
                  : 'border-gray-200 text-gray-400 hover:border-gray-300'}`}
            >
              {p}
            </button>
          ))}
        </div>
      </div>

      {/* רשימת קריטריונים */}
      <div className="flex-1">
        {criteria.map((c) => {
          const status = profileLogic[selectedProfile][c.id];
          return (
            <div key={c.id} className="flex items-center justify-between p-2 border-b border-gray-50">
              <span className={`text-2xl font-black w-10 text-center
                ${status === 'V' ? 'text-green-600' : status === 'X' ? 'text-red-600' : 'text-gray-300'}`}>
                {status}
              </span>
              <span className="text-gray-700 font-medium text-sm flex-1 pr-6 tracking-tight">
                {c.label}
              </span>
            </div>
          );
        })}
      </div>

      {/* נתונים סטטיסטיים דינמיים בתחתית */}
      <div className="p-10 border-t border-gray-100 flex flex-col items-center">
          <div className="text-4xl font-black text-blue-900 leading-none">
            {profileCount.toLocaleString()}
          </div>
          <div className="text-[11px] text-gray-400 mt-2 text-center">
            מספר הקשישים בפרופיל <span className="font-bold">{selectedProfile}</span> מתוך כלל הקשישים בסיכון
          </div>
          
          {/* תצוגת אחוזים ויזואלית */}
          <div className="mt-4 w-full">
            <div className="flex justify-between text-[10px] mb-1 font-bold text-blue-900">
              <span>{percentage}%</span>
              <span>אחוז יחסי</span>
            </div>
            <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
              <div 
                className="bg-blue-600 h-full transition-all duration-700 ease-out" 
                style={{ width: `${percentage}%` }}
              ></div>
            </div>
          </div>
      </div>
    </aside>
  );
};

export default ProfileSidebar;