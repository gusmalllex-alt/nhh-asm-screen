import type { Metadata, Viewport } from 'next';
import './globals.css';
import BottomNav from '@/components/BottomNav';

export const metadata: Metadata = {
  title: 'ระบบคัดกรอง 3 สี (สำหรับ อสม.) — โรงพยาบาลหนองหาน',
  description:
    'ระบบคัดกรองอาการ 3 สี (เขียว/เหลือง/แดง) สำหรับอาสาสมัครสาธารณสุขประจำหมู่บ้าน (อสม.) โรงพยาบาลหนองหาน จังหวัดอุดรธานี',
  keywords: ['คัดกรอง', 'อสม', 'โรงพยาบาลหนองหาน', '3 สี', 'สาธารณสุข'],
  authors: [{ name: 'โรงพยาบาลหนองหาน' }],
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: '#2563eb',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="th" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
      </head>
      <body className="antialiased">
        <div className="min-h-screen flex flex-col justify-between">
          <div className="flex-grow">
            {children}
          </div>
          <footer className="w-full pt-4 pb-20 md:pb-6 mt-auto relative z-10">
            <div className="flex justify-center px-4">
              <div className="flex items-center gap-2 sm:gap-3 bg-[#0a1917] border border-white/20 rounded-full py-1 pr-3 sm:pr-4 pl-1 shadow-lg max-w-full overflow-hidden">
                <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-md bg-[#00b087] flex items-center justify-center text-white shrink-0">
                  <svg className="w-3 h-3 sm:w-3.5 sm:h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" /></svg>
                </div>
                <div className="text-[9px] sm:text-[10px] md:text-[11px] font-medium text-gray-300 truncate">
                  พัฒนาโดย <span className="text-[#00b087] font-bold">นายศุภชัย สุนารักษ์</span> <span className="hidden sm:inline">·</span><span className="sm:hidden"> </span>นักวิชาการสถิติ <span className="hidden sm:inline">·</span><span className="sm:hidden"> </span>กลุ่มงานสุขภาพดิจิทัล
                </div>
              </div>
            </div>
          </footer>
        </div>
        <BottomNav />
      </body>
    </html>
  );
}
