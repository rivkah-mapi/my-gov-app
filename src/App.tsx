import React, { useState, useEffect, useMemo } from 'react';
import ProfileSidebar, { ProfileType } from './components/ProfileSidebar';
import Header from './components/Header';
import CityStatsSidebar from './components/CitySidebar';

import servicesData from './data/services.json';
import neighborhoodData from './data/neighbour.json';

import { PROFILES } from './constants/profiles';
import MainView from './components/MainView';
import ServiceFilter from './components/ServicesFilter';
import GovmapAddressSearch from './components/Search';

declare global {
  interface Window {
    govmap: any;
  }
}

const App: React.FC = () => {
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedProfile, setSelectedProfile] = useState<ProfileType>('א');
  const [viewMode, setViewMode] = useState<'map' | 'list'>('map');
  const [tooltipInfo, setTooltipInfo] = useState<any>(null);
  const [zoomLevel, setZoomLevel] = useState<number>(6);

  const lastZoomRef = React.useRef<number | null>(null);
  const tooltipRef = React.useRef(setTooltipInfo);

  useEffect(() => {
    tooltipRef.current = setTooltipInfo;
  }, [setTooltipInfo]);


  const stats = useMemo(() => {
    const total = neighborhoodData.features.reduce((acc: number, f: any) => acc + (f.properties[PROFILES.PROFILE_ALL] || 0), 0);
    const atRisk = neighborhoodData.features.reduce((acc: number, f: any) => acc + (f.properties[PROFILES.PROFILE_AT_RISK] || 0), 0);
    const profileCounts = {
      'א': neighborhoodData.features.reduce((acc: number, f: any) => acc + (f.properties[PROFILES.PROFILE_1] || 0), 0),
      'ב': neighborhoodData.features.reduce((acc: number, f: any) => acc + (f.properties[PROFILES.PROFILE_2] || 0), 0),
      'ג': neighborhoodData.features.reduce((acc: number, f: any) => acc + (f.properties[PROFILES.PROFILE_3] || 0), 0),
    };
    const avg = total > 0 ? (atRisk / total).toFixed(3) : "0";
    return {
      total: total.toLocaleString(),
      atRisk: atRisk.toLocaleString(),
      atRiskNumber: atRisk,
      avg,
      profileCounts
    };
  }, []);


  const convertGeoJSONToWKT = (feature: any): string[] => {
    const { type, coordinates } = feature.geometry;

    if (type === 'MultiPolygon') {
      return coordinates.map((polygon: any) => {
        const rings = polygon.map((ring: any) =>
          ring.map((coord: any) => `${coord[0]} ${coord[1]}`).join(', ')
        ).join('), (');
        return `POLYGON((${rings}))`;
      });
    }

    const rings = coordinates.map((ring: any) =>
      ring.map((coord: any) => `${coord[0]} ${coord[1]}`).join(', ')
    ).join('), (');

    return [`POLYGON((${rings}))`];
  };

  const getRGBA = (hex: string, opacity = 0.6): number[] => {
    const map: Record<string, number[]> = {
      '#ef4444': [239, 68, 68],
      '#fb923c': [251, 146, 60],
      '#fde047': [253, 224, 71],
      '#e5e7eb': [229, 231, 235],
    };
    return [...(map[hex] || [200, 200, 200]), opacity];
  };


  const displayRiskLayers = (profile: ProfileType) => {
    if (!window.govmap) return;

    window.govmap.setVisibleLayers([], ['layer_228678'])

    const allWkts: string[] = [];
    const allSymbols: any[] = [];
    const allNames: any[] = [];
    const allGeomTypes: number[] = [];
    const tooltipData: any[] = [];

    neighborhoodData.features.forEach((feature: any) => {
      const props = feature.properties;
      const totalInArea = props.סה_כ_קשישים_באזור || 1;
      let count = 0;

      if (profile === 'א') count = props[PROFILES.PROFILE_1] || 0;
      else if (profile === 'ב') count = props[PROFILES.PROFILE_2] || 0;
      else if (profile === 'ג') count = props[PROFILES.PROFILE_3] || 0;

      const percentage = (count / totalInArea) * 100;
      const colorHex = percentage > 15 ? '#ef4444' : percentage > 8 ? '#fb923c' : percentage > 0 ? '#fde047' : '#e5e7eb';
      const rgba = getRGBA(colorHex, 0.6);
      const featureWkts = convertGeoJSONToWKT(feature);

      const fullInfo = `${props.EZ_NAME}\n----------------\nפרופיל: ${profile}\nכמות: ${count}\nריכוז: ${percentage.toFixed(1)}%`;

      featureWkts.forEach(wkt => {
        tooltipData.push({
          title: props.EZ_NAME,
          all: totalInArea,
          profile1: props[PROFILES.PROFILE_1] || 0,
          profile2: props[PROFILES.PROFILE_2] || 0,
          profile3: props[PROFILES.PROFILE_3] || 0,
        });
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

    const filteredServices = servicesData.filter(service => {
      const hasWkt = !!service.wkt;

      const matchesCategory =
        selectedCategories.length === 0 ||
        selectedCategories.some(cat => {
          return Object.values(service).some(val =>
            typeof val === "string" &&
            val
              .split(",")
              .map(v => v.trim())
              .includes(cat)
          );
        });

      return hasWkt && matchesCategory;
    });

    filteredServices.forEach(service => {
      allWkts.push(service.wkt);
      allNames.push({
        title: service['כותרת מענה'],
        service: service['סוג מענה'] || 'שירות קהילתי',
        link: service['לינק'] || '',
        address: [
          service['עיר'],
          service['שכונה'],
          service['כתובת'],
          service['רחוב'],
        ].filter(value => value && value !== 'null' && value !== '').join(', ')
      });

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
      showBubble: false,
      geomData: tooltipData,
    }).then((point: any) => {
      const info = point.data[0]?.geomData;
      const isService = !point.data[0].geomData?.title;

      if (info || isService) {
        tooltipRef.current({
          title: info?.title || point.data[0].name.title,
          all: info?.all,
          profile1: info?.profile1,
          profile2: info?.profile2,
          profile3: info?.profile3,
          isService,
          service: point.data[0].name
        });
      }
    });
  };

  useEffect(() => {
    const t = setTimeout(() => {
      if (!window.govmap) return;

      if (zoomLevel < 5) {
        showCityLayer();
      } else {
        displayRiskLayers(selectedProfile);
      }
    }, 150);

    return () => clearTimeout(t);
  }, [zoomLevel, selectedProfile, selectedCategories]);


  const showCityLayer = () => {
    if (!window.govmap) return;

    window.govmap.displayGeometries({
      wkts: [],
      geometryTypes: [],
      symbols: [],
      names: [],
      clearExisting: true
    });

    window.govmap.setVisibleLayers(['layer_228678'], [])
    var params = {
      continous: false,
      drawType: window.govmap.drawType.Point,
      filterLayer: false,
      isZoomToExtent: false,
      layers: ['layer_228678'],
      returnFields: {
        'layer_228678': ['setl_name']
      },
      selectOnMap: true,
      whereClause: {
        'layer_228678': "1=1"
      },
    }
    window.govmap.selectFeaturesOnMap(params).then(function (response) {
      if(response?.[0]?.[0]?.setl_name === 'ירושלים') {
        tooltipRef.current({
          isCity: true,
          title: response[0][0].setl_name,
        });
      }
    });
    // window.govmap.onEvent(window.govmap.events.CLICK).progress((point) => {console.log("Clicked point data-----:", point);});


  };

  useEffect(() => {
    const initMap = () => {
      if (!window.govmap) return;

      window.govmap.createMap('map-container', {
        token: (import.meta as any).env.VITE_GOVMAP_TOKEN,
        level: 5,
        center: { x: 220000, y: 630000 },
        layersMode: 1,
        identifyOnClick: false,
        onLoad: () => {
          showCityLayer();
          window.govmap
            .onEvent(window.govmap.events.EXTENT_CHANGE)
            .progress((e: any) => {
              const newZoom = e?.lod?.level;
              if (newZoom === undefined) return;

              if (lastZoomRef.current !== newZoom) {
                lastZoomRef.current = newZoom;
                setZoomLevel(newZoom);
              }
            });
        }
      });
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

      <div className="flex flex-1 overflow-hidden relative">

        <CityStatsSidebar
          total={stats.total}
          atRisk={stats.atRisk}
          avg={stats.avg}
          tooltipInfo={tooltipInfo}
          closeTooltip={() => setTooltipInfo(null)}
        />

        <MainView
          viewMode={viewMode}
          neighborhoodData={neighborhoodData}
          onViewModeChange={setViewMode}
          tooltipInfo={tooltipInfo}
          closeTooltip={() => setTooltipInfo(null)}
          selectedCategories={selectedCategories}
        />

        <ProfileSidebar
          selectedProfile={selectedProfile}
          onProfileChange={(p) => setSelectedProfile(p)}
          profileCount={stats.profileCounts[selectedProfile]}
          totalAtRisk={stats.atRiskNumber}
        />

        <div className="absolute top-4 right-4 z-40">
          <ServiceFilter
            services={servicesData}
            selectedCategories={selectedCategories}
            onClear={(s) => setSelectedCategories(s)}
          />
        </div>

      </div>
      {window.govmap && <GovmapAddressSearch map={window.gomap} />}
    </div>
  );
};

export default App;