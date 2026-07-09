'use client';

import React, { useState } from 'react';
import Header from '@/components/Header';
import PatientInfoForm from '@/components/PatientInfoForm';
import SymptomChecklist from '@/components/SymptomChecklist';
import ScoreGuide from '@/components/ScoreGuide';
import ResultModal from '@/components/ResultModal';
import {
  calculateScreening,
  saveScreeningResult,
  updateSyncStatus,
  type ScreeningResult,
} from '@/data/screeningData';
import { sendToGoogleSheet, getGoogleSheetUrl } from '@/utils/googleSheets';

function getTodayDate(): string {
  const d = new Date();
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

function generateId(): string {
  return `scr_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

export default function HomePage() {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [assessDate, setAssessDate] = useState(getTodayDate());
  const [addressNo, setAddressNo] = useState('');
  const [addressMoo, setAddressMoo] = useState('');
  const [subDistrict, setSubDistrict] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [result, setResult] = useState<ScreeningResult | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [error, setError] = useState('');

  const handleToggle = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const handleSubmit = () => {
    // Validation
    if (!firstName.trim() || !lastName.trim()) {
      setError('กรุณากรอกชื่อและนามสกุล');
      return;
    }
    if (!assessDate) {
      setError('กรุณาเลือกวันที่ประเมิน');
      return;
    }
    setError('');

    const screening = calculateScreening(selectedIds);
    const sheetUrl = getGoogleSheetUrl();

    const newResult: ScreeningResult = {
      id: generateId(),
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      assessDate,
      addressNo,
      addressMoo,
      subDistrict,
      phoneNumber,
      selectedItems: [...selectedIds],
      score: screening.score,
      level: screening.level,
      levelLabel: screening.levelLabel,
      recommendation: screening.recommendation,
      createdAt: new Date().toISOString(),
      syncStatus: sheetUrl ? 'pending' : undefined,
    };

    // Save to localStorage
    saveScreeningResult(newResult);
    setResult(newResult);
    setIsModalOpen(true);

    // Sync in background if URL is configured
    if (sheetUrl) {
      sendToGoogleSheet(newResult, sheetUrl).then((success) => {
        const finalStatus = success ? 'synced' : 'failed';
        updateSyncStatus(newResult.id, finalStatus);
        
        // Update the current state so the result modal shows the actual status
        setResult((prev) => {
          if (prev && prev.id === newResult.id) {
            return { ...prev, syncStatus: finalStatus };
          }
          return prev;
        });
      });
    }
  };

  const handleReset = () => {
    setFirstName('');
    setLastName('');
    setAssessDate(getTodayDate());
    setAddressNo('');
    setAddressMoo('');
    setSubDistrict('');
    setPhoneNumber('');
    setSelectedIds([]);
    setResult(null);
    setError('');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleNewScreening = () => {
    setIsModalOpen(false);
    handleReset();
  };

  return (
    <main className="max-w-[600px] mx-auto px-4 pt-4 pb-24 sm:pb-8 min-h-screen">
      <Header />

      <PatientInfoForm
        firstName={firstName}
        lastName={lastName}
        assessDate={assessDate}
        addressNo={addressNo}
        addressMoo={addressMoo}
        subDistrict={subDistrict}
        phoneNumber={phoneNumber}
        onFirstNameChange={setFirstName}
        onLastNameChange={setLastName}
        onAssessDateChange={setAssessDate}
        onAddressNoChange={setAddressNo}
        onAddressMooChange={setAddressMoo}
        onSubDistrictChange={setSubDistrict}
        onPhoneNumberChange={setPhoneNumber}
      />

      <SymptomChecklist selectedIds={selectedIds} onToggle={handleToggle} />

      <ScoreGuide />

      {/* Error message */}
      {error && (
        <div className="glass-card p-4 mb-4 border border-red-200 bg-red-50">
          <p className="text-sm text-red-600 font-medium flex items-center gap-2">
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
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z"
              />
            </svg>
            {error}
          </p>
        </div>
      )}

      {/* Action buttons */}
      <div className="flex gap-3 mb-6">
        <button
          className="btn-primary flex-1"
          onClick={handleSubmit}
          id="btn-submit"
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
              d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          ประเมินผล
        </button>
        <button
          className="btn-secondary"
          onClick={handleReset}
          id="btn-reset"
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
              d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
            />
          </svg>
          ล้าง
        </button>
      </div>

      {/* Live score indicator */}
      {selectedIds.length > 0 && (
        <div className="fixed bottom-16 sm:bottom-4 left-1/2 -translate-x-1/2 z-40">
          <div
            className={`flex items-center gap-2 px-5 py-2.5 rounded-full shadow-lg backdrop-blur-md text-sm font-semibold ${
              selectedIds.length >= 4
                ? 'bg-red-500/90 text-white'
                : selectedIds.length >= 2
                  ? 'bg-yellow-400/90 text-yellow-900'
                  : 'bg-green-500/90 text-white'
            }`}
          >
            <span>
              เลือกแล้ว {selectedIds.length} ข้อ
            </span>
            <span className="opacity-70">|</span>
            <span>
              {selectedIds.length >= 4
                ? '🔴 แดง'
                : selectedIds.length >= 2
                  ? '🟡 เหลือง'
                  : '🟢 เขียว'}
            </span>
          </div>
        </div>
      )}

      {/* Result Modal */}
      <ResultModal
        result={result}
        isOpen={isModalOpen}
        onClose={handleNewScreening}
        onNewScreening={handleNewScreening}
      />
    </main>
  );
}
