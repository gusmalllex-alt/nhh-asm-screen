export interface ScreeningItem {
  id: string;
  label: string;
  group: 'green' | 'yellow' | 'red';
  groupLabel: string;
}

export const screeningItems: ScreeningItem[] = [
  // กลุ่มเขียว — มีลักษณะติดเชื้อ
  {
    id: 'g_fever_hot',
    label: 'ไข้ / ตัวร้อน',
    group: 'green',
    groupLabel: 'มีลักษณะติดเชื้อ',
  },
  {
    id: 'g_cough',
    label: 'ไอ',
    group: 'green',
    groupLabel: 'มีลักษณะติดเชื้อ',
  },
  {
    id: 'g_gi_symptom',
    label: 'ปวดท้อง / อาเจียน / ท้องเสีย / ปวดบวมผิวหนัง / ปัสสาวะแสบขัด',
    group: 'green',
    groupLabel: 'มีลักษณะติดเชื้อ',
  },
  // กลุ่มเหลือง — อาการรุนแรงปานกลาง
  {
    id: 'y_chill',
    label: 'หนาวสั่น',
    group: 'yellow',
    groupLabel: 'อาการรุนแรงปานกลาง',
  },
  {
    id: 'y_fatigue',
    label: 'อ่อนเพลียมาก',
    group: 'yellow',
    groupLabel: 'อาการรุนแรงปานกลาง',
  },
  {
    id: 'y_cannot_eat',
    label: 'กินไม่ได้',
    group: 'yellow',
    groupLabel: 'อาการรุนแรงปานกลาง',
  },
  {
    id: 'y_chronic',
    label: 'มีโรคประจำตัว เช่น เบาหวาน / ความดัน / โรคไต',
    group: 'yellow',
    groupLabel: 'อาการรุนแรงปานกลาง',
  },
  {
    id: 'y_age60',
    label: 'อายุ > 60 ปี',
    group: 'yellow',
    groupLabel: 'อาการรุนแรงปานกลาง',
  },
  // กลุ่มแดง — อาการรุนแรงมาก
  {
    id: 'r_dyspnea',
    label: 'หอบเหนื่อย / หายใจลำบาก',
    group: 'red',
    groupLabel: 'อาการรุนแรงมาก',
  },
  {
    id: 'r_altered',
    label: 'ซึม / ไม่รู้สึกตัว / หมดสติ / เพ้อ',
    group: 'red',
    groupLabel: 'อาการรุนแรงมาก',
  },
  {
    id: 'r_low_bp',
    label: 'ความดันโลหิตต่ำ < 90',
    group: 'red',
    groupLabel: 'อาการรุนแรงมาก',
  },
];

export interface ScreeningResult {
  id: string;
  firstName: string;
  lastName: string;
  assessDate: string;
  selectedItems: string[];
  score: number;
  level: 'green' | 'yellow' | 'red';
  levelLabel: string;
  recommendation: string;
  createdAt: string;
  syncStatus?: 'synced' | 'failed' | 'pending';
}

export function calculateScreening(selectedIds: string[]): {
  score: number;
  level: 'green' | 'yellow' | 'red';
  levelLabel: string;
  recommendation: string;
} {
  const score = selectedIds.length;

  if (score >= 4) {
    return {
      score,
      level: 'red',
      levelLabel: 'อาการรุนแรง — ส่งพบแพทย์',
      recommendation:
        'ควรนำส่งโรงพยาบาลหรือสถานพยาบาลใกล้บ้านทันที เพื่อพบแพทย์โดยเร็ว อาจมีภาวะฉุกเฉินที่ต้องรักษาอย่างเร่งด่วน',
    };
  }

  if (score >= 2) {
    return {
      score,
      level: 'yellow',
      levelLabel: 'เฝ้าระวัง — ติดตามอาการ',
      recommendation:
        'ควรติดตามอาการอย่างใกล้ชิด แนะนำพบแพทย์ภายใน 24 ชั่วโมง หากอาการแย่ลงให้นำส่งโรงพยาบาลทันที พักผ่อนให้เพียงพอ ดื่มน้ำมากๆ',
    };
  }

  return {
    score,
    level: 'green',
    levelLabel: 'ปกติ — ดูแลตัวเองที่บ้าน',
    recommendation:
      'สามารถดูแลตัวเองที่บ้านได้ พักผ่อนให้เพียงพอ ดื่มน้ำสะอาดมากๆ รับประทานยาตามอาการ หากอาการไม่ดีขึ้นภายใน 2 วัน ให้มาพบแพทย์',
  };
}

const STORAGE_KEY = 'nhh_asm_screening_history';

export function saveScreeningResult(result: ScreeningResult): void {
  if (typeof window === 'undefined') return;
  const existing = getScreeningHistory();
  existing.unshift(result);
  // เก็บไว้สูงสุด 100 รายการ
  const trimmed = existing.slice(0, 100);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(trimmed));
}

export function getScreeningHistory(): ScreeningResult[] {
  if (typeof window === 'undefined') return [];
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

export function deleteScreeningResult(id: string): void {
  if (typeof window === 'undefined') return;
  const existing = getScreeningHistory();
  const filtered = existing.filter((r) => r.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
}

export function clearAllHistory(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(STORAGE_KEY);
}

export function updateSyncStatus(id: string, status: 'synced' | 'failed' | 'pending'): void {
  if (typeof window === 'undefined') return;
  const existing = getScreeningHistory();
  const index = existing.findIndex((r) => r.id === id);
  if (index !== -1) {
    existing[index].syncStatus = status;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(existing));
  }
}
