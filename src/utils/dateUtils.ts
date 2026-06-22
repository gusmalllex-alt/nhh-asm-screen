/**
 * แปลงวันที่เป็นรูปแบบ วัน/เดือน/ปี พ.ศ.
 * @param dateStr - วันที่ในรูปแบบ YYYY-MM-DD (ค.ศ.)
 * @returns วันที่ในรูปแบบ DD/MM/YYYY+543
 */
export function formatThaiDate(dateStr: string): string {
  if (!dateStr) return '';
  const parts = dateStr.split('-');
  if (parts.length !== 3) return dateStr;

  const year = parseInt(parts[0], 10) + 543; // แปลงเป็น พ.ศ.
  const month = parts[1];
  const day = parts[2];

  return `${day}/${month}/${year}`;
}

/**
 * แปลงวันที่เป็นรูปแบบ วัน เดือน(ไทย) ปี พ.ศ.
 * @param dateStr - วันที่ในรูปแบบ YYYY-MM-DD (ค.ศ.)
 * @returns วันที่ในรูปแบบไทยเต็ม เช่น 22 มิ.ย. 2569
 */
export function formatThaiDateLong(dateStr: string): string {
  if (!dateStr) return '';
  const parts = dateStr.split('-');
  if (parts.length !== 3) return dateStr;

  const thaiMonths = [
    'ม.ค.',
    'ก.พ.',
    'มี.ค.',
    'เม.ย.',
    'พ.ค.',
    'มิ.ย.',
    'ก.ค.',
    'ส.ค.',
    'ก.ย.',
    'ต.ค.',
    'พ.ย.',
    'ธ.ค.',
  ];

  const year = parseInt(parts[0], 10) + 543;
  const monthIndex = parseInt(parts[1], 10) - 1;
  const day = parseInt(parts[2], 10);

  return `${day} ${thaiMonths[monthIndex]} ${year}`;
}
