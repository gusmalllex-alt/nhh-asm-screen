'use client';

import React, { useEffect, useState, useMemo } from 'react';
import { fetchGoogleSheetData, deleteGoogleSheetData, updateGoogleSheetData } from '@/utils/googleSheets';

interface DataRow {
  id: string;
  firstName: string;
  lastName: string;
  assessDate: string;
  score: number;
  addressNo?: string;
  addressMoo?: string;
  subDistrict?: string;
  phoneNumber?: string;
  selectedItems: string;
  levelLabel: string;
  recommendation: string;
  createdAt: string;
}

export default function AdminDataPage() {
  const [data, setData] = useState<DataRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchSubDistrict, setSearchSubDistrict] = useState('');
  const [searchLevel, setSearchLevel] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  
  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, searchSubDistrict, searchLevel, startDate, endDate]);
  
  // Helper to format phone number to ensure leading zero
  const formatPhone = (phone?: string) => {
    if (!phone) return '-';
    const p = String(phone).trim();
    // Thai numbers have 10 digits and start with 0. If it has 9 digits, it's missing the 0.
    if (p.length === 9 && !p.startsWith('0')) {
      return `0${p}`;
    }
    // Also remove any leading single quote if present
    if (p.startsWith("'")) {
      return p.substring(1);
    }
    return p;
  };
  
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
      const fullName = `${item.firstName || ''} ${item.lastName || ''}`;
      const matchSearch = 
        fullName.includes(searchTerm) || 
        String(item.id || '').includes(searchTerm);
        
      let matchDate = true;
      if (startDate && item.assessDate) {
        matchDate = matchDate && new Date(item.assessDate) >= new Date(startDate);
      }
      if (endDate && item.assessDate) {
        matchDate = matchDate && new Date(item.assessDate) <= new Date(endDate);
      }
      
      let matchSubDistrict = true;
      if (searchSubDistrict) {
        matchSubDistrict = item.subDistrict === searchSubDistrict;
      }
      
      let matchLevel = true;
      if (searchLevel) {
        matchLevel = item.levelLabel === searchLevel;
      }
      
      return matchSearch && matchDate && matchSubDistrict && matchLevel;
    });
  }, [data, searchTerm, searchSubDistrict, searchLevel, startDate, endDate]);

  const totalPages = Math.max(1, Math.ceil(filteredData.length / itemsPerPage));
  const paginatedData = useMemo(() => {
    return filteredData.slice(
      (currentPage - 1) * itemsPerPage,
      currentPage * itemsPerPage
    );
  }, [filteredData, currentPage, itemsPerPage]);

  if (loading) {
    return <div className="flex justify-center items-center h-64"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div></div>;
  }

  return (
    <div className="bg-white rounded-[24px] shadow-sm border border-gray-100 overflow-hidden">
      <div className="p-6 md:p-8 border-b border-gray-50 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gray-50/30">
        <div>
          <h1 className="text-2xl font-extrabold text-gray-800 tracking-tight flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 002-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>
            </div>
            ข้อมูลผู้ป่วยทั้งหมด
          </h1>
          <p className="text-sm text-gray-500 mt-1 ml-13">จัดการและค้นหาประวัติการคัดกรองของผู้ป่วย</p>
        </div>
        <button onClick={loadData} className="inline-flex items-center gap-2 px-5 py-2.5 bg-white border border-gray-200 text-gray-700 rounded-xl text-sm font-semibold hover:bg-gray-50 hover:text-blue-600 transition-all shadow-sm">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
          รีเฟรชข้อมูล
        </button>
      </div>

      {/* Filters */}
      <div className="p-6 md:p-8 bg-white border-b border-gray-50">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-5">
          <div className="relative">
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">ค้นหาชื่อ หรือ ID</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
              </div>
              <input 
                type="text" 
                placeholder="พิมพ์คำค้นหา..." 
                className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:bg-white focus:border-blue-500 outline-none transition-all"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">ตำบล</label>
            <select 
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:bg-white focus:border-blue-500 outline-none transition-all"
              value={searchSubDistrict}
              onChange={(e) => setSearchSubDistrict(e.target.value)}
            >
              <option value="">ทั้งหมด</option>
              {['ตำบลหนองหาน','ตำบลหนองเม็ก','ตำบลพังงู','ตำบลสะแบง','ตำบลสร้อยพร้าว','ตำบลบ้านเชียง','ตำบลบ้านยา','ตำบลโพนงาม','ตำบลผักตบ','ตำบลหนองไผ่','ตำบลหนองสระปลา','ตำบลดอนหายโศก'].map(t => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">ระดับความรุนแรง (สี)</label>
            <select 
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:bg-white focus:border-blue-500 outline-none transition-all"
              value={searchLevel}
              onChange={(e) => setSearchLevel(e.target.value)}
            >
              <option value="">ทั้งหมด</option>
              <option value="ปกติ">ปกติ (สีเขียว)</option>
              <option value="เฝ้าระวัง">เฝ้าระวัง (สีเหลือง)</option>
              <option value="พบแพทย์">พบแพทย์ (สีแดง)</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">ตั้งแต่วันที่</label>
            <input 
              type="date" 
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:bg-white focus:border-blue-500 outline-none transition-all"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">ถึงวันที่</label>
            <input 
              type="date" 
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:bg-white focus:border-blue-500 outline-none transition-all"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto p-6 md:p-8 pt-4">
        <table className="w-full text-left border-collapse min-w-[800px]">
          <thead className="bg-slate-50">
            <tr>
              <th className="px-4 py-3.5 text-xs font-bold text-slate-500 uppercase tracking-wider border-y border-slate-200 border-r border-r-slate-100 whitespace-nowrap w-32 min-w-[120px]">วันที่ประเมิน</th>
              <th className="px-4 py-3.5 text-xs font-bold text-slate-500 uppercase tracking-wider border-y border-slate-200 border-r border-r-slate-100 whitespace-nowrap w-48 min-w-[200px]">ชื่อ-นามสกุล</th>
              <th className="px-4 py-3.5 text-xs font-bold text-slate-500 uppercase tracking-wider border-y border-slate-200 border-r border-r-slate-100 whitespace-nowrap w-48 min-w-[250px]">ที่อยู่ / เบอร์โทร</th>
              <th className="px-4 py-3.5 text-xs font-bold text-slate-500 uppercase tracking-wider border-y border-slate-200 border-r border-r-slate-100 w-full min-w-[300px]">อาการที่พบ</th>
              <th className="px-4 py-3.5 text-xs font-bold text-slate-500 uppercase tracking-wider border-y border-slate-200 border-r border-r-slate-100 whitespace-nowrap w-auto min-w-[150px]">คะแนน / สถานะ</th>
              <th className="px-4 py-3.5 text-xs font-bold text-slate-500 uppercase tracking-wider border-y border-slate-200 border-r border-r-slate-100 min-w-[200px]">คำแนะนำ</th>
              <th className="px-4 py-3.5 text-xs font-bold text-slate-500 uppercase tracking-wider border-y border-slate-200 text-right whitespace-nowrap w-24">จัดการ</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 bg-white">
            {paginatedData.map((row, idx) => (
              <tr key={idx} className="hover:bg-blue-50/40 transition-colors group">
                <td className="px-4 py-4 text-sm text-gray-500">
                  {editingId === row.id ? (
                    <input type="date" className="border border-gray-300 rounded-lg px-3 py-2 text-sm w-full focus:ring-2 focus:ring-blue-500 outline-none" value={editForm.assessDate || ''} onChange={e => setEditForm({...editForm, assessDate: e.target.value})} />
                  ) : row.assessDate ? row.assessDate.split('T')[0] : ''}
                </td>
                <td className="px-4 py-4 text-sm text-gray-800 font-semibold align-top">
                  {editingId === row.id ? (
                    <div className="flex flex-col gap-2">
                      <input type="text" placeholder="ชื่อ" className="border border-gray-300 rounded-lg px-3 py-2 text-sm w-full focus:ring-2 focus:ring-blue-500 outline-none" value={editForm.firstName || ''} onChange={e => setEditForm({...editForm, firstName: e.target.value})} />
                      <input type="text" placeholder="นามสกุล" className="border border-gray-300 rounded-lg px-3 py-2 text-sm w-full focus:ring-2 focus:ring-blue-500 outline-none" value={editForm.lastName || ''} onChange={e => setEditForm({...editForm, lastName: e.target.value})} />
                    </div>
                  ) : `${row.firstName} ${row.lastName}`}
                </td>
                <td className="px-4 py-4 text-sm text-gray-600 align-top">
                  {editingId === row.id ? (
                    <div className="flex flex-col gap-2">
                      <div className="flex gap-2">
                        <input type="text" placeholder="บ้านเลขที่" className="border border-gray-300 rounded-lg px-2 py-2 text-sm w-1/2 focus:ring-2 focus:ring-blue-500 outline-none" value={editForm.addressNo || ''} onChange={e => setEditForm({...editForm, addressNo: e.target.value})} />
                        <input type="text" placeholder="หมู่ที่" className="border border-gray-300 rounded-lg px-2 py-2 text-sm w-1/2 focus:ring-2 focus:ring-blue-500 outline-none" value={editForm.addressMoo || ''} onChange={e => setEditForm({...editForm, addressMoo: e.target.value})} />
                      </div>
                      <select className="border border-gray-300 rounded-lg px-2 py-2 text-sm w-full focus:ring-2 focus:ring-blue-500 outline-none" value={editForm.subDistrict || ''} onChange={e => setEditForm({...editForm, subDistrict: e.target.value})}>
                        <option value="">-- เลือกตำบล --</option>
                        {['ตำบลหนองหาน','ตำบลหนองเม็ก','ตำบลพังงู','ตำบลสะแบง','ตำบลสร้อยพร้าว','ตำบลบ้านเชียง','ตำบลบ้านยา','ตำบลโพนงาม','ตำบลผักตบ','ตำบลหนองไผ่','ตำบลหนองสระปลา','ตำบลดอนหายโศก'].map(t => <option key={t} value={t}>{t}</option>)}
                      </select>
                      <input type="text" placeholder="เบอร์โทร" className="border border-gray-300 rounded-lg px-2 py-2 text-sm w-full focus:ring-2 focus:ring-blue-500 outline-none" value={editForm.phoneNumber || ''} onChange={e => setEditForm({...editForm, phoneNumber: e.target.value})} />
                    </div>
                  ) : (
                    <div>
                      <div>บ้านเลขที่: {row.addressNo || '-'} ม.{row.addressMoo || '-'}</div>
                      <div>ต.{row.subDistrict || '-'}</div>
                      <div>โทร: {formatPhone(row.phoneNumber)}</div>
                    </div>
                  )}
                </td>
                <td className="px-4 py-4 text-sm text-gray-600 truncate max-w-[600px] whitespace-normal align-top" title={row.selectedItems}>
                  {editingId === row.id ? (
                    <textarea 
                      className="border border-gray-300 rounded-lg px-3 py-2 text-sm w-full h-24 focus:ring-2 focus:ring-blue-500 outline-none resize-none" 
                      value={editForm.selectedItems || ''} 
                      onChange={e => setEditForm({...editForm, selectedItems: e.target.value})}
                      placeholder="อาการที่พบ (คั่นด้วยลูกน้ำ)"
                    />
                  ) : row.selectedItems}
                </td>
                <td className="px-4 py-4 text-sm align-top">
                  <div className="flex flex-col items-start gap-2">
                    {editingId === row.id ? (
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-gray-500">คะแนน:</span>
                        <input type="number" className="border border-gray-300 rounded-lg px-2 py-1 text-sm w-16 focus:ring-2 focus:ring-blue-500 outline-none" value={editForm.score || 0} onChange={e => setEditForm({...editForm, score: parseInt(e.target.value)})} />
                      </div>
                    ) : (
                      <span className="bg-gray-100 border border-gray-200 text-gray-700 px-2.5 py-1.5 rounded-full font-bold shadow-sm text-xs">{row.score} คะแนน</span>
                    )}
                    
                    {editingId === row.id ? (
                      <select className="border border-gray-300 rounded-lg px-2 py-2 text-xs w-full focus:ring-2 focus:ring-blue-500 outline-none mt-1" value={editForm.levelLabel || ''} onChange={e => setEditForm({...editForm, levelLabel: e.target.value})}>
                        <option value="ปกติ — ดูแลตัวเองที่บ้าน">ปกติ — ดูแลตัวเองที่บ้าน</option>
                        <option value="เฝ้าระวัง — ติดตามอาการ">เฝ้าระวัง — ติดตามอาการ</option>
                        <option value="อาการรุนแรง — ส่งพบแพทย์">อาการรุนแรง — ส่งพบแพทย์</option>
                      </select>
                    ) : (
                      <span className={`inline-flex items-center px-3 py-1.5 rounded-full text-xs font-bold shadow-sm ${
                        row.levelLabel.includes('ปกติ') ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' :
                        row.levelLabel.includes('เฝ้าระวัง') ? 'bg-amber-50 text-amber-700 border border-amber-100' :
                        'bg-rose-50 text-rose-700 border border-rose-100'
                      }`}>
                        {row.levelLabel.includes('ปกติ') && <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-2 shadow-[0_0_8px_rgba(16,185,129,0.8)]"></div>}
                        {row.levelLabel.includes('เฝ้าระวัง') && <div className="w-1.5 h-1.5 rounded-full bg-amber-500 mr-2 shadow-[0_0_8px_rgba(245,158,11,0.8)]"></div>}
                        {row.levelLabel.includes('พบแพทย์') && <div className="w-1.5 h-1.5 rounded-full bg-rose-500 mr-2 shadow-[0_0_8px_rgba(244,63,94,0.8)]"></div>}
                        {row.levelLabel.split(' ')[1] || row.levelLabel}
                      </span>
                    )}
                  </div>
                </td>
                <td className="px-4 py-4 text-sm text-gray-600 truncate max-w-[300px] whitespace-normal align-top" title={row.recommendation}>
                  {editingId === row.id ? (
                    <textarea 
                      className="border border-gray-300 rounded-lg px-3 py-2 text-sm w-full h-24 focus:ring-2 focus:ring-blue-500 outline-none resize-none" 
                      value={editForm.recommendation || ''} 
                      onChange={e => setEditForm({...editForm, recommendation: e.target.value})}
                      placeholder="คำแนะนำ"
                    />
                  ) : row.recommendation}
                </td>
                <td className="px-4 py-4 text-sm text-right align-top">
                  {editingId === row.id ? (
                    <div className="flex gap-2 justify-end">
                      <button onClick={handleSaveEdit} className="px-3 py-1.5 bg-blue-600 text-white rounded-lg text-xs font-semibold hover:bg-blue-700 transition-colors shadow-sm">บันทึก</button>
                      <button onClick={cancelEdit} className="px-3 py-1.5 bg-gray-100 text-gray-600 rounded-lg text-xs font-semibold hover:bg-gray-200 transition-colors">ยกเลิก</button>
                    </div>
                  ) : (
                    <div className="flex gap-2 justify-end opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => startEdit(row)} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" title="แก้ไข">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                      </button>
                      <button onClick={() => handleDelete(row.id)} className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors" title="ลบ">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                      </button>
                    </div>
                  )}
                </td>
              </tr>
            ))}
            {paginatedData.length === 0 && (
              <tr>
                <td colSpan={7} className="p-12 text-center text-gray-400 bg-gray-50/50 rounded-xl border border-dashed border-gray-200 m-4 block w-full mt-4">
                  <div className="flex flex-col items-center justify-center">
                    <svg className="w-12 h-12 text-gray-300 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                    ไม่พบข้อมูลที่ตรงกับเงื่อนไขการค้นหา
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Controls */}
      {filteredData.length > 0 && (
        <div className="flex items-center justify-between px-6 py-4 bg-gray-50 border-t border-gray-100">
          <div className="flex flex-1 justify-between sm:hidden">
            <button
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="relative inline-flex items-center rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
            >
              ก่อนหน้า
            </button>
            <button
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="relative ml-3 inline-flex items-center rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
            >
              ถัดไป
            </button>
          </div>
          <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
            <div>
              <p className="text-sm text-gray-700">
                แสดง <span className="font-semibold text-gray-900">{(currentPage - 1) * itemsPerPage + (paginatedData.length > 0 ? 1 : 0)}</span> ถึง <span className="font-semibold text-gray-900">{Math.min(currentPage * itemsPerPage, filteredData.length)}</span> จาก <span className="font-semibold text-gray-900">{filteredData.length}</span> รายการ
              </p>
            </div>
            <div>
              <nav className="isolate inline-flex -space-x-px rounded-lg shadow-sm" aria-label="Pagination">
                <button
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="relative inline-flex items-center rounded-l-lg px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-200 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 disabled:opacity-50 transition-colors"
                >
                  <span className="sr-only">Previous</span>
                  <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                    <path fillRule="evenodd" d="M12.79 5.23a.75.75 0 01-.02 1.06L8.832 10l3.938 3.71a.75.75 0 11-1.04 1.08l-4.5-4.25a.75.75 0 010-1.08l4.5-4.25a.75.75 0 011.06.02z" clipRule="evenodd" />
                  </svg>
                </button>
                
                {Array.from({ length: totalPages }).map((_, idx) => {
                  const page = idx + 1;
                  if (
                    page === 1 || 
                    page === totalPages || 
                    (page >= currentPage - 1 && page <= currentPage + 1)
                  ) {
                    return (
                      <button
                        key={page}
                        onClick={() => setCurrentPage(page)}
                        aria-current={currentPage === page ? "page" : undefined}
                        className={`relative inline-flex items-center px-4 py-2 text-sm font-semibold focus:z-20 focus:outline-offset-0 transition-colors ${
                          currentPage === page 
                            ? "z-10 bg-blue-600 text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600" 
                            : "text-gray-700 ring-1 ring-inset ring-gray-200 hover:bg-gray-50"
                        }`}
                      >
                        {page}
                      </button>
                    );
                  }
                  if (page === currentPage - 2 || page === currentPage + 2) {
                    return <span key={page} className="relative inline-flex items-center px-4 py-2 text-sm font-semibold text-gray-500 ring-1 ring-inset ring-gray-200">...</span>;
                  }
                  return null;
                })}
                
                <button
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="relative inline-flex items-center rounded-r-lg px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-200 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 disabled:opacity-50 transition-colors"
                >
                  <span className="sr-only">Next</span>
                  <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                    <path fillRule="evenodd" d="M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02z" clipRule="evenodd" />
                  </svg>
                </button>
              </nav>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
