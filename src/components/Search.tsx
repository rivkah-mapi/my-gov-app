import React, { useState, useEffect, useRef } from "react";

interface Props {
    map: any;
}

const token = (import.meta as any).env.VITE_GOVMAP_TOKEN;

export default function GovmapAddressSearch({ map }: Props) {
    const [query, setQuery] = useState("");
    const [results, setResults] = useState<any[]>([]);
    const [showList, setShowList] = useState(false);

    const listRef = useRef<HTMLUListElement>(null);

    const fetchAutocomplete = async (text: string) => {
        if (!text) {
            setResults([]);
            return;
        }

        var params = {
            searchText: text,
            language: 'he',
            maxResults: 5,
            isAccurate: false,
            apiKey: token,
        };
        window.govmap.search(params).then(function (response) {
            console.log(response);
            setResults((response.results || []).filter(r => r.originalText && r.originalText.trim() !== ""));
        });

    };

    useEffect(() => {
        const t = setTimeout(() => fetchAutocomplete(query), 200);
        return () => clearTimeout(t);
    }, [query]);

    function zoomFromWKT(wkt) {
        const match = wkt.match(/POINT\s*\(\s*([\d.]+)\s+([\d.]+)\s*\)/);

        if (!match) {
            console.error("WKT לא תקין:", wkt);
            return;
        }

        const x = parseFloat(match[1]);
        const y = parseFloat(match[2]);

        return { x, y };
    }

    const fetchGeocode = async (item: any) => {
        console.log('fetchGeocode for', item);
        window.govmap.getSearchResultData(item, token).then(function (response) {
            console.log('Geocode response:', response);
            if (response.results && response.results.length > 0) {
                const loc = response.results[0].location;
                return { x: loc.x, y: loc.y };
            } else {
                return null;
            }
        });
    };

    const onSelect = async (item: any) => {
        setQuery(item.originalText);
        setShowList(false);

        let xy = zoomFromWKT(item.centroid);

        window.govmap.zoomToXY({ x: xy.x, y: xy.y, level: 10, marker: true });
    };

    useEffect(() => {
        const onClickOutside = (e: MouseEvent) => {
            if (listRef.current && !listRef.current.contains(e.target as Node)) {
                setShowList(false);
            }
        };
        document.addEventListener("click", onClickOutside);
        return () => document.removeEventListener("click", onClickOutside);
    }, []);

    return (
        <div className="absolute top-21 right-20 z-10 w-56">
            <input
                type="text"
                value={query}
                placeholder="חפש כתובת…"
                onChange={(e) => {
                    setQuery(e.target.value);
                    setShowList(true);
                }}
                className="w-full p-2 rounded shadow border border-gray-300 focus:ring focus:ring-blue-200"
            />

            {showList && results.length > 0 && (
                <ul
                    ref={listRef}
                    className="bg-white border border-gray-200 rounded shadow mt-1 max-h-64 overflow-auto"
                >
                    {results.map((item, i) => (
                        <li
                            key={i}
                            onClick={() => onSelect(item)}
                            className="p-2 hover:bg-gray-100 cursor-pointer border-b border-gray-100"
                        >
                            {item.originalText}
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}