// Umur: 45 (dalam tahun)
// Tekanan Darah: 130 (dalam mmHg)
// Kolesterol: 220 (dalam mg/dL)
// BMI: 27 (angka)
// Riwayat Merokok: 8 (jumlah tahun merokok)

interface FuzzyResult {
  low?: number;
  medium?: number;
  high?: number;
}

interface FuzzyRule {
  value: 'low' | 'medium' | 'high';
  degree: number;
}

function fuzzyMembership(value: number, low: number, medium: number, high: number): FuzzyResult {
  const result: FuzzyResult = {};

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

function categorizeUmur(usia: number): FuzzyResult {
  // Age ranges: 20-30-42 (low), 30-42-50 (medium), 42-50-60 (high)
  return fuzzyMembership(usia, 30, 42, 50);
}

function categorizeTekananDarah(tekananDarah: string): FuzzyResult {
  const [systolic] = tekananDarah.split('/').map(Number);
  // Blood pressure ranges:
  // Low: 70/40-90/60-100/70
  // Medium: 90/60-100/70-120/80
  // High: 100/70-120/80-140/90
  return fuzzyMembership(systolic, 90, 120, 140);
}

function categorizeKolesterol(kolesterol: number): FuzzyResult {
  // Cholesterol ranges:
  // Low: 100-200-240 mg/dL
  // Medium: 200-240-245 mg/dL
  // High: 240-245-250 mg/dL
  return fuzzyMembership(kolesterol, 200, 240, 245);
}

function categorizeBMI(bmi: number): FuzzyResult {
  // BMI ranges:
  // Low: 0-18.5-24.9
  // Medium: 18.5-24.9-30
  // High: 24.9-30-40
  return fuzzyMembership(bmi, 18.5, 24.9, 30);
}

function categorizeMerokok(merokok: number): FuzzyResult {
  // Smoking ranges:
  // Low: 0-5-10
  // Medium: 5-10-20
  // High: 10-20-40
  if (merokok <= 5) return { low: 1 };
  if (merokok <= 10) return { low: (10 - merokok) / 5, medium: (merokok - 5) / 5 };
  if (merokok <= 20) return { medium: (20 - merokok) / 10, high: (merokok - 10) / 10 };
  return { high: 1 };
}

function fuzzyRules(input1: FuzzyResult, input2: FuzzyResult, input3: FuzzyResult, input4: FuzzyResult, input5: FuzzyResult): FuzzyRule[] {
  const rules: FuzzyRule[] = [];
  
  // Calculate membership degrees for each rule
  const lowRiskDegree = Math.min(
    input1.low || 0,
    input2.low || 0,
    input3.low || 0,
    input4.low || 0,
    input5.low || 0
  );

  const mediumRiskDegree = Math.max(
    Math.min(input1.medium || 0, input2.medium || 0),
    Math.min(input2.medium || 0, input3.medium || 0),
    Math.min(input3.medium || 0, input4.medium || 0),
    Math.min(input4.medium || 0, input5.medium || 0)
  );

  const highRiskDegree = Math.max(
    Math.min(input1.high || 0, input2.high || 0),
    Math.min(input2.high || 0, input3.high || 0),
    Math.min(input3.high || 0, input4.high || 0),
    Math.min(input1.high || 0, input5.high || 0)
  );

  // Only add rules with non-zero degrees
  if (lowRiskDegree > 0) {
    rules.push({ value: 'low', degree: lowRiskDegree });
  }
  if (mediumRiskDegree > 0) {
    rules.push({ value: 'medium', degree: mediumRiskDegree });
  }
  if (highRiskDegree > 0) {
    rules.push({ value: 'high', degree: highRiskDegree });
  }

  // If no rules fired, return default medium risk
  if (rules.length === 0) {
    rules.push({ value: 'medium', degree: 1 });
  }

  return rules;
}

function defuzzification(rules: FuzzyRule[]): number {
  let numerator = 0;
  let denominator = 0;

  rules.forEach((rule) => {
    const crispValue = rule.value === 'low' ? 20 : 
                      rule.value === 'medium' ? 50 : 70;
    
    numerator += rule.degree * crispValue;
    denominator += rule.degree;
  });

  // Prevent division by zero and ensure valid output
  if (denominator === 0) {
    return 50;
  }

  const result = numerator / denominator;
  
  // Ensure result is within valid range
  return Math.max(0, Math.min(100, result));
}
export function fuzzyDecision(usia: number, tekananDarah: string, kolesterol: number, bmi: number, merokok: number): number {
  const fuzzyUmur = categorizeUmur(usia);
  const fuzzyTekananDarah = categorizeTekananDarah(tekananDarah);
  const fuzzyKolesterol = categorizeKolesterol(kolesterol);
  const fuzzyBMI = categorizeBMI(bmi);
  const fuzzyMerokok = categorizeMerokok(merokok);

  const rules = fuzzyRules(fuzzyUmur, fuzzyTekananDarah, fuzzyKolesterol, fuzzyBMI, fuzzyMerokok);
  return defuzzification(rules);
}