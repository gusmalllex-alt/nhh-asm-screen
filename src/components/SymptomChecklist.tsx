'use client';

import React from 'react';
import { screeningItems, type ScreeningItem } from '@/data/screeningData';

interface SymptomChecklistProps {
  selectedIds: string[];
  onToggle: (id: string) => void;
}

const groupColors: Record<string, string> = {
  green: 'bg-green-500',
  yellow: 'bg-yellow-400',
  red: 'bg-red-500',
};

const groupBorderColors: Record<string, string> = {
  green: 'border-green-200',
  yellow: 'border-yellow-200',
  red: 'border-red-200',
};

function GroupHeader({ group, label }: { group: string; label: string }) {
  const dotColor =
    group === 'green'
      ? 'bg-green-500'
      : group === 'yellow'
        ? 'bg-yellow-400'
        : 'bg-red-500';
  const textColor =
    group === 'green'
      ? 'text-green-700'
      : group === 'yellow'
        ? 'text-yellow-700'
        : 'text-red-700';
  const bgColor =
    group === 'green'
      ? 'bg-green-50'
      : group === 'yellow'
        ? 'bg-yellow-50'
        : 'bg-red-50';

  return (
    <div
      className={`flex items-center gap-2 px-3 py-2 rounded-xl ${bgColor} mb-2 mt-4 first:mt-0`}
    >
      <span className={`w-3 h-3 rounded-full ${dotColor}`} />
      <span className={`text-sm font-semibold ${textColor}`}>{label}</span>
    </div>
  );
}

export default function SymptomChecklist({
  selectedIds,
  onToggle,
}: SymptomChecklistProps) {
  // Group items
  const greenItems = screeningItems.filter((i) => i.group === 'green');
  const yellowItems = screeningItems.filter((i) => i.group === 'yellow');
  const redItems = screeningItems.filter((i) => i.group === 'red');

  const renderItem = (item: ScreeningItem) => {
    const isChecked = selectedIds.includes(item.id);
    return (
      <div
        key={item.id}
        role="button"
        tabIndex={0}
        className={`check-item rounded-[16px] p-4 sm:p-5 mb-3 cursor-pointer select-none active:scale-[0.98] transition-transform ${
          isChecked ? 'checked' : ''
        }`}
        onClick={() => onToggle(item.id)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            onToggle(item.id);
          }
        }}
      >
        <div className="flex items-center gap-4">
          <div className="flex-shrink-0">
            <div
              className={`w-7 h-7 rounded-lg border-2 flex items-center justify-center transition-all duration-200 ${
                isChecked
                  ? 'bg-blue-500 border-blue-500 scale-110'
                  : 'bg-white border-gray-300'
              }`}
            >
              {isChecked && (
                <svg
                  className="w-5 h-5 text-white"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={3}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              )}
            </div>
          </div>
          <div className="flex-1 min-w-0">
            <span className="text-[16px] sm:text-[17px] leading-relaxed text-gray-800">
              {item.label}
            </span>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="glass-card p-5 sm:p-6 mb-4">
      <h2 className="text-lg sm:text-xl font-bold mb-2 flex items-center gap-2">
        <span className="w-1.5 h-6 bg-blue-500 rounded-full" />
        ข้อที่เลือกประเมิน
      </h2>
      <p className="text-sm text-gray-500 mb-4 leading-relaxed">
        เลือกอาการหรือข้อที่พบจริง ระบบจะคำนวณคะแนนและสรุปผลให้อัตโนมัติ
      </p>

      {screeningItems.map(renderItem)}
    </div>
  );
}
