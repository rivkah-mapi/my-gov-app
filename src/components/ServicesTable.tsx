import React, { useMemo, useState } from 'react';
import {
    useReactTable,
    getCoreRowModel,
    flexRender,
    ColumnDef
} from '@tanstack/react-table';
import servicesData from '../data/services.json';

interface Service {
    "כותרת מענה": string;
    "תיאור מענה": string;
    "קטגוריה": string;
    "מצב סיכון": string;
    "מימון": string | null;
    "נותן שירות": string;
    "מיקום": string;
    "לינק": string;
    "סוג נותן שירות.1"?: string;
    "קשור לרווחה"?: string;
}

const SecondaryText: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <span
        className="text-xs text-gray-600 font-medium leading-relaxed line-clamp-1"
        title={children as string} // מציג את הטקסט המלא כשמרחפים עם העכבר
    >
        {children || 'לא צוין'}
    </span>
);

const ServicesTable: React.FC = () => {
    const subTabOptions = ["הכל", "ממשלתי", "עירוני", "עמותה", "פרטי"];
    const [activeSubTab, setActiveSubTab] = useState("הכל");

    const filteredData = useMemo(() => {
        const data = servicesData as Service[];
        if (activeSubTab === "הכל") return data;
        return data.filter(item =>
            item["מימון"]?.includes(activeSubTab) ||
            item["סוג נותן שירות.1"]?.includes(activeSubTab)
        );
    }, [activeSubTab]);

    const columns = useMemo<ColumnDef<Service>[]>(() => [
        {
            header: '#',
            accessorKey: 'id',
            cell: (info) => <span className="text-gray-400 font-mono text-[10px]">{info.row.index + 1}</span>,
            size: 40,
        },
        {
            header: 'מצבי סיכון',
            accessorKey: 'מצב סיכון',
            //cell: (info) => {
            // try {
            //     const risks = JSON.parse((info.getValue() as string) || "[]");
            //     return (
            //         <div className="flex flex-wrap gap-1 min-w-[120px]">
            //             {risks.map((risk: string, i: number) => (
            //                 <span key={i} className="bg-blue-50 text-blue-600 text-[10px] px-2 py-0.5 rounded-full border border-blue-100 whitespace-nowrap">
            //                     {risk}
            //                 </span>
            //             ))}
            //         </div>
            //     );
            // } catch (e) { return null; }
            //},

            cell: (info) => <SecondaryText>{info.getValue() as string}</SecondaryText>,
        },
        {
            header: 'קטגוריה',
            accessorKey: 'קטגוריה',
            cell: (info) => <SecondaryText>{info.getValue() as string}</SecondaryText>,
        },
        {
            header: 'לינק',
            accessorKey: 'לינק',
            cell: (info) => (
                <a
                    href={info.getValue() as string}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-block bg-gray-100 hover:bg-blue-600 hover:text-white text-gray-700 text-[10px] font-bold py-1.5 px-3 rounded-md transition-all whitespace-nowrap"
                >
                    למידע נוסף
                </a>
            ),
        },
        {
            header: 'מענה',
            accessorKey: 'כותרת מענה',
            cell: (info) => <SecondaryText>{info.getValue() as string}</SecondaryText>,
        },
        {
            header: 'תיאור מענה',
            accessorKey: 'תיאור מענה',
            cell: (info) => <SecondaryText>{info.getValue() as string}</SecondaryText>,
        },
        {
            header: 'קשור לרווחה',
            accessorKey: 'קשור לרווחה',
            cell: (info) => <SecondaryText>{info.getValue() as string}</SecondaryText>,
        },
    ], []);

    const table = useReactTable({
        data: filteredData,
        columns,
        getCoreRowModel: getCoreRowModel(),
    });

    return (
        <div className="w-full h-full flex flex-col bg-white overflow-hidden" dir="rtl">
            <div className="flex flex-wrap gap-2 p-4 bg-gray-50 border-b border-gray-100">
                {subTabOptions.map((tab) => {
                    const isActive = activeSubTab === tab;
                    return (
                        <button
                            key={tab}
                            onClick={() => setActiveSubTab(tab)}
                            className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all shadow-sm ${isActive
                                    ? 'bg-blue-600 text-white shadow-blue-200'
                                    : 'bg-white text-gray-500 border border-gray-200 hover:border-blue-300'
                                }`}
                        >
                            {tab}
                        </button>
                    );
                })}
            </div>

            <div className="flex-1 overflow-auto custom-scrollbar">
                <table className="w-full text-right border-collapse">
                    <thead className="sticky top-0 bg-white z-10 border-b border-gray-200">
                        {table.getHeaderGroups().map(headerGroup => (
                            <tr key={headerGroup.id}>
                                {headerGroup.headers.map(header => (
                                    <th key={header.id} className="p-2 text-[11px] font-black text-gray-400 uppercase tracking-tight whitespace-nowrap">
                                        {flexRender(header.column.columnDef.header, header.getContext())}
                                    </th>
                                ))}
                            </tr>
                        ))}
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {table.getRowModel().rows.length > 0 ? (
                            table.getRowModel().rows.map(row => (
                                <tr key={row.id} className="hover:bg-blue-50/40 transition-colors">
                                    {row.getVisibleCells().map(cell => (
                                        <td key={cell.id} className="p-2 align-top">
                                            {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                        </td>
                                    ))}
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan={columns.length} className="p-12 text-center text-gray-400 italic text-sm">
                                    לא נמצאו מענים התואמים לסינון הנבחר
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default ServicesTable;