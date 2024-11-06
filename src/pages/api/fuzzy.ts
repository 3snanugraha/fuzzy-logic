import { NextApiRequest, NextApiResponse } from 'next';
import path from 'path';
import fs from 'fs';
import { fuzzyDecision } from '../../utils/fuzzyLogic';
import { readExcelFile } from '../../utils/readExcel';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    console.log('Reading Excel file...');
    
    // Correct path resolution using path.join for compatibility
    const filePath = path.join(process.cwd(), 'public', 'data', 'data-pasien.xlsx');
    
    // Log file path for debugging purposes
    console.log('File path:', filePath);
    
    // Check if the file exists
    if (!fs.existsSync(filePath)) {
      console.error('Excel file not found at the specified path:', filePath);
      return res.status(404).json({ error: 'Excel file not found' });
    }

    // Reading the Excel file
    console.log('Attempting to read Excel file...');
    const patientData = await readExcelFile(filePath);

    // Log the data to verify it was read correctly
    console.log('Excel Data:', patientData);

    if (!patientData || patientData.length === 0) {
      console.error('No data found in the Excel file.');
      return res.status(400).json({ error: 'No valid data in Excel file.' });
    }

    // Process patient data with fuzzy logic
    const results = patientData.map((patient, index) => {
      const { usia, tekananDarah, kolesterol, bmi, merokok } = patient as { usia: string; tekananDarah: string; kolesterol: string; bmi: string; merokok: string };
      const result = fuzzyDecision(
        parseFloat(usia), 
        tekananDarah, 
        parseFloat(kolesterol), 
        parseFloat(bmi), 
        parseInt(merokok)
      );
      return { id: index, usia, tekananDarah, kolesterol, bmi, merokok, risiko: result };
    });
    console.log('Results:', results);

    // Sending the results back as JSON response
    res.status(200).json({ data: results });
  } catch (error) {
    console.error('Error in API handler:', error);
    res.status(500).json({ error: 'Terjadi kesalahan dalam memproses file Excel.' });
  }
}
