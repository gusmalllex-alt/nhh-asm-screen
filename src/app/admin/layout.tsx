'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import Image from 'next/image';
import logoImg from '../../../logo.png';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isChecking, setIsChecking] = useState(true);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    // Check session storage for login state
    const auth = sessionStorage.getItem('nhh_admin_auth');
    if (auth === 'true') {
      setIsAuthenticated(true);
    }
    setIsChecking(false);
  }, []);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (username === 'admin' && password === '1234') {
      sessionStorage.setItem('nhh_admin_auth', 'true');
      setIsAuthenticated(true);
      setError('');
    } else {
      setError('ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง');
    }
  };

  const handleLogout = () => {
    sessionStorage.removeItem('nhh_admin_auth');
    setIsAuthenticated(false);
    router.push('/admin');
  };

  if (isChecking) {
    return <div className="min-h-screen flex items-center justify-center bg-gray-50"><div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div></div>;
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-900 via-indigo-900 to-slate-900 p-4 relative overflow-hidden">
        {/* Animated Background Elements */}
        <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
        <div className="absolute top-[-10%] right-[-10%] w-96 h-96 bg-cyan-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
        <div className="absolute bottom-[-20%] left-[20%] w-96 h-96 bg-indigo-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000"></div>

        <div className="relative w-full max-w-md">
          <div className="bg-white/10 backdrop-blur-2xl border border-white/20 p-8 sm:p-10 rounded-[32px] shadow-2xl">
            <div className="text-center mb-10">
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-tr from-blue-500 to-cyan-400 mb-6 shadow-lg shadow-blue-500/30">
                <svg className="w-10 h-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <h1 className="text-2xl font-bold text-white tracking-tight">
                SOS score 3สี<br />
                โรงพยาบาลหนองหาน
              </h1>
            </div>
            
            <form onSubmit={handleLogin} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-blue-200 mb-2">ชื่อผู้ใช้ (Username)</label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full px-5 py-4 bg-white/5 border border-white/10 rounded-2xl text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:bg-white/10 transition-all"
                  placeholder="admin"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-blue-200 mb-2">รหัสผ่าน (Password)</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-5 py-4 bg-white/5 border border-white/10 rounded-2xl text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:bg-white/10 transition-all"
                  placeholder="••••"
                  required
                />
              </div>
              
              {error && (
                <div className="p-4 bg-red-500/20 border border-red-500/50 rounded-xl">
                  <p className="text-red-200 text-sm font-medium text-center">{error}</p>
                </div>
              )}
              
              <button type="submit" className="w-full py-4 bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-400 hover:to-cyan-400 text-white rounded-2xl font-bold text-lg shadow-lg shadow-blue-500/25 transition-all transform hover:-translate-y-1">
                เข้าสู่ระบบ
              </button>
            </form>
            
            <div className="mt-8 text-center">
              <Link href="/" className="text-sm text-blue-200/60 hover:text-white transition-colors">
                &larr; กลับไปหน้าประเมินคัดกรอง
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const navItems = [
    { name: 'แดชบอร์ด', path: '/admin', icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6' },
    { name: 'ข้อมูลทั้งหมด', path: '/admin/data', icon: 'M4 6h16M4 10h16M4 14h16M4 18h16' },
  ];

  return (
    <div className="min-h-[100dvh] bg-slate-50 flex flex-col md:flex-row font-sans selection:bg-blue-100 selection:text-blue-900">
      {/* Sidebar for Desktop / Topbar for Mobile */}
      <aside className="w-full md:w-72 bg-white shadow-xl shadow-blue-900/5 z-10 flex-shrink-0 flex flex-col">
        <div className="p-8 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br flex items-center justify-center">
              <Image src={logoImg} alt="Logo" width={40} height={40} className="drop-shadow-md rounded-full bg-white p-0.5" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-800 tracking-tight">SOS score 3สี</h2>
              <p className="text-[11px] font-medium text-gray-400 uppercase tracking-wider">โรงพยาบาลหนองหาน</p>
            </div>
          </div>
        </div>
        
        <nav className="p-4 space-y-2 flex md:flex-col overflow-x-auto flex-1">
          {navItems.map((item) => {
            const isActive = pathname === item.path;
            return (
              <Link
                key={item.path}
                href={item.path}
                className={`flex items-center gap-4 px-5 py-3.5 rounded-2xl whitespace-nowrap transition-all duration-200 ${
                  isActive 
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20 font-medium' 
                    : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900 font-medium'
                }`}
              >
                <svg className="w-5 h-5 opacity-90" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={isActive ? 2.5 : 2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d={item.icon} />
                </svg>
                {item.name}
              </Link>
            );
          })}
          
          <div className="md:mt-auto pt-4 md:border-t border-gray-100 hidden md:block"></div>
          
          <button
            onClick={handleLogout}
            className="flex items-center gap-4 px-5 py-3.5 rounded-2xl text-red-500 hover:bg-red-50 hover:text-red-600 transition-all font-medium w-full text-left"
          >
            <svg className="w-5 h-5 opacity-90" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            ออกจากระบบ
          </button>
        </nav>
      </aside>

      {/* Main Content - Full Width */}
      <main className="flex-1 p-4 sm:p-8 md:p-10 overflow-y-auto w-full flex flex-col bg-slate-50/50">
        <div className="w-full flex-grow max-w-7xl mx-auto">
          {children}
        </div>
        <footer className="w-full pt-10 pb-6 mt-auto relative z-10 max-w-7xl mx-auto">
          <div className="flex justify-center px-4">
            <div className="flex items-center gap-2 sm:gap-3 bg-white/60 backdrop-blur-md border border-gray-200/50 rounded-full py-1.5 pr-4 pl-1.5 shadow-sm hover:shadow-md transition-shadow">
              <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center text-white shrink-0 shadow-sm">
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" /></svg>
              </div>
              <div className="text-[10px] sm:text-[11px] font-medium text-slate-600 truncate tracking-wide">
                พัฒนาโดย <span className="text-emerald-600 font-bold">นายศุภชัย สุนารักษ์</span> <span className="hidden sm:inline text-slate-300">·</span><span className="sm:hidden"> </span>นักวิชาการสถิติ <span className="hidden sm:inline text-slate-300">·</span><span className="sm:hidden"> </span>กลุ่มงานสุขภาพดิจิทัล
              </div>
            </div>
          </div>
        </footer>
      </main>
    </div>
  );
}
