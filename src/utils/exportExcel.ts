import * as XLSX from 'xlsx';

// Define an interface for the data items being exported
interface ExportDataItem {
  ID: number;
  Usia: number;
  'Tekanan Darah': number;
  Kolesterol: number;
  BMI: number;
  Merokok: number;
  'Nilai Risiko': number;
  'Keterangan Risiko': string;
}

export const exportToExcel = async (data: ExportDataItem[], filename: string): Promise<void> => {
  'use client';
  
  try {
    // Create a new workbook
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Hasil Diagnosa');

    // Write to file
    XLSX.writeFile(wb, `${filename}.xlsx`);
  } catch (error) {
    console.error('Error exporting to Excel:', error);
    throw error;
  }
};
