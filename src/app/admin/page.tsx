'use client';

import React, { useEffect, useState } from 'react';
import { fetchGoogleSheetData } from '@/utils/googleSheets';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip, Legend, AreaChart, Area, XAxis, YAxis, CartesianGrid, BarChart, Bar, LabelList } from 'recharts';

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

  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const filteredData = React.useMemo(() => {
    return data.filter(item => {
      let matchDate = true;
      if (startDate && item.assessDate) {
        matchDate = matchDate && new Date(item.assessDate) >= new Date(startDate);
      }
      if (endDate && item.assessDate) {
        // Adding 'T23:59:59.999Z' to include the entire end date if it matches string logic,
        // but new Date(endDate) assumes start of day. Let's do it simply.
        matchDate = matchDate && new Date(item.assessDate) <= new Date(endDate + 'T23:59:59.999Z');
      }
      return matchDate;
    });
  }, [data, startDate, endDate]);

  if (loading) {
    return <div className="flex justify-center items-center h-64"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div></div>;
  }

  // Calculate stats
  const total = filteredData.length;
  const greenCount = filteredData.filter(d => d.levelLabel.includes('ปกติ')).length;
  const yellowCount = filteredData.filter(d => d.levelLabel.includes('เฝ้าระวัง')).length;
  const redCount = filteredData.filter(d => d.levelLabel.includes('พบแพทย์')).length;

  const greenPct = total ? Math.round((greenCount / total) * 100) : 0;
  const yellowPct = total ? Math.round((yellowCount / total) * 100) : 0;
  const redPct = total ? Math.round((redCount / total) * 100) : 0;

  // Pie Chart Data
  const pieData = [
    { name: 'ปกติ', value: greenCount, color: '#10b981' },
    { name: 'เฝ้าระวัง', value: yellowCount, color: '#f59e0b' },
    { name: 'ส่งพบแพทย์', value: redCount, color: '#f43f5e' },
  ].filter(item => item.value > 0);

  // Daily Trend Data
  const dailyDataMap = filteredData.reduce((acc, curr) => {
    const date = curr.assessDate ? curr.assessDate.split('T')[0] : 'Unknown';
    if (!acc[date]) {
      acc[date] = { date, ปกติ: 0, เฝ้าระวัง: 0, พบแพทย์: 0, total: 0 };
    }
    acc[date].total += 1;
    if (curr.levelLabel.includes('ปกติ')) acc[date].ปกติ += 1;
    else if (curr.levelLabel.includes('เฝ้าระวัง')) acc[date].เฝ้าระวัง += 1;
    else if (curr.levelLabel.includes('พบแพทย์')) acc[date].พบแพทย์ += 1;
    return acc;
  }, {} as Record<string, any>);

  // Sort and take last 14 days
  const dailyData = Object.values(dailyDataMap)
    .sort((a, b) => a.date.localeCompare(b.date))
    .slice(-14)
    .map(d => ({
      ...d,
      dateShort: d.date.split('-').slice(1).join('/') // e.g., '06/23'
    }));

  // Top Symptoms Data
  const symptomsMap = filteredData.reduce((acc, curr) => {
    if (curr.selectedItems && curr.selectedItems !== 'ไม่มีอาการ') {
      const items = curr.selectedItems.split(',').map(i => i.trim()).filter(i => i !== 'ไม่มีอาการ' && i !== '');
      items.forEach(item => {
        acc[item] = (acc[item] || 0) + 1;
      });
    }
    return acc;
  }, {} as Record<string, number>);

  const topSymptoms = Object.entries(symptomsMap)
    .sort((a, b) => b[1] - a[1]) // sort descending
    .slice(0, 10) // Top 10
    .map(([name, count]) => ({ name, count }));

  // Score Distribution Data
  const scoreMap = filteredData.reduce((acc, curr) => {
    const score = curr.score || 0;
    acc[score] = (acc[score] || 0) + 1;
    return acc;
  }, {} as Record<number, number>);

  const scoreDistribution = Object.entries(scoreMap)
    .sort((a, b) => Number(a[0]) - Number(b[0]))
    .map(([score, count]) => ({
      score: `${score} คะแนน`,
      count
    }));

  // Area (Sub-district) Analysis Data
  const areaDataMap = filteredData.reduce((acc, curr) => {
    const area = curr.subDistrict || 'ไม่ระบุ';
    if (!acc[area]) {
      acc[area] = { name: area, ปกติ: 0, เฝ้าระวัง: 0, พบแพทย์: 0, total: 0 };
    }
    acc[area].total += 1;
    if (curr.levelLabel.includes('ปกติ')) acc[area].ปกติ += 1;
    else if (curr.levelLabel.includes('เฝ้าระวัง')) acc[area].เฝ้าระวัง += 1;
    else if (curr.levelLabel.includes('พบแพทย์')) acc[area].พบแพทย์ += 1;
    return acc;
  }, {} as Record<string, any>);

  const areaData = Object.values(areaDataMap)
    .sort((a, b) => b.total - a.total); // Sort by total cases descending

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white/90 backdrop-blur-sm p-3 border border-gray-100 shadow-xl rounded-xl">
          <p className="font-bold text-gray-800 mb-2">{label}</p>
          {payload.map((entry: any, index: number) => (
            <div key={index} className="flex items-center gap-2 text-sm font-medium">
              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: entry.color }}></div>
              <span className="text-gray-600">{entry.name}:</span>
              <span style={{ color: entry.color }}>{entry.value}</span>
            </div>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">ภาพรวมสถิติ (Dashboard)</h1>
          <p className="text-gray-500 text-sm mt-1">แสดงข้อมูลการคัดกรองสุขภาพและสถิติที่สำคัญ</p>
        </div>
        
        {/* Date Filter */}
        <div className="flex flex-wrap items-center gap-2 bg-white p-2.5 rounded-xl border border-gray-200 shadow-sm">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-gray-600 whitespace-nowrap">ตั้งแต่วันที่:</span>
            <input 
              type="date" 
              className="px-3 py-1.5 border border-gray-200 rounded-lg text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all bg-gray-50"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
          </div>
          <span className="text-gray-300 hidden sm:inline">-</span>
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-gray-600 whitespace-nowrap">ถึงวันที่:</span>
            <input 
              type="date" 
              className="px-3 py-1.5 border border-gray-200 rounded-lg text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all bg-gray-50"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
            />
          </div>
          {(startDate || endDate) && (
            <button 
              onClick={() => { setStartDate(''); setEndDate(''); }}
              className="px-3 py-1.5 bg-red-50 text-red-600 hover:bg-red-100 rounded-lg text-sm font-medium transition-colors"
            >
              ล้าง
            </button>
          )}
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-[20px] p-5 text-white shadow-lg shadow-blue-500/20 relative overflow-hidden group">
          <div className="absolute -right-4 -top-4 opacity-10 group-hover:scale-110 transition-transform duration-500">
            <svg className="w-24 h-24" fill="currentColor" viewBox="0 0 24 24"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/></svg>
          </div>
          <p className="text-blue-100 font-medium text-sm mb-2 relative z-10">จำนวนทั้งหมด</p>
          <div className="flex items-baseline gap-1 relative z-10">
            <h3 className="text-3xl font-extrabold">{total}</h3>
            <span className="text-blue-200 text-sm">คน</span>
          </div>
        </div>

        <div className="bg-gradient-to-br from-emerald-400 to-emerald-500 rounded-[20px] p-5 text-white shadow-lg shadow-emerald-500/20 relative overflow-hidden group">
          <div className="absolute -right-4 -top-4 opacity-10 group-hover:scale-110 transition-transform duration-500">
            <svg className="w-24 h-24" fill="currentColor" viewBox="0 0 24 24"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg>
          </div>
          <p className="text-emerald-50 font-medium text-sm mb-2 relative z-10">ระดับปกติ</p>
          <div className="flex items-baseline gap-1 relative z-10">
            <h3 className="text-3xl font-extrabold">{greenCount}</h3>
            <span className="text-emerald-100 text-sm">คน ({greenPct}%)</span>
          </div>
        </div>

        <div className="bg-gradient-to-br from-amber-400 to-amber-500 rounded-[20px] p-5 text-white shadow-lg shadow-amber-500/20 relative overflow-hidden group">
          <div className="absolute -right-4 -top-4 opacity-10 group-hover:scale-110 transition-transform duration-500">
            <svg className="w-24 h-24" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/></svg>
          </div>
          <p className="text-amber-50 font-medium text-sm mb-2 relative z-10">เฝ้าระวัง</p>
          <div className="flex items-baseline gap-1 relative z-10">
            <h3 className="text-3xl font-extrabold">{yellowCount}</h3>
            <span className="text-amber-100 text-sm">คน ({yellowPct}%)</span>
          </div>
        </div>

        <div className="bg-gradient-to-br from-rose-400 to-rose-500 rounded-[20px] p-5 text-white shadow-lg shadow-rose-500/20 relative overflow-hidden group">
          <div className="absolute -right-4 -top-4 opacity-10 group-hover:scale-110 transition-transform duration-500">
            <svg className="w-24 h-24" fill="currentColor" viewBox="0 0 24 24"><path d="M19 3H5c-1.1 0-1.99.9-1.99 2L3 19c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-1 11h-4v4h-4v-4H6v-4h4V6h4v4h4v4z"/></svg>
          </div>
          <p className="text-rose-50 font-medium text-sm mb-2 relative z-10">ส่งพบแพทย์</p>
          <div className="flex items-baseline gap-1 relative z-10">
            <h3 className="text-3xl font-extrabold">{redCount}</h3>
            <span className="text-rose-100 text-sm">คน ({redPct}%)</span>
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Pie Chart */}
        <div className="bg-white rounded-[24px] p-6 shadow-sm border border-gray-100">
          <h2 className="text-lg font-bold text-gray-800 mb-6 flex items-center gap-2">
            <svg className="w-5 h-5 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z" /></svg>
            สัดส่วนระดับความรุนแรง
          </h2>
          <div className="h-[280px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={90}
                  paddingAngle={5}
                  dataKey="value"
                  stroke="none"
                  label={({ value, percent }) => `${value} (${(percent * 100).toFixed(0)}%)`}
                  labelLine={true}
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <RechartsTooltip content={<CustomTooltip />} />
                <Legend 
                  verticalAlign="bottom" 
                  height={36}
                  iconType="circle"
                  formatter={(value) => <span className="text-gray-700 font-medium">{value}</span>}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Area/Bar Chart */}
        <div className="bg-white rounded-[24px] p-6 shadow-sm border border-gray-100 lg:col-span-2">
          <h2 className="text-lg font-bold text-gray-800 mb-6 flex items-center gap-2">
            <svg className="w-5 h-5 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" /></svg>
            แนวโน้มการคัดกรอง (14 วันล่าสุด)
          </h2>
          <div className="h-[280px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={dailyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorGreen" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorYellow" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#f59e0b" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorRed" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#f43f5e" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="dateShort" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} />
                <RechartsTooltip content={<CustomTooltip />} />
                <Area type="monotone" dataKey="พบแพทย์" stackId="1" stroke="#f43f5e" fill="url(#colorRed)" strokeWidth={2} />
                <Area type="monotone" dataKey="เฝ้าระวัง" stackId="1" stroke="#f59e0b" fill="url(#colorYellow)" strokeWidth={2} />
                <Area type="monotone" dataKey="ปกติ" stackId="1" stroke="#10b981" fill="url(#colorGreen)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Symptoms Bar Chart */}
        <div className="bg-white rounded-[24px] p-6 shadow-sm border border-gray-100">
          <h2 className="text-lg font-bold text-gray-800 mb-6 flex items-center gap-2">
            <svg className="w-5 h-5 text-fuchsia-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>
            10 อันดับอาการที่พบมากที่สุด
          </h2>
          <div className="h-[420px] w-full">
            {topSymptoms.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={topSymptoms} layout="vertical" margin={{ top: 0, right: 30, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorFuchsia" x1="0" y1="0" x2="1" y2="0">
                      <stop offset="0%" stopColor="#d946ef" stopOpacity={0.8}/>
                      <stop offset="100%" stopColor="#c026d3" stopOpacity={1}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#f1f5f9" />
                  <XAxis type="number" hide />
                  <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{fill: '#475569', fontSize: 13, fontWeight: 600}} width={280} />
                  <RechartsTooltip cursor={{fill: '#f8fafc'}} content={<CustomTooltip />} />
                  <Bar dataKey="count" name="จำนวน (คน)" fill="url(#colorFuchsia)" radius={[0, 8, 8, 0]} barSize={20}>
                    <LabelList dataKey="count" position="right" fill="#64748b" fontSize={13} fontWeight={600} formatter={(value: any) => `${value} คน`} />
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-gray-400">
                <svg className="w-12 h-12 mb-3 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" /></svg>
                <p className="text-sm font-medium">ไม่พบข้อมูลอาการในช่วงเวลานี้</p>
              </div>
            )}
          </div>
        </div>

        {/* Insight Card */}
        <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-[24px] p-8 shadow-sm text-white flex flex-col justify-center relative overflow-hidden group">
          <div className="absolute -right-10 -bottom-10 opacity-20 group-hover:scale-110 transition-transform duration-700">
            <svg className="w-64 h-64" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/></svg>
          </div>
          <h2 className="text-2xl font-bold mb-4 relative z-10">การวิเคราะห์ข้อมูล</h2>
          <p className="text-indigo-100 mb-6 relative z-10 text-lg leading-relaxed">
            จากผู้เข้ารับการคัดกรองทั้งหมด <span className="font-extrabold text-white">{total}</span> คน มีผู้ที่มีระดับปกติ <span className="font-extrabold text-white">{greenPct}%</span> 
            ในขณะที่มีผู้ที่ต้องส่งพบแพทย์จำนวน <span className="font-extrabold text-white">{redCount}</span> คน
          </p>
          {topSymptoms.length > 0 && (
             <div className="bg-white/20 backdrop-blur-md rounded-xl p-4 border border-white/20 relative z-10">
               <p className="text-sm font-medium text-indigo-50 mb-1">อาการที่ต้องเฝ้าระวังสูงสุด ณ ขณะนี้:</p>
               <h3 className="text-xl font-bold text-white flex items-center gap-2">
                 <svg className="w-6 h-6 text-yellow-300" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                 {topSymptoms[0]?.name} ({topSymptoms[0]?.count} คน)
               </h3>
             </div>
          )}
        </div>
      </div>

      {/* Score Distribution Chart */}
      <div className="bg-white rounded-[24px] overflow-hidden shadow-sm border border-gray-100 flex flex-col p-6 mt-6">
        <h2 className="text-lg font-bold text-gray-800 mb-6 flex items-center gap-2">
          <svg className="w-5 h-5 text-teal-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 8v8m-4-5v5m-4-2v2m-2 4h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
          การกระจายของคะแนนการประเมินสุขภาพ
        </h2>
        <div className="h-[300px] w-full">
          {scoreDistribution.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={scoreDistribution} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                <defs>
                  <linearGradient id="colorTeal" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#14b8a6" stopOpacity={1}/>
                    <stop offset="100%" stopColor="#0d9488" stopOpacity={0.8}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="score" axisLine={false} tickLine={false} tick={{fill: '#475569', fontSize: 13, fontWeight: 500}} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#475569', fontSize: 13}} />
                <RechartsTooltip cursor={{fill: '#f8fafc'}} content={<CustomTooltip />} />
                <Bar dataKey="count" name="จำนวน (คน)" fill="url(#colorTeal)" radius={[8, 8, 0, 0]} barSize={40}>
                  <LabelList dataKey="count" position="top" fill="#64748b" fontSize={13} fontWeight={600} formatter={(value: any) => `${value} คน`} />
                  {
                    scoreDistribution.map((entry, index) => {
                      const scoreNum = parseInt(entry.score);
                      let fillUrl = "url(#colorTeal)";
                      if (scoreNum >= 3) fillUrl = "#f43f5e"; // red for high score
                      else if (scoreNum >= 1) fillUrl = "#f59e0b"; // yellow for medium
                      else fillUrl = "#10b981"; // green for zero
                      return <Cell key={`cell-${index}`} fill={fillUrl} />;
                    })
                  }
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-gray-400">
              <svg className="w-12 h-12 mb-3 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" /></svg>
              <p className="text-sm font-medium">ไม่พบข้อมูลคะแนน</p>
            </div>
          )}
        </div>
      </div>

      {/* Area Analysis Chart */}
      <div className="bg-white rounded-[24px] overflow-hidden shadow-sm border border-gray-100 flex flex-col p-6 mt-6">
        <h2 className="text-lg font-bold text-gray-800 mb-6 flex items-center gap-2">
          <svg className="w-5 h-5 text-orange-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" /></svg>
          การวิเคราะห์พื้นที่ (จำนวนผู้ป่วยแยกตามตำบล)
        </h2>
        <div className="h-[400px] w-full">
          {areaData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={areaData} layout="vertical" margin={{ top: 0, right: 30, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#f1f5f9" />
                <XAxis type="number" tickLine={false} axisLine={false} tick={{fill: '#64748b', fontSize: 12}} />
                <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{fill: '#475569', fontSize: 13, fontWeight: 500}} width={120} />
                <RechartsTooltip cursor={{fill: '#f8fafc'}} content={<CustomTooltip />} />
                <Legend 
                  verticalAlign="top" 
                  height={36}
                  iconType="circle"
                  formatter={(value) => <span className="text-gray-700 font-medium">{value}</span>}
                />
                <Bar dataKey="ปกติ" stackId="a" fill="#10b981" barSize={24} />
                <Bar dataKey="เฝ้าระวัง" stackId="a" fill="#f59e0b" />
                <Bar dataKey="พบแพทย์" stackId="a" fill="#f43f5e" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-gray-400">
              <svg className="w-12 h-12 mb-3 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 10h18M3 14h18m-9-4v8m-7 0h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
              <p className="text-sm font-medium">ไม่พบข้อมูลพื้นที่</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
