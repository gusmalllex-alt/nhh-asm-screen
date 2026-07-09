'use client';

import React, { useRef } from 'react';
import { formatThaiDate } from '@/utils/dateUtils';

export const SUB_DISTRICT_OPTIONS = [
  'ตำบลหนองหาน',
  'ตำบลหนองเม็ก',
  'ตำบลพังงู',
  'ตำบลสะแบง',
  'ตำบลสร้อยพร้าว',
  'ตำบลบ้านเชียง',
  'ตำบลบ้านยา',
  'ตำบลโพนงาม',
  'ตำบลผักตบ',
  'ตำบลหนองไผ่',
  'ตำบลหนองสระปลา',
  'ตำบลดอนหายโศก',
] as const;

interface PatientInfoFormProps {
  firstName: string;
  lastName: string;
  assessDate: string;
  addressNo: string;
  addressMoo: string;
  subDistrict: string;
  phoneNumber: string;
  onFirstNameChange: (val: string) => void;
  onLastNameChange: (val: string) => void;
  onAssessDateChange: (val: string) => void;
  onAddressNoChange: (val: string) => void;
  onAddressMooChange: (val: string) => void;
  onSubDistrictChange: (val: string) => void;
  onPhoneNumberChange: (val: string) => void;
}

export default function PatientInfoForm({
  firstName,
  lastName,
  assessDate,
  addressNo,
  addressMoo,
  subDistrict,
  phoneNumber,
  onFirstNameChange,
  onLastNameChange,
  onAssessDateChange,
  onAddressNoChange,
  onAddressMooChange,
  onSubDistrictChange,
  onPhoneNumberChange,
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

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 mb-3 sm:mb-4">
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
      </div>

      {/* ข้อมูลที่อยู่ */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mb-3 sm:mb-4">
        <div>
          <label
            htmlFor="address_no"
            className="block text-sm font-semibold text-gray-700 mb-1.5"
          >
            บ้านเลขที่
          </label>
          <input
            type="text"
            id="address_no"
            className="form-input"
            placeholder="กรอกบ้านเลขที่"
            value={addressNo}
            onChange={(e) => onAddressNoChange(e.target.value)}
          />
        </div>
        <div>
          <label
            htmlFor="address_moo"
            className="block text-sm font-semibold text-gray-700 mb-1.5"
          >
            หมู่ที่
          </label>
          <input
            type="text"
            id="address_moo"
            className="form-input"
            placeholder="กรอกหมู่"
            value={addressMoo}
            onChange={(e) => onAddressMooChange(e.target.value)}
          />
        </div>
        <div className="col-span-2">
          <label
            htmlFor="sub_district"
            className="block text-sm font-semibold text-gray-700 mb-1.5"
          >
            ตำบล
          </label>
          <div className="relative">
            <select
              id="sub_district"
              className="form-input appearance-none pr-10 cursor-pointer"
              value={subDistrict}
              onChange={(e) => onSubDistrictChange(e.target.value)}
            >
              <option value="">-- เลือกตำบล --</option>
              {SUB_DISTRICT_OPTIONS.map((name) => (
                <option key={name} value={name}>
                  {name}
                </option>
              ))}
            </select>
            <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
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
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 mb-3 sm:mb-4">
        <div>
          <label
            className="block text-sm font-semibold text-gray-700 mb-1.5"
          >
            อำเภอ / จังหวัด
          </label>
          <input
            type="text"
            className="form-input bg-gray-50 text-gray-500 cursor-not-allowed"
            value="อ.หนองหาน จ.อุดรธานี"
            disabled
          />
        </div>
        <div>
          <label
            htmlFor="phone_number"
            className="block text-sm font-semibold text-gray-700 mb-1.5"
          >
            เบอร์โทรศัพท์
          </label>
          <input
            type="tel"
            id="phone_number"
            className="form-input"
            placeholder="กรอกเบอร์โทรศัพท์"
            value={phoneNumber}
            onChange={(e) => onPhoneNumberChange(e.target.value)}
          />
        </div>
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
  );
}


