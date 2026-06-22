'use client';

import React from 'react';
import { screeningItems, type ScreeningResult } from '@/data/screeningData';
import { formatThaiDateLong } from '@/utils/dateUtils';

interface ResultModalProps {
  result: ScreeningResult | null;
  isOpen: boolean;
  onClose: () => void;
  onNewScreening: () => void;
}

export default function ResultModal({
  result,
  isOpen,
  onClose,
  onNewScreening,
}: ResultModalProps) {
  if (!isOpen || !result) return null;

  const colorConfig = {
    green: {
      bg: 'bg-green-500',
      bgLight: 'bg-green-50',
      text: 'text-green-700',
      border: 'border-green-200',
      ring: 'ring-green-200',
      pulseClass: 'pulse-green',
      emoji: '✅',
      gradientFrom: 'from-green-400',
      gradientTo: 'to-emerald-500',
    },
    yellow: {
      bg: 'bg-yellow-400',
      bgLight: 'bg-yellow-50',
      text: 'text-yellow-700',
      border: 'border-yellow-200',
      ring: 'ring-yellow-200',
      pulseClass: 'pulse-yellow',
      emoji: '⚠️',
      gradientFrom: 'from-yellow-400',
      gradientTo: 'to-amber-500',
    },
    red: {
      bg: 'bg-red-500',
      bgLight: 'bg-red-50',
      text: 'text-red-700',
      border: 'border-red-200',
      ring: 'ring-red-200',
      pulseClass: 'pulse-red',
      emoji: '🚨',
      gradientFrom: 'from-red-400',
      gradientTo: 'to-rose-600',
    },
  };

  const config = colorConfig[result.level];
  const selectedItemDetails = screeningItems.filter((item) =>
    result.selectedItems.includes(item.id)
  );

  return (
    <div
      className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center"
      onClick={onClose}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm animate-scale-in" />

      {/* Modal */}
      <div
        className="relative w-full max-w-lg mx-auto bg-white rounded-t-[28px] sm:rounded-[28px] max-h-[90vh] overflow-y-auto shadow-2xl animate-slide-up"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Color header */}
        <div
          className={`bg-gradient-to-br ${config.gradientFrom} ${config.gradientTo} p-6 sm:p-8 text-center rounded-t-[28px] sm:rounded-t-[28px]`}
        >
          <div
            className={`inline-flex items-center justify-center w-24 h-24 rounded-full bg-white/20 backdrop-blur-sm mb-4`}
            style={{
              animation: `${config.pulseClass} 2s ease-in-out infinite`,
            }}
          >
            <div className="w-16 h-16 rounded-full bg-white/90 flex items-center justify-center">
              <span className="text-4xl">{config.emoji}</span>
            </div>
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold text-white mb-1">
            คะแนน: {result.score}
          </h2>
          <p className="text-white/90 text-[15px] font-medium">
            {result.levelLabel}
          </p>
        </div>

        {/* Content */}
        <div className="p-5 sm:p-6">
          {/* Patient info */}
          <div className="flex items-center gap-3 mb-4 text-sm text-gray-600">
            <div className="flex items-center gap-1.5">
              <svg
                className="w-4 h-4 text-gray-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                />
              </svg>
              <span className="font-medium">
                {result.firstName} {result.lastName}
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <svg
                className="w-4 h-4 text-gray-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
              <span>{formatThaiDateLong(result.assessDate)}</span>
            </div>
          </div>

          {/* Sync Status Badge inside Modal */}
          {result.syncStatus && (
            <div className={`flex items-center gap-2 mb-4 p-2.5 rounded-xl text-xs font-semibold ${
              result.syncStatus === 'synced'
                ? 'bg-green-50 text-green-700 border border-green-200'
                : result.syncStatus === 'pending'
                  ? 'bg-blue-50 text-blue-700 border border-blue-200 animate-pulse'
                  : 'bg-red-50 text-red-700 border border-red-200'
            }`}>
              {result.syncStatus === 'synced' ? (
                <>
                  <span className="flex h-2 w-2 relative">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                  </span>
                  <span>บันทึกข้อมูลลง Google Sheet สำเร็จ</span>
                </>
              ) : result.syncStatus === 'pending' ? (
                <>
                  <span className="flex h-2 w-2 relative">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
                  </span>
                  <span>กำลังส่งข้อมูลไปยัง Google Sheet...</span>
                </>
              ) : (
                <>
                  <span className="flex h-2 w-2 relative">
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                  </span>
                  <span>ส่งข้อมูลล้มเหลว (กรุณาตรวจสอบการเชื่อมต่ออินเทอร์เน็ต)</span>
                </>
              )}
            </div>
          )}

          {/* Recommendation */}
          <div
            className={`${config.bgLight} ${config.border} border rounded-2xl p-4 mb-4`}
          >
            <h3
              className={`text-sm font-bold ${config.text} mb-2 flex items-center gap-1.5`}
            >
              <svg
                className="w-4 h-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                />
              </svg>
              คำแนะนำ
            </h3>
            <p className="text-sm text-gray-700 leading-relaxed">
              {result.recommendation}
            </p>
          </div>

          {/* Selected symptoms */}
          {selectedItemDetails.length > 0 && (
            <div className="mb-5">
              <h3 className="text-sm font-bold text-gray-600 mb-2">
                อาการที่พบ ({selectedItemDetails.length} ข้อ)
              </h3>
              <div className="space-y-1.5">
                {selectedItemDetails.map((item) => {
                  const dotColor =
                    item.group === 'green'
                      ? 'bg-green-500'
                      : item.group === 'yellow'
                        ? 'bg-yellow-400'
                        : 'bg-red-500';
                  return (
                    <div
                      key={item.id}
                      className="flex items-start gap-2 text-sm text-gray-700"
                    >
                      <span
                        className={`w-2 h-2 rounded-full ${dotColor} mt-1.5 flex-shrink-0`}
                      />
                      <span>{item.label}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Buttons */}
          <div className="flex gap-3">
            <button
              className="btn-primary flex-1"
              onClick={onNewScreening}
            >
              <svg
                className="w-5 h-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 4v16m8-8H4"
                />
              </svg>
              คัดกรองใหม่
            </button>
            <button className="btn-secondary flex-1" onClick={onClose}>
              ปิด
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
