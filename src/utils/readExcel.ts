import * as XLSX from 'xlsx';

// Define an interface for the expected row structure
interface ExcelRow {
  ID?: number;
  Usia?: number;
  TekananDarah?: number;
  Kolesterol?: number;
  BMI?: number;
  Merokok?: number;
}

export async function readExcelFile(filePath: string): Promise<ExcelRow[]> {
  try {
    // Membaca file Excel
    const workbook = XLSX.readFile(filePath);
    
    // Mengambil sheet pertama
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    
    // Mengonversi sheet ke dalam bentuk array JSON (header: 0 berarti baris pertama adalah header)
    const jsonData: ExcelRow[] = XLSX.utils.sheet_to_json(worksheet, { header: 0 });
    
    // Validasi dan format data sesuai kebutuhan
    const formattedData = jsonData.map((row) => {
      // Pastikan setiap kolom ada dan sesuai tipe data yang diinginkan
      const ID = row.ID ?? 0; // Kolom "ID"
      const Usia = row.Usia ?? 0; // Kolom "Usia"
      const TekananDarah = row.TekananDarah ?? 0; // Kolom "TekananDarah"
      const Kolesterol = row.Kolesterol ?? 0; // Kolom "Kolesterol"
      const BMI = row.BMI ?? 0; // Kolom "BMI"
      const Merokok = row.Merokok ?? 0; // Kolom "Merokok"
      
      // Kembalikan data dalam format yang dibutuhkan
      return {
        ID,
        Usia,
        TekananDarah,
        Kolesterol,
        BMI,
        Merokok,
      };
    });

    return formattedData;
  } catch (error) {
    throw new Error(`Error membaca file Excel: ${error}`);
  }
}