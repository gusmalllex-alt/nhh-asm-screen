'use client';

import React from 'react';

export default function ScoreGuide() {
  return (
    <div className="glass-card p-4 sm:p-5 mb-4">
      <h3 className="text-sm font-bold text-gray-600 mb-3 flex items-center gap-2">
        <svg
          className="w-4 h-4 text-blue-500"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
        เกณฑ์คะแนน
      </h3>
      <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-[15px]">
        <div className="flex items-center gap-1.5">
          <span>0–1 =</span>
          <span className="score-dot bg-green-500" />
          <span className="text-green-600 font-semibold text-sm">ปกติ</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span>2–3 =</span>
          <span className="score-dot bg-yellow-400" />
          <span className="text-yellow-600 font-semibold text-sm">
            เฝ้าระวัง
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          <span>≥ 4 =</span>
          <span className="score-dot bg-red-500" />
          <span className="text-red-600 font-semibold text-sm">
            ส่งพบแพทย์
          </span>
        </div>
      </div>
    </div>
  );
}
