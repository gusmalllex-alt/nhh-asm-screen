'use client';

import React, { useEffect, useState, useMemo } from 'react';
import { fetchGoogleSheetData, deleteGoogleSheetData, updateGoogleSheetData } from '@/utils/googleSheets';

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

export default function AdminDataPage() {
  const [data, setData] = useState<DataRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  
  // Edit State
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Partial<DataRow>>({});

  const loadData = async () => {
    setLoading(true);
    const rows = await fetchGoogleSheetData();
    setData(rows);
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleDelete = async (id: string) => {
    if (window.confirm('คุณแน่ใจหรือไม่ที่จะลบข้อมูลนี้?')) {
      const success = await deleteGoogleSheetData(id);
      if (success) {
        alert('ลบข้อมูลสำเร็จ');
        loadData();
      } else {
        alert('ลบข้อมูลล้มเหลว');
      }
    }
  };

  const startEdit = (row: DataRow) => {
    setEditingId(row.id);
    setEditForm(row);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditForm({});
  };

  const handleSaveEdit = async () => {
    if (!editForm.id) return;
    const success = await updateGoogleSheetData(editForm as any);
    if (success) {
      alert('บันทึกการแก้ไขสำเร็จ');
      setEditingId(null);
      loadData();
    } else {
      alert('บันทึกการแก้ไขล้มเหลว');
    }
  };

  // Filter Data
  const filteredData = useMemo(() => {
    return data.filter(item => {
      const matchSearch = 
        String(item.firstName || '').includes(searchTerm) || 
        String(item.lastName || '').includes(searchTerm) || 
        String(item.id || '').includes(searchTerm);
        
      let matchDate = true;
      if (startDate && item.assessDate) {
        matchDate = matchDate && new Date(item.assessDate) >= new Date(startDate);
      }
      if (endDate && item.assessDate) {
        matchDate = matchDate && new Date(item.assessDate) <= new Date(endDate);
      }
      
      return matchSearch && matchDate;
    });
  }, [data, searchTerm, startDate, endDate]);

  if (loading) {
    return <div className="flex justify-center items-center h-64"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div></div>;
  }

  return (
    <div className="bg-white rounded-[20px] shadow-sm border border-gray-200 p-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4">
        <h1 className="text-2xl font-bold text-gray-800">ข้อมูลผู้ป่วยทั้งหมด</h1>
        <button onClick={loadData} className="px-4 py-2 bg-blue-50 text-blue-600 rounded-lg text-sm font-medium hover:bg-blue-100 transition-colors">
          รีเฟรชข้อมูล
        </button>
      </div>

      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6 p-4 bg-gray-50 rounded-xl">
        <div>
          <label className="block text-xs text-gray-500 mb-1">ค้นหาชื่อ หรือ ID</label>
          <input 
            type="text" 
            placeholder="พิมพ์คำค้นหา..." 
            className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div>
          <label className="block text-xs text-gray-500 mb-1">ตั้งแต่วันที่</label>
          <input 
            type="date" 
            className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
          />
        </div>
        <div>
          <label className="block text-xs text-gray-500 mb-1">ถึงวันที่</label>
          <input 
            type="date" 
            className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
          />
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-xl border border-gray-200">
        <table className="w-full text-left border-collapse min-w-[800px]">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="p-4 text-xs font-semibold text-gray-600">วันที่ประเมิน</th>
              <th className="p-4 text-xs font-semibold text-gray-600">ชื่อ-นามสกุล</th>
              <th className="p-4 text-xs font-semibold text-gray-600">คะแนน</th>
              <th className="p-4 text-xs font-semibold text-gray-600">สถานะ</th>
              <th className="p-4 text-xs font-semibold text-gray-600">จัดการ</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filteredData.map((row, idx) => (
              <tr key={idx} className="hover:bg-gray-50/50 transition-colors">
                <td className="p-4 text-sm text-gray-600">
                  {editingId === row.id ? (
                    <input type="date" className="border rounded px-2 py-1 text-sm w-full" value={editForm.assessDate || ''} onChange={e => setEditForm({...editForm, assessDate: e.target.value})} />
                  ) : row.assessDate}
                </td>
                <td className="p-4 text-sm text-gray-800 font-medium">
                  {editingId === row.id ? (
                    <div className="flex gap-2">
                      <input type="text" className="border rounded px-2 py-1 text-sm w-1/2" value={editForm.firstName || ''} onChange={e => setEditForm({...editForm, firstName: e.target.value})} />
                      <input type="text" className="border rounded px-2 py-1 text-sm w-1/2" value={editForm.lastName || ''} onChange={e => setEditForm({...editForm, lastName: e.target.value})} />
                    </div>
                  ) : `${row.firstName} ${row.lastName}`}
                </td>
                <td className="p-4 text-sm text-gray-600">
                  {editingId === row.id ? (
                    <input type="number" className="border rounded px-2 py-1 text-sm w-16" value={editForm.score || 0} onChange={e => setEditForm({...editForm, score: parseInt(e.target.value)})} />
                  ) : row.score}
                </td>
                <td className="p-4 text-sm">
                  <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                    row.levelLabel.includes('ปกติ') ? 'bg-green-100 text-green-700' :
                    row.levelLabel.includes('เฝ้าระวัง') ? 'bg-yellow-100 text-yellow-800' :
                    'bg-red-100 text-red-700'
                  }`}>
                    {row.levelLabel.split(' ')[1] || row.levelLabel}
                  </span>
                </td>
                <td className="p-4 text-sm">
                  {editingId === row.id ? (
                    <div className="flex gap-2">
                      <button onClick={handleSaveEdit} className="text-green-600 hover:text-green-800 font-medium">บันทึก</button>
                      <button onClick={cancelEdit} className="text-gray-500 hover:text-gray-700 font-medium">ยกเลิก</button>
                    </div>
                  ) : (
                    <div className="flex gap-3">
                      <button onClick={() => startEdit(row)} className="text-blue-600 hover:text-blue-800 font-medium">แก้ไข</button>
                      <button onClick={() => handleDelete(row.id)} className="text-red-600 hover:text-red-800 font-medium">ลบ</button>
                    </div>
                  )}
                </td>
              </tr>
            ))}
            {filteredData.length === 0 && (
              <tr>
                <td colSpan={5} className="p-8 text-center text-gray-500">
                  ไม่พบข้อมูลที่ตรงกับเงื่อนไขการค้นหา
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
