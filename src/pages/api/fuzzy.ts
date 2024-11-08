// api/fuzzy.ts
import { NextApiRequest, NextApiResponse } from 'next';
import { fuzzyDecision } from '../../utils/fuzzyLogic';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    try {
      const { age, blood_pressure, cholesterol, bmi, smoking_history } = req.body;
      
      // Validate the input
      if (!age || !blood_pressure || !cholesterol || !bmi || !smoking_history) {
        return res.status(400).json({ error: 'Semua data harus diisi!' });
      }

      const riskValue = fuzzyDecision(
        parseFloat(age),
        parseFloat(blood_pressure),
        parseFloat(cholesterol),
        parseFloat(bmi),
        parseFloat(smoking_history)
      );

      let riskLevel = 'Rendah';
      if (riskValue >= 70) {
        riskLevel = 'Tinggi';
      } else if (riskValue >= 50) {
        riskLevel = 'Sedang';
      }

      // Return the result as response
      res.status(200).json({ riskValue, riskLevel });
      
    } catch (error) {
      console.error('Error in API handler:', error);
      res.status(500).json({ error: 'Terjadi kesalahan dalam proses perhitungan' });
    }
  } else {
    res.status(405).json({ error: 'Metode tidak diizinkan' });
  }
}
