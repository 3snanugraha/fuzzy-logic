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
  else if (value <= medium) result.medium = (value - low) / (medium - low);
  else if (value < high) result.medium = (high - value) / (high - medium);
  else result.medium = 1;

  if (value >= high) result.high = 1;
  else if (value > medium) result.high = (value - medium) / (high - medium);
  else result.high = 0;

  return result;
}

function categorizeUmur(usia: number): FuzzyResult {
  return fuzzyMembership(usia, 30, 42, 50);
}

function categorizeTekananDarah(tekananDarah: number): FuzzyResult {
  return fuzzyMembership(tekananDarah, 90, 120, 140);
}

function categorizeKolesterol(kolesterol: number): FuzzyResult {
  return fuzzyMembership(kolesterol, 200, 240, 245);
}

function categorizeBMI(bmi: number): FuzzyResult {
  return fuzzyMembership(bmi, 18.5, 24.9, 30);
}

function categorizeMerokok(merokok: number): FuzzyResult {
  if (merokok <= 5) return { low: 1 };
  if (merokok <= 10) return { low: (10 - merokok) / 5, medium: (merokok - 5) / 5 };
  if (merokok <= 20) return { medium: (20 - merokok) / 10, high: (merokok - 10) / 10 };
  return { high: 1 };
}

function fuzzyRules(input1: FuzzyResult, input2: FuzzyResult, input3: FuzzyResult, input4: FuzzyResult, input5: FuzzyResult): FuzzyRule[] {
  const rules: FuzzyRule[] = [];

  const lowRiskDegree = Math.min(
    input1.low || 0,
    input2.low || 0,
    input3.low || 0,
    input4.low || 0,
    input5.low || 0
  );

  const mediumRiskDegree = Math.max(
    Math.min(input1.medium || 0, input2.medium || 0, input3.medium || 0, input4.medium || 0, input5.medium || 0),
    Math.min(input1.low || 0, input2.medium || 0, input3.medium || 0, input4.medium || 0, input5.low || 0),
    Math.min(input1.medium || 0, input2.low || 0, input3.medium || 0, input4.medium || 0, input5.medium || 0)
  );

  const highRiskDegree = Math.max(
    Math.min(input1.high || 0, input2.high || 0, input3.high || 0, input4.high || 0, input5.high || 0),
    Math.min(input1.medium || 0, input2.high || 0, input3.high || 0, input4.high || 0, input5.medium || 0)
  );

  if (lowRiskDegree > 0) {
    rules.push({ value: 'low', degree: lowRiskDegree });
  }
  if (mediumRiskDegree > 0) {
    rules.push({ value: 'medium', degree: mediumRiskDegree });
  }
  if (highRiskDegree > 0) {
    rules.push({ value: 'high', degree: highRiskDegree });
  }

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
                       rule.value === 'medium' ? 50 : 
                       70;
    
    numerator += rule.degree * crispValue;
    denominator += rule.degree;
  });

  return denominator === 0 ? 50 : Math.max(0, Math.min(100, numerator / denominator));
}

export function fuzzyDecision(
  umur: number,
  tekananDarah: number,
  kolesterol: number,
  bmi: number,
  riwayatMerokok: number
): number {
  const fuzzyUmur = categorizeUmur(umur);
  const fuzzyTekananDarah = categorizeTekananDarah(tekananDarah);
  const fuzzyKolesterol = categorizeKolesterol(kolesterol);
  const fuzzyBMI = categorizeBMI(bmi);
  const fuzzyMerokok = categorizeMerokok(riwayatMerokok);

  const rules = fuzzyRules(fuzzyUmur, fuzzyTekananDarah, fuzzyKolesterol, fuzzyBMI, fuzzyMerokok);
  return defuzzification(rules);
}



