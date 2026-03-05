const Header = () => (
  <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-8 shadow-sm z-20">
    <div className="flex items-center gap-4">
      {/* לוגו משרד הרווחה - ניתן להחליף ב-SVG או תמונה */}
      <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold text-xl">
        ₪
      </div>
      <div className="text-right">
        <h1 className="text-lg font-bold text-gray-800 leading-tight">משרד הרווחה והביטחון החברתי</h1>
      </div>
    </div>
    <div className="flex-1 text-center">
      <h2 className="text-xl font-black text-gray-700">פוטנציאל למצבי סיכון בקרב אוכלוסיית הגיל השלישי</h2>
    </div>
  </header>
);

export default Header;