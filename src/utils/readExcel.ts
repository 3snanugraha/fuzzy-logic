import * as XLSX from 'xlsx';

export function readExcelFile(filePath: string): Promise<any[]> {
  return new Promise((resolve, reject) => {
    try {
      // Membaca file Excel
      const workbook = XLSX.readFile(filePath);
      
      // Mengambil sheet pertama
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      
      // Mengonversi sheet ke dalam bentuk array JSON (header: 0 berarti baris pertama adalah header)
      const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 0 });
      
      // Validasi dan format data sesuai kebutuhan
      const formattedData = jsonData.map((row: any) => {
        // Pastikan setiap kolom ada dan sesuai tipe data yang diinginkan
        const id = row['ID'] || 0; // Kolom "ID"
        const usia = row['Usia'] || 0; // Kolom "Usia"
        const tekananDarah = row['TekananDarah'] || 0; // Kolom "TekananDarah"
        const kolesterol = row['Kolesterol'] || 0; // Kolom "Kolesterol"
        const bmi = row['BMI'] || 0; // Kolom "BMI"
        const merokok = row['Merokok'] || 0; // Kolom "Merokok"
        
        // Kembalikan data dalam format yang dibutuhkan
        return {
          id,
          usia,
          tekananDarah,
          kolesterol,
          bmi,
          merokok,
        };
      });

      resolve(formattedData); // Mengembalikan data yang telah diformat
    } catch (error) {
      reject('Error membaca file Excel: ' + error);
    }
  });
}
