import { type ScreeningResult, screeningItems } from '@/data/screeningData';

const SHEETS_URL_KEY = 'nhh_asm_google_sheet_url';

export function saveGoogleSheetUrl(url: string): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(SHEETS_URL_KEY, url.trim());
}

export function getGoogleSheetUrl(): string {
  // Hardcoded for simplicity as requested by user
  return 'https://script.google.com/macros/s/AKfycbyb3qPw4ChobrnQgoUI7lSHGGsLp872Mvq9hIDy0IOFqhyb0pHPwwL4kkigWqumuWQC/exec';
}

export async function sendToGoogleSheet(result: ScreeningResult, urlOverride?: string): Promise<boolean> {
  const url = urlOverride || getGoogleSheetUrl();
  if (!url) return false;

  try {
    // Map selected IDs to their labels for readability in the sheet
    const selectedLabels = screeningItems
      .filter((item) => result.selectedItems.includes(item.id))
      .map((item) => item.label)
      .join(', ');

    const payload = {
      id: result.id,
      firstName: result.firstName,
      lastName: result.lastName,
      assessDate: result.assessDate,
      addressNo: result.addressNo || '',
      addressMoo: result.addressMoo || '',
      subDistrict: result.subDistrict || '',
      phoneNumber: result.phoneNumber || '',
      score: result.score,
      selectedItems: selectedLabels || 'ไม่มีอาการ',
      levelLabel: result.levelLabel,
      recommendation: result.recommendation,
      createdAt: new Date(result.createdAt).toLocaleString('th-TH'),
    };

    // Google Apps Script requires text/plain to bypass CORS preflight checks cleanly
    const response = await fetch(url, {
      method: 'POST',
      mode: 'cors',
      headers: {
        'Content-Type': 'text/plain;charset=utf-8',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data && data.status === 'success';
  } catch (error) {
    console.error('Failed to sync to Google Sheet:', error);
    return false;
  }
}

export async function fetchGoogleSheetData() {
  const url = getGoogleSheetUrl();
  if (!url) return [];
  
  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error('HTTP error');
    const data = await response.json();
    return data.status === 'success' ? data.data : [];
  } catch (error) {
    console.error('Failed to fetch data:', error);
    return [];
  }
}

export async function deleteGoogleSheetData(id: string) {
  const url = getGoogleSheetUrl();
  if (!url) return false;
  
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify({ action: 'delete', id }),
    });
    const data = await response.json();
    return data.status === 'success';
  } catch (error) {
    console.error('Failed to delete data:', error);
    return false;
  }
}

export async function updateGoogleSheetData(result: ScreeningResult) {
  const url = getGoogleSheetUrl();
  if (!url) return false;
  
  try {
    const selectedLabels = screeningItems
      .filter((item) => result.selectedItems.includes(item.id))
      .map((item) => item.label)
      .join(', ');

    const payload = {
      action: 'update',
      id: result.id,
      firstName: result.firstName,
      lastName: result.lastName,
      assessDate: result.assessDate,
      addressNo: result.addressNo || '',
      addressMoo: result.addressMoo || '',
      subDistrict: result.subDistrict || '',
      phoneNumber: result.phoneNumber || '',
      score: result.score,
      selectedItems: selectedLabels || 'ไม่มีอาการ',
      levelLabel: result.levelLabel,
      recommendation: result.recommendation,
      createdAt: result.createdAt,
    };

    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify(payload),
    });
    const data = await response.json();
    return data.status === 'success';
  } catch (error) {
    console.error('Failed to update data:', error);
    return false;
  }
}
