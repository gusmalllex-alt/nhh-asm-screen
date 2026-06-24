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
          <div className="flex-grow pb-20 md:pb-6">
            {children}
          </div>
        </div>
        <BottomNav />
      </body>
    </html>
  );
}
