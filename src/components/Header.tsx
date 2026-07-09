'use client';

import React from 'react';

export default function Header() {
  return (
    <div className="hero-gradient rounded-[22px] p-5 sm:p-7 text-white shadow-xl mb-5">
      <div className="flex items-center gap-3 mb-2">
        <div className="flex items-center gap-2.5">
          <span className="traffic-dot green" />
          <span className="traffic-dot yellow" />
          <span className="traffic-dot red" />
        </div>
        <h1 className="text-[22px] sm:text-[28px] font-bold leading-tight">
          SOS score 3สี
        </h1>
      </div>
      <div className="flex items-center justify-between">
        <p className="text-[15px] sm:text-[16px] opacity-95 leading-relaxed">
          คัดกรองผู้ป่วยโรคติดเชื้อในกระแสโลหิต
        </p>
        <div className="text-right">
          <div className="text-[11px] opacity-70 leading-none">
            โรงพยาบาลหนองหาน
          </div>
          <div className="text-[10px] opacity-50">Nonghan Hospital</div>
        </div>
      </div>
    </div>
  );
}
