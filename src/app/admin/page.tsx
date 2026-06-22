'use client';

import React, { useEffect, useState } from 'react';
import { fetchGoogleSheetData } from '@/utils/googleSheets';

interface DataRow {
  id: string;
  firstName: string;
  lastName: string;
  assessDate: string;
  score: number;
  selectedItems: string;
  levelLabel: string;
  recommendation: string;
  createdAt: string;
}

export default function AdminDashboard() {
  const [data, setData] = useState<DataRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      const rows = await fetchGoogleSheetData();
      setData(rows);
      setLoading(false);
    }
    loadData();
  }, []);

  if (loading) {
    return <div className="flex justify-center items-center h-64"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div></div>;
  }

  // Calculate stats
  const total = data.length;
  const greenCount = data.filter(d => d.levelLabel.includes('ปกติ')).length;
  const yellowCount = data.filter(d => d.levelLabel.includes('เฝ้าระวัง')).length;
  const redCount = data.filter(d => d.levelLabel.includes('พบแพทย์')).length;

  const greenPct = total ? Math.round((greenCount / total) * 100) : 0;
  const yellowPct = total ? Math.round((yellowCount / total) * 100) : 0;
  const redPct = total ? Math.round((redCount / total) * 100) : 0;

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-800 mb-6">ภาพรวมสถิติ (Dashboard)</h1>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="glass-card p-6 border-l-4 border-blue-500">
          <p className="text-sm text-gray-500 font-medium">ผู้เข้ารับการประเมินทั้งหมด</p>
          <p className="text-3xl font-bold text-gray-800 mt-2">{total} <span className="text-sm font-normal text-gray-500">คน</span></p>
        </div>
        <div className="glass-card p-6 border-l-4 border-green-500 bg-green-50/30">
          <p className="text-sm text-green-700 font-medium">ระดับปกติ (🟢 เขียว)</p>
          <p className="text-3xl font-bold text-green-800 mt-2">{greenCount} <span className="text-sm font-normal text-green-600">คน</span></p>
        </div>
        <div className="glass-card p-6 border-l-4 border-yellow-400 bg-yellow-50/30">
          <p className="text-sm text-yellow-700 font-medium">เฝ้าระวัง (🟡 เหลือง)</p>
          <p className="text-3xl font-bold text-yellow-800 mt-2">{yellowCount} <span className="text-sm font-normal text-yellow-600">คน</span></p>
        </div>
        <div className="glass-card p-6 border-l-4 border-red-500 bg-red-50/30">
          <p className="text-sm text-red-700 font-medium">ส่งพบแพทย์ (🔴 แดง)</p>
          <p className="text-3xl font-bold text-red-800 mt-2">{redCount} <span className="text-sm font-normal text-red-600">คน</span></p>
        </div>
      </div>

      {/* Visual Charts (CSS Based) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="glass-card p-6">
          <h2 className="text-lg font-bold text-gray-800 mb-6">สัดส่วนระดับความรุนแรง</h2>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-green-700 font-medium">ระดับปกติ</span>
                <span className="text-gray-600">{greenPct}%</span>
              </div>
              <div className="w-full bg-gray-100 rounded-full h-2.5">
                <div className="bg-green-500 h-2.5 rounded-full" style={{ width: `${greenPct}%` }}></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-yellow-700 font-medium">เฝ้าระวัง</span>
                <span className="text-gray-600">{yellowPct}%</span>
              </div>
              <div className="w-full bg-gray-100 rounded-full h-2.5">
                <div className="bg-yellow-400 h-2.5 rounded-full" style={{ width: `${yellowPct}%` }}></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-red-700 font-medium">ส่งพบแพทย์</span>
                <span className="text-gray-600">{redPct}%</span>
              </div>
              <div className="w-full bg-gray-100 rounded-full h-2.5">
                <div className="bg-red-500 h-2.5 rounded-full" style={{ width: `${redPct}%` }}></div>
              </div>
            </div>
          </div>
        </div>

        <div className="glass-card p-6">
          <h2 className="text-lg font-bold text-gray-800 mb-6">ผู้คัดกรองล่าสุด</h2>
          <div className="overflow-hidden">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="pb-3 text-sm font-semibold text-gray-600">ชื่อ-นามสกุล</th>
                  <th className="pb-3 text-sm font-semibold text-gray-600">วันที่</th>
                  <th className="pb-3 text-sm font-semibold text-gray-600 text-right">สถานะ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {data.slice(-5).reverse().map((row, idx) => (
                  <tr key={idx}>
                    <td className="py-3 text-sm text-gray-800">{row.firstName} {row.lastName}</td>
                    <td className="py-3 text-sm text-gray-500">{row.assessDate}</td>
                    <td className="py-3 text-sm text-right">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                        row.levelLabel.includes('ปกติ') ? 'bg-green-100 text-green-700' :
                        row.levelLabel.includes('เฝ้าระวัง') ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-700'
                      }`}>
                        {row.levelLabel.split(' ')[1] || row.levelLabel}
                      </span>
                    </td>
                  </tr>
                ))}
                {data.length === 0 && (
                  <tr>
                    <td colSpan={3} className="py-4 text-center text-sm text-gray-500">ไม่มีข้อมูล</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
