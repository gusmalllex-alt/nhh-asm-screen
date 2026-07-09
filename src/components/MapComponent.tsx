'use client';

import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, CircleMarker, Popup, Tooltip } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

// Approximate coordinates for sub-districts in Nong Han, Udon Thani
const SUB_DISTRICT_COORDS: Record<string, [number, number]> = {
  'ตำบลหนองหาน': [17.362, 103.076],
  'ตำบลหนองเม็ก': [17.300, 103.040],
  'ตำบลพังงู': [17.330, 103.020],
  'ตำบลสะแบง': [17.340, 103.110],
  'ตำบลสร้อยพร้าว': [17.380, 103.120],
  'ตำบลบ้านเชียง': [17.408, 103.238],
  'ตำบลบ้านยา': [17.420, 103.100],
  'ตำบลโพนงาม': [17.280, 103.100],
  'ตำบลผักตบ': [17.350, 103.180],
  'ตำบลหนองไผ่': [17.300, 103.200],
  'ตำบลหนองสระปลา': [17.390, 103.150],
  'ตำบลดอนหายโศก': [17.320, 103.140],
};

// Fallback coordinate if sub-district is not found (Nong Han center)
const DEFAULT_COORD: [number, number] = [17.350, 103.120];

interface MapComponentProps {
  areaData: any[]; // Array of { name, ปกติ, เฝ้าระวัง, พบแพทย์, total }
}

export default function MapComponent({ areaData }: MapComponentProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <div className="w-full h-[500px] rounded-2xl overflow-hidden shadow-inner border border-gray-200">
      <MapContainer 
        center={[17.350, 103.120]} 
        zoom={11} 
        style={{ height: '100%', width: '100%' }}
        scrollWheelZoom={false}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {areaData.map((area, index) => {
          // Try to match the exact name, or add/remove 'ตำบล' if needed
          let coordName = area.name;
          if (!coordName.startsWith('ตำบล') && coordName !== 'ไม่ระบุ') {
            coordName = `ตำบล${coordName}`;
          }

          const coords = SUB_DISTRICT_COORDS[coordName] || [
            DEFAULT_COORD[0] + (Math.random() - 0.5) * 0.05, // Jitter slightly for unknown
            DEFAULT_COORD[1] + (Math.random() - 0.5) * 0.05
          ];

          // Determine dominant color based on most severe cases
          let fillColor = '#10b981'; // Green
          if (area.พบแพทย์ > 0) {
            fillColor = '#f43f5e'; // Red
          } else if (area.เฝ้าระวัง > 0) {
            fillColor = '#f59e0b'; // Yellow
          }

          // Determine circle size based on total cases (min 15, max 40)
          const radius = Math.min(Math.max(area.total * 3, 15), 40);

          return (
            <CircleMarker
              key={index}
              center={coords}
              radius={radius}
              fillColor={fillColor}
              color="white"
              weight={2}
              opacity={1}
              fillOpacity={0.7}
            >
              <Tooltip direction="top" offset={[0, -radius]} opacity={1} permanent={false}>
                <div className="font-bold text-gray-800">{area.name}</div>
                <div className="text-xs text-gray-500">รวม: {area.total} คน</div>
              </Tooltip>
              <Popup>
                <div className="p-1">
                  <h3 className="font-bold text-gray-800 border-b pb-2 mb-2">{area.name}</h3>
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between gap-4">
                      <span className="text-emerald-600 font-medium">● ปกติ</span>
                      <span className="font-bold">{area.ปกติ}</span>
                    </div>
                    <div className="flex justify-between gap-4">
                      <span className="text-amber-500 font-medium">● เฝ้าระวัง</span>
                      <span className="font-bold">{area.เฝ้าระวัง}</span>
                    </div>
                    <div className="flex justify-between gap-4">
                      <span className="text-rose-600 font-medium">● พบแพทย์</span>
                      <span className="font-bold">{area.พบแพทย์}</span>
                    </div>
                    <div className="border-t pt-1 mt-1 flex justify-between gap-4">
                      <span className="text-gray-600 font-bold">รวมทั้งหมด</span>
                      <span className="font-bold">{area.total}</span>
                    </div>
                  </div>
                </div>
              </Popup>
            </CircleMarker>
          );
        })}
      </MapContainer>
    </div>
  );
}
