import React from 'react';

const formatNumber = (num: number) => {
    if (num >= 1000) {
        return (num / 1000).toFixed(1).replace(/\.0$/, '') + 'K';
    }
    return num.toString();
};

const ProfileGauge: React.FC<{ profile: string; count: number; percentage: number }> = (
    { profile, count, percentage }
) => {
    if (!profile || count === undefined || percentage === undefined) {
        return null
    };

    const maxRangeValue = 25000;

    const needleRatio = Math.min(count / maxRangeValue, 1);

    const needleRotation = (needleRatio * 180) - 90;

    const arcLength = 125.66;
    const progressLength = (percentage / 100) * arcLength;

    const ticks = [
        { value: 0, label: '0' },
        { value: 5000, label: '5K' },
        { value: 10000, label: '10K' },
        { value: 15000, label: '15K' },
        { value: 20000, label: '20K' },
        { value: 25000, label: '25K' }
    ];

    return (
        <div className="bg-white shadow-xl flex flex-col p-3 border border-gray-100" dir="rtl">

            <div className="flex flex-col items-center bg-gray-50 p-6 rounded-2xl border border-gray-200 relative mb-3">

                <div className="relative w-48 h-32 overflow-hidden">
                    <svg viewBox="0 0 100 65" className="w-full h-full">
                        <path
                            d="M10,50 A40,40 0 0,1 90,50"
                            fill="none"
                            stroke="#e5e7eb"
                            strokeWidth="2"
                            strokeLinecap="round"
                        />


                        {ticks.map((tick, index) => {
                            const tickRotation = (index * 36) - 90;
                            const radian = ((tickRotation - 90) * Math.PI) / 180; // המרה לרדיאנים לצורך מיקום טקסט

                            const tx = 50 + 46 * Math.cos(radian);
                            const ty = 50 + 46 * Math.sin(radian);

                            return (
                                <g key={tick.value}>
                                    <line
                                        x1="50" y1="50"
                                        x2="50" y2="47"
                                        stroke="#d1d5db"
                                        strokeWidth="0.8"
                                        transform={`rotate(${tickRotation} 50 50) translate(0, -38)`}
                                    />
                                    <text
                                        x={tx}
                                        y={ty}
                                        fontSize="3.5"
                                        fill="#9ca3af"
                                        fontWeight="bold"
                                        textAnchor="middle"
                                    >
                                        {tick.label}
                                    </text>
                                </g>
                            );
                        })}

                        <line
                            x1="50" y1="50"
                            x2="50" y2="15"
                            stroke="#111827"
                            strokeWidth="1.5"
                            strokeLinecap="round"
                            style={{
                                transform: `rotate(${needleRotation}deg)`,
                                transformOrigin: '50px 50px',
                                transition: 'transform 1s cubic-bezier(0.4, 0, 0.2, 1)'
                            }}
                        />

                        <circle cx="50" cy="50" r="2" fill="#111827" />
                    </svg>

                    <div className="absolute inset-x-0 bottom-0 text-center flex flex-col items-center">
                        <span className="text-md font-black text-gray-900 leading-none">{formatNumber(count)}</span>
                    </div>
                </div>
            </div>

            <div className="text-center text-xs">
                מספר הקשישים בפרופיל {profile} מתוך כלל הקשישים בסיכון      </div>
        </div>
    );
};

export default ProfileGauge;