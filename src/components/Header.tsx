import React, { JSX } from 'react';

const Header = (): JSX.Element => (
  <header className="p-4 bg-white border-b border-gray-200 flex items-center justify-between px-8 shadow-sm z-20">
    <div className="flex items-center gap-4">
      <div className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-xl">
        <img
          src="https://www.gov.il/BlobFolder/office/molsa/he/molsa.png"
          alt="לוגו"
          className="w-6 h-6"
        />
      </div>

      <div className="text-right leading-tight text-md font-bold text-gray-800">
        <p>משרד הרווחה</p>
        <p>והביטחון החברתי</p>
      </div>
    </div>

    <div className="absolute left-1/2 transform -translate-x-1/2 text-center">
      <h2 className="text-xl font-black text-gray-700 font-bold">
        פוטנציאל למצבי סיכון בקרב אוכלוסיית הגיל השלישי
      </h2>
    </div>
  </header>
);

export default Header;