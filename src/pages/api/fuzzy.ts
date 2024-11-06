import { NextApiRequest, NextApiResponse } from 'next';
import { fuzzyDecision } from '../../utils/fuzzyLogic';
import { readExcelFile } from '../../utils/readExcel';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { file } = req.query;

  if (!file) {
    return res.status(400).json({ error: 'File Excel diperlukan.' });
  }

  try {
    // Membaca data dari file Excel yang disertakan di query parameter
    const filePath = `./public/data/${file}`;
    const patientData = await readExcelFile(filePath);

    // Mengolah data pasien dengan inferensi fuzzy
    const results = patientData.map(patient => {
      const { usia, tekananDarah, kolesterol, bmi, merokok } = patient;

      // Memproses data dengan fuzzy logic
      const result = fuzzyDecision(usia, tekananDarah, kolesterol, bmi, merokok);
      return { usia, tekananDarah, kolesterol, bmi, merokok, risiko: result };
    });

    // Mengirimkan hasil perhitungan risiko
    res.status(200).json({ data: results });
  } catch (error) {
    res.status(500).json({ error: 'Terjadi kesalahan dalam memproses file Excel.' });
  }
}
