'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  getScreeningHistory,
  deleteScreeningResult,
  clearAllHistory,
  screeningItems,
  updateSyncStatus,
  type ScreeningResult,
} from '@/data/screeningData';
import { formatThaiDateLong } from '@/utils/dateUtils';
import {
  getGoogleSheetUrl,
  saveGoogleSheetUrl,
  sendToGoogleSheet,
} from '@/utils/googleSheets';

export default function HistoryList() {
  const [history, setHistory] = useState<ScreeningResult[]>([]);
  const [showConfirmClear, setShowConfirmClear] = useState(false);

  // Google Sheets state
  const [sheetUrl, setSheetUrl] = useState('');
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [testStatus, setTestStatus] = useState<'idle' | 'testing' | 'success' | 'failed'>('idle');
  const [testMessage, setTestMessage] = useState('');
  const [saveStatus, setSaveStatus] = useState(false);
  const [isSyncingMap, setIsSyncingMap] = useState<Record<string, boolean>>({});
  const [isSyncingAll, setIsSyncingAll] = useState(false);

  useEffect(() => {
    setHistory(getScreeningHistory());
    setSheetUrl(getGoogleSheetUrl());
  }, []);

  const handleDelete = (id: string) => {
    deleteScreeningResult(id);
    setHistory(getScreeningHistory());
  };

  const handleClearAll = () => {
    clearAllHistory();
    setHistory([]);
    setShowConfirmClear(false);
  };

  const handleSaveUrl = () => {
    saveGoogleSheetUrl(sheetUrl);
    setSaveStatus(true);
    setTimeout(() => setSaveStatus(false), 3000);
    setHistory(getScreeningHistory());
  };

  const handleTestConnection = async () => {
    if (!sheetUrl.trim()) {
      setTestStatus('failed');
      setTestMessage('กรุณากรอก URL ก่อนทดสอบ');
      return;
    }
    setTestStatus('testing');
    setTestMessage('กำลังส่งคำขอทดสอบไปยัง Google Sheets...');
    try {
      const res = await fetch(sheetUrl.trim(), { method: 'GET', mode: 'cors' });
      if (res.ok) {
        const data = await res.json();
        if (data && data.status === 'ok') {
          setTestStatus('success');
          setTestMessage('✅ เชื่อมต่อสำเร็จ! สคริปต์ Google Apps Script พร้อมบันทึกข้อมูลแล้ว');
        } else {
          setTestStatus('failed');
          setTestMessage('❌ เชื่อมต่อได้ แต่สคริปต์ส่งการตอบกลับที่ไม่ถูกต้อง');
        }
      } else {
        setTestStatus('failed');
        setTestMessage(`❌ เชื่อมต่อล้มเหลว (HTTP Status ${res.status})`);
      }
    } catch (err) {
      console.error(err);
      setTestStatus('failed');
      setTestMessage('❌ การเชื่อมต่อล้มเหลว กรุณาตรวจสอบ URL หรือการตั้งค่า CORS/การแชร์ Web App');
    }
  };

  const handleRetrySync = async (record: ScreeningResult) => {
    if (!sheetUrl) return;
    setIsSyncingMap((prev) => ({ ...prev, [record.id]: true }));
    updateSyncStatus(record.id, 'pending');
    setHistory(getScreeningHistory());

    const success = await sendToGoogleSheet(record, sheetUrl);
    
    if (success) {
      updateSyncStatus(record.id, 'synced');
    } else {
      updateSyncStatus(record.id, 'failed');
    }
    
    setIsSyncingMap((prev) => ({ ...prev, [record.id]: false }));
    setHistory(getScreeningHistory());
  };

  const handleSyncAll = async () => {
    const unsyncedRecords = history.filter((r) => r.syncStatus !== 'synced');
    if (unsyncedRecords.length === 0 || !sheetUrl) return;

    setIsSyncingAll(true);
    
    // Set all to pending locally first
    for (const record of unsyncedRecords) {
      setIsSyncingMap((prev) => ({ ...prev, [record.id]: true }));
      updateSyncStatus(record.id, 'pending');
    }
    setHistory(getScreeningHistory());

    // Sync sequentially
    for (const record of unsyncedRecords) {
      const success = await sendToGoogleSheet(record, sheetUrl);
      if (success) {
        updateSyncStatus(record.id, 'synced');
      } else {
        updateSyncStatus(record.id, 'failed');
      }
      setIsSyncingMap((prev) => ({ ...prev, [record.id]: false }));
    }

    setHistory(getScreeningHistory());
    setIsSyncingAll(false);
  };

  const levelConfig = {
    green: {
      bg: 'bg-green-100',
      text: 'text-green-700',
      dot: 'bg-green-500',
      label: 'ปกติ',
    },
    yellow: {
      bg: 'bg-yellow-100',
      text: 'text-yellow-700',
      dot: 'bg-yellow-400',
      label: 'เฝ้าระวัง',
    },
    red: {
      bg: 'bg-red-100',
      text: 'text-red-700',
      dot: 'bg-red-500',
      label: 'ส่งพบแพทย์',
    },
  };

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg sm:text-xl font-bold flex items-center gap-2">
          <svg
            className="w-5 h-5 text-blue-500"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          ประวัติการคัดกรอง
        </h2>
        <div className="flex items-center gap-2">
          {sheetUrl && history.filter((r) => r.syncStatus !== 'synced').length > 0 && (
            <button
              className="text-xs text-blue-600 hover:text-blue-800 font-semibold px-3 py-1.5 rounded-lg bg-blue-50 hover:bg-blue-100 transition-colors disabled:opacity-50"
              onClick={handleSyncAll}
              disabled={isSyncingAll}
            >
              {isSyncingAll ? 'กำลังซิงค์...' : `ซิงค์ค้างอยู่ (${history.filter((r) => r.syncStatus !== 'synced').length})`}
            </button>
          )}
          {history.length > 0 && (
            <button
              className="text-xs text-red-500 hover:text-red-700 font-medium px-3 py-1.5 rounded-lg hover:bg-red-50 transition-colors"
              onClick={() => setShowConfirmClear(true)}
            >
              ลบทั้งหมด
            </button>
          )}
        </div>
      </div>

      {/* Google Sheets Settings Card */}
      <div className="glass-card p-4 mb-4 border border-blue-100 bg-blue-50/40">
        <button
          onClick={() => setIsSettingsOpen(!isSettingsOpen)}
          className="flex items-center justify-between w-full font-semibold text-sm text-blue-800 hover:text-blue-900 transition-colors"
        >
          <div className="flex items-center gap-2">
            <svg
              className="w-5 h-5 text-blue-500"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
              />
            </svg>
            <span>ตั้งค่า Google Sheets</span>
            {sheetUrl && (
              <span className="bg-green-100 text-green-700 text-[10px] px-2 py-0.5 rounded-full font-medium">
                เชื่อมต่อแล้ว
              </span>
            )}
          </div>
          <svg
            className={`w-4 h-4 text-blue-600 transition-transform duration-200 ${
              isSettingsOpen ? 'rotate-180' : ''
            }`}
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
        </button>

        {isSettingsOpen && (
          <div className="mt-4 pt-3 border-t border-blue-100 space-y-3 animate-fade-in">
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5">
                Google Apps Script Web App URL
              </label>
              <input
                type="url"
                value={sheetUrl}
                onChange={(e) => setSheetUrl(e.target.value)}
                placeholder="https://script.google.com/macros/s/.../exec"
                className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-blue-200 bg-white/80 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all font-mono"
              />
              <p className="text-[11px] text-gray-500 mt-1">
                กรอกลิงก์ Web App ที่ได้รับการเผยแพร่ (Deploy) แบบ "ทุกคน (Anyone)"
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              <button
                onClick={handleSaveUrl}
                className="px-3.5 py-2 bg-blue-600 text-white rounded-xl text-xs font-semibold hover:bg-blue-700 transition-colors shadow-sm"
              >
                บันทึกการตั้งค่า
              </button>
              <button
                onClick={handleTestConnection}
                disabled={testStatus === 'testing'}
                className="px-3.5 py-2 bg-white border border-blue-200 text-blue-700 rounded-xl text-xs font-semibold hover:bg-blue-50 transition-colors"
              >
                {testStatus === 'testing' ? 'กำลังทดสอบ...' : 'ทดสอบการเชื่อมต่อ'}
              </button>
            </div>

            {saveStatus && (
              <p className="text-xs text-green-600 font-semibold flex items-center gap-1 animate-pulse">
                ✅ บันทึก URL เรียบร้อยแล้ว!
              </p>
            )}

            {testStatus !== 'idle' && (
              <div
                className={`p-2.5 rounded-xl border text-xs leading-relaxed ${
                  testStatus === 'success'
                    ? 'bg-green-50 border-green-200 text-green-700'
                    : testStatus === 'failed'
                      ? 'bg-red-50 border-red-200 text-red-700'
                      : 'bg-blue-50 border-blue-200 text-blue-700'
                }`}
              >
                {testMessage}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Confirm clear dialog */}
      {showConfirmClear && (
        <div className="glass-card p-4 mb-4 border-red-200 border">
          <p className="text-sm text-red-700 font-medium mb-3">
            ต้องการลบประวัติทั้งหมดหรือไม่?
          </p>
          <div className="flex gap-2">
            <button
              className="px-4 py-2 bg-red-500 text-white text-sm rounded-xl font-medium hover:bg-red-600 transition-colors"
              onClick={handleClearAll}
            >
              ยืนยันลบ
            </button>
            <button
              className="px-4 py-2 bg-gray-100 text-gray-600 text-sm rounded-xl font-medium hover:bg-gray-200 transition-colors"
              onClick={() => setShowConfirmClear(false)}
            >
              ยกเลิก
            </button>
          </div>
        </div>
      )}

      {/* Empty state */}
      {history.length === 0 && (
        <div className="glass-card p-8 text-center">
          <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
            <svg
              className="w-8 h-8 text-gray-300"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={1.5}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
              />
            </svg>
          </div>
          <p className="text-gray-400 text-sm mb-4">ยังไม่มีประวัติการคัดกรอง</p>
          <Link href="/" className="btn-primary text-sm">
            เริ่มคัดกรอง
          </Link>
        </div>
      )}

      {/* History list */}
      <div className="space-y-3">
        {history.map((record, idx) => {
          const config = levelConfig[record.level];
          const selectedDetails = screeningItems.filter((item) =>
            record.selectedItems.includes(item.id)
          );
          const isSyncing = isSyncingMap[record.id] || false;

          return (
            <div
              key={record.id}
              className="glass-card p-4 animate-slide-up"
              style={{ animationDelay: `${idx * 50}ms` }}
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span
                    className={`w-3 h-3 rounded-full ${config.dot}`}
                  />
                  <span className="font-semibold text-[15px]">
                    {record.firstName} {record.lastName}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span
                    className={`${config.bg} ${config.text} text-xs font-semibold px-2.5 py-1 rounded-full`}
                  >
                    {config.label}
                  </span>
                  <button
                    className="text-gray-300 hover:text-red-500 transition-colors p-1"
                    onClick={() => handleDelete(record.id)}
                    title="ลบ"
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
                        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                      />
                    </svg>
                  </button>
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-gray-400 mb-2">
                <span>📅 {formatThaiDateLong(record.assessDate)}</span>
                <span>•</span>
                <span>📊 คะแนน: {record.score}</span>
                
                {/* Sync status element */}
                {sheetUrl && (
                  <>
                    <span>•</span>
                    {record.syncStatus === 'synced' ? (
                      <span className="text-green-600 font-medium flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
                        ซิงค์แล้ว
                      </span>
                    ) : record.syncStatus === 'pending' || isSyncing ? (
                      <span className="text-blue-500 font-medium flex items-center gap-1 animate-pulse">
                        <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                        กำลังซิงค์...
                      </span>
                    ) : record.syncStatus === 'failed' ? (
                      <button
                        onClick={() => handleRetrySync(record)}
                        disabled={isSyncing}
                        className="text-red-500 hover:text-red-700 font-medium flex items-center gap-1 hover:underline cursor-pointer bg-red-50 px-2 py-0.5 rounded transition-all text-[11px]"
                      >
                        <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-ping" />
                        ส่งล้มเหลว (กดซิงค์ใหม่)
                      </button>
                    ) : (
                      <button
                        onClick={() => handleRetrySync(record)}
                        disabled={isSyncing}
                        className="text-blue-600 hover:text-blue-800 font-medium flex items-center gap-1 hover:underline cursor-pointer bg-blue-50 px-2 py-0.5 rounded transition-all text-[11px]"
                      >
                        📤 ส่งไปชีต
                      </button>
                    )}
                  </>
                )}
              </div>
              {selectedDetails.length > 0 && (
                <div className="text-xs text-gray-500 leading-relaxed border-t border-gray-50 pt-2 mt-2">
                  <span className="font-semibold text-gray-400">อาการ: </span>
                  {selectedDetails.map((d) => d.label).join(', ')}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
