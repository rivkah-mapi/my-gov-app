import React, { useMemo, useState } from "react";

type Props = {
    services: any[];
    selectedCategories: string[];
    onClear: (selected: string[]) => void;
};

type FilterGroup = {
    title: string;
    field: string;
};

const FILTER_GROUPS: FilterGroup[] = [
    { title: "סוג אוכלוסיה", field: "קהל יעד" },
    { title: "שפה", field: "שפה" },
    { title: "מיקום המענה", field: "מיקום" },
];

const ServiceFilter: React.FC<Props> = ({
    services,
    selectedCategories,
    onClear,
}) => {
    const [search, setSearch] = useState("");
    const [isOpen, setIsOpen] = useState(false);

    const groupedOptions = useMemo(() => {
        const result: Record<string, Record<string, number>> = {};

        FILTER_GROUPS.forEach(group => {
            result[group.field] = {};
        });

        services.forEach(service => {
            FILTER_GROUPS.forEach(group => {
                const rawValue = service[group.field];
                if (!rawValue || rawValue === "null") return;

                const values = rawValue
                    .split(",")
                    .map((v: string) => v.trim())
                    .filter(Boolean);

                values.forEach((value: string) => {
                    if (!result[group.field][value]) {
                        result[group.field][value] = 0;
                    }
                    result[group.field][value]++;
                });
            });
        });

        return result;
    }, [services]);

    const toggleCategory = (value: string) => {
        if (selectedCategories.includes(value)) {
            onClear(selectedCategories.filter(v => v !== value));
        } else {
            onClear([...selectedCategories, value]);
        }
    };

    const clearAll = () => {
        onClear([]);
    };

    return (
        <>
            {/* 🔘 כפתור פתיחה */}
            <button
                onClick={() => setIsOpen(true)}
                className={`relative flex items-center gap-2 shadow-lg px-4 py-2 rounded-full transition-all
  ${selectedCategories.length > 0
                        ? "bg-blue-600 text-white"
                        : "bg-white text-gray-800 hover:bg-gray-100"
                    }`}
            >
                {/* אייקון פילטר */}
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="w-5 h-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 4h18M6 12h12M10 20h4" />
                </svg>

                <span className="text-sm font-semibold">סינון מענים</span>

                {selectedCategories.length > 0 && (
                    <span className="absolute -top-2 -left-2 bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">
                        {selectedCategories.length}
                    </span>
                )}
            </button>

            <div
                className={`fixed inset-0 bg-black/40 z-40 transition-opacity duration-300 ${isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
                    }`}
                onClick={() => setIsOpen(false)}
            />

            {/* 📦 Drawer */}
            <div
                className={`fixed top-0 right-0 h-full w-80 bg-white shadow-2xl z-50 transform transition-transform duration-300
        ${isOpen ? "translate-x-0" : "translate-x-full"}`}
            >
                <div className="flex flex-col h-full p-4">
                    {/* Header */}
                    <div className="flex justify-between items-center mb-3">
                        <h3 className="font-bold text-lg">סינון מענים</h3>
                        <button
                            onClick={() => setIsOpen(false)}
                            className="text-gray-500 hover:text-black"
                        >
                            ✕
                        </button>
                    </div>




                    <div className="flex-1 overflow-y-auto space-y-4">
                        {FILTER_GROUPS.map(group => {
                            const options = groupedOptions[group.field];
                            if (!options) return null;

                            return (
                                <div key={group.field}>
                                    <div className="font-semibold text-sm mb-2">
                                        {group.title}
                                    </div>

                                    <div className="space-y-1">
                                        {Object.entries(options)
                                            .filter(([value]) => value.includes(search))
                                            .map(([value, count]) => (
                                                <label
                                                    key={value}
                                                    className="flex items-center justify-between text-sm cursor-pointer"
                                                >
                                                    <div className="flex items-center gap-2">
                                                        <input
                                                            type="checkbox"
                                                            checked={selectedCategories.includes(value)}
                                                            onChange={() => toggleCategory(value)}
                                                        />
                                                        <span>{value}</span>
                                                    </div>

                                                    <span className="text-gray-400">
                                                        ({count})
                                                    </span>
                                                </label>
                                            ))}
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    <div className="pt-4 border-t">
                        <button
                            onClick={clearAll}
                            className="w-full bg-gray-100 py-2 rounded-md text-sm hover:bg-gray-200"
                        >
                            ניקוי סינון
                        </button>
                    </div>
                </div>
            </div>
        </>
    );
};

export default ServiceFilter;