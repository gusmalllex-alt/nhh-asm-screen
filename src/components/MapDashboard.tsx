'use client';

import React from 'react';
import dynamic from 'next/dynamic';

// Dynamically import the map component with SSR disabled
const MapComponent = dynamic(() => import('./MapComponent'), {
  ssr: false,
  loading: () => (
    <div className="flex justify-center items-center h-[500px] bg-slate-50 rounded-2xl border border-slate-100">
      <div className="flex flex-col items-center gap-4">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
        <p className="text-sm font-medium text-slate-500">กำลังโหลดแผนที่...</p>
      </div>
    </div>
  ),
});

interface MapDashboardProps {
  areaData: any[]; // The same data we passed to the BarChart
}

export default function MapDashboard({ areaData }: MapDashboardProps) {
  return <MapComponent areaData={areaData} />;
}
