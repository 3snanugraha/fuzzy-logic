import * as XLSX from 'xlsx';

export function readExcelFile(filePath: string): Promise<any[]> {
  return new Promise((resolve, reject) => {
    try {
      // Membaca file Excel
      const workbook = XLSX.readFile(filePath);
      
      // Mengambil sheet pertama
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      
      // Mengonversi sheet ke dalam bentuk array JSON
      const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
      
      // Menyaring data untuk digunakan dalam sistem
      // Anda bisa menyesuaikan ini berdasarkan struktur kolom yang ada pada file Excel
      const formattedData = jsonData.map((row: any) => ({
        usia: row[0], // Usia pada kolom pertama
        tekananDarah: row[1], // Tekanan darah pada kolom kedua
        kolesterol: row[2], // Kolesterol pada kolom ketiga
        bmi: row[3], // BMI pada kolom keempat
        merokok: row[4], // Merokok pada kolom kelima
      }));

      resolve(formattedData); // Mengembalikan data yang telah diformat
    } catch (error) {
      reject('Error membaca file Excel: ' + error);
    }
  });
}
