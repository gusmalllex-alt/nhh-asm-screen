'use client';

import React, { useRef } from 'react';
import { formatThaiDate } from '@/utils/dateUtils';

interface PatientInfoFormProps {
  firstName: string;
  lastName: string;
  assessDate: string;
  onFirstNameChange: (val: string) => void;
  onLastNameChange: (val: string) => void;
  onAssessDateChange: (val: string) => void;
}

export default function PatientInfoForm({
  firstName,
  lastName,
  assessDate,
  onFirstNameChange,
  onLastNameChange,
  onAssessDateChange,
}: PatientInfoFormProps) {
  const dateInputRef = useRef<HTMLInputElement>(null);

  const openDatePicker = () => {
    dateInputRef.current?.showPicker?.();
    dateInputRef.current?.focus();
  };

  return (
    <div className="glass-card p-5 sm:p-6 mb-4">
      <h2 className="text-lg sm:text-xl font-bold mb-4 flex items-center gap-2">
        <span className="w-1.5 h-6 bg-blue-500 rounded-full" />
        ข้อมูลพื้นฐาน
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
        <div>
          <label
            htmlFor="first_name"
            className="block text-sm font-semibold text-gray-700 mb-1.5"
          >
            ชื่อ
          </label>
          <input
            type="text"
            id="first_name"
            className="form-input"
            placeholder="กรอกชื่อ"
            value={firstName}
            onChange={(e) => onFirstNameChange(e.target.value)}
          />
        </div>
        <div>
          <label
            htmlFor="last_name"
            className="block text-sm font-semibold text-gray-700 mb-1.5"
          >
            สกุล
          </label>
          <input
            type="text"
            id="last_name"
            className="form-input"
            placeholder="กรอกนามสกุล"
            value={lastName}
            onChange={(e) => onLastNameChange(e.target.value)}
          />
        </div>
        <div>
          <label
            className="block text-sm font-semibold text-gray-700 mb-1.5"
          >
            วันที่ประเมิน
          </label>
          <div className="relative">
            {/* แสดงวันที่แบบไทย */}
            <div
              className="form-input cursor-pointer flex items-center justify-between"
              onClick={openDatePicker}
            >
              <span className={assessDate ? 'text-gray-800' : 'text-gray-400'}>
                {assessDate ? formatThaiDate(assessDate) : 'วว/ดด/ปปปป'}
              </span>
              <svg
                className="w-5 h-5 text-gray-400"
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
            </div>
            {/* Hidden native date picker */}
            <input
              ref={dateInputRef}
              type="date"
              id="assess_date"
              className="absolute inset-0 opacity-0 w-full h-full cursor-pointer"
              value={assessDate}
              onChange={(e) => onAssessDateChange(e.target.value)}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

