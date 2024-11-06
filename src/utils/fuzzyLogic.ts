// utils/fuzzyLogic.ts

interface FuzzyResult {
  low?: number;
  medium?: number;
  high?: number;
}

interface FuzzyRule {
  value: 'low' | 'medium' | 'high';
  degree: number;
}

// Fungsi untuk menghitung keanggotaan fuzzy
function fuzzyMembership(value: number, low: number, medium: number, high: number): FuzzyResult {
  let result: FuzzyResult = {};

  if (value <= low) result.low = 1;
  else if (value <= medium) result.low = (medium - value) / (medium - low);
  else result.low = 0;

  if (value <= low || value >= high) result.medium = 0;
  else if (value > low && value <= medium) result.medium = (value - low) / (medium - low);
  else if (value > medium && value < high) result.medium = (high - value) / (high - medium);
  else result.medium = 1;

  if (value >= high) result.high = 1;
  else if (value >= medium) result.high = (value - medium) / (high - medium);
  else result.high = 0;

  return result;
}

// Fungsi untuk mengategorikan variabel input sesuai dengan rentang yang ditentukan
function categorizeUmur(usia: number): FuzzyResult {
  // Misalnya, kategori umur: 20-30 Rendah, 30-50 Sedang, >50 Tinggi
  return fuzzyMembership(usia, 20, 35, 50);
}

function categorizeTekananDarah(tekananDarah: string): FuzzyResult {
  // Misalnya, tekanan darah: Rendah = <90, Sedang = 90-120, Tinggi = >120
  const [systolic, diastolic] = tekananDarah.split('/').map(Number);
  return fuzzyMembership(systolic, 90, 120, 140); // Berdasarkan tekanan sistolik
}

function categorizeKolesterol(kolesterol: number): FuzzyResult {
  // Kolesterol: Rendah <200, Sedang = 200-240, Tinggi >240
  return fuzzyMembership(kolesterol, 200, 220, 240);
}

function categorizeBMI(bmi: number): FuzzyResult {
  // BMI: Rendah <18.5, Normal = 18.5-24.9, Tinggi >24.9
  return fuzzyMembership(bmi, 18.5, 22, 24.9);
}

function categorizeMerokok(merokok: number): FuzzyResult {
  // Merokok: 0 = tidak merokok, 1-10 = rendah, 10-20 = sedang, >20 = tinggi
  if (merokok === 0) return { low: 1 };
  if (merokok <= 10) return { low: 1, medium: 0.5 }; // Kategori rendah
  if (merokok <= 20) return { medium: 1 };
  return { high: 1 }; // Kategori tinggi
}

// Aturan fuzzy untuk menghitung risiko
function fuzzyRules(input1: FuzzyResult, input2: FuzzyResult, input3: FuzzyResult, input4: FuzzyResult, input5: FuzzyResult): FuzzyRule[] {
  const rules: FuzzyRule[] = [];

  // Kombinasikan input dan terapkan aturan fuzzy
  const rule1 = Math.min(input1.low || 0, input2.low || 0, input3.low || 0, input4.low || 0, input5.low || 0);
  const rule2 = Math.min(input1.medium || 0, input2.medium || 0, input3.medium || 0, input4.medium || 0, input5.medium || 0);
  const rule3 = Math.min(input1.high || 0, input2.high || 0, input3.high || 0, input4.high || 0, input5.high || 0);

  rules.push({ value: 'low', degree: rule1 });
  rules.push({ value: 'medium', degree: rule2 });
  rules.push({ value: 'high', degree: rule3 });

  return rules;
}

// Defuzzifikasi menggunakan rata-rata tertimbang
function defuzzification(rules: FuzzyRule[]): number {
  let numerator: number = 0;
  let denominator: number = 0;

  rules.forEach((rule: FuzzyRule) => {
    let crispValue: number;
    if (rule.value === 'low') crispValue = 30;  // Rendah
    else if (rule.value === 'medium') crispValue = 60;  // Sedang
    else crispValue = 90;  // Tinggi

    numerator += rule.degree * crispValue;
    denominator += rule.degree;
  });

  return denominator === 0 ? 0 : numerator / denominator;
}

// Fungsi utama untuk menghitung keputusan fuzzy
export function fuzzyDecision(usia: number, tekananDarah: string, kolesterol: number, bmi: number, merokok: number): number {
  // Menghitung keanggotaan untuk setiap parameter
  const fuzzyUmur = categorizeUmur(usia);
  const fuzzyTekananDarah = categorizeTekananDarah(tekananDarah);
  const fuzzyKolesterol = categorizeKolesterol(kolesterol);
  const fuzzyBMI = categorizeBMI(bmi);
  const fuzzyMerokok = categorizeMerokok(merokok);

  // Menerapkan aturan fuzzy dan menghitung hasil defuzzifikasi
  const rules = fuzzyRules(fuzzyUmur, fuzzyTekananDarah, fuzzyKolesterol, fuzzyBMI, fuzzyMerokok);
  return defuzzification(rules);
}
