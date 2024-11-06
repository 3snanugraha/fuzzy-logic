import { useState, FormEvent, ChangeEvent } from 'react';

export default function Home() {
  const [file, setFile] = useState<File | null>(null); // State untuk file yang diupload
  const [result, setResult] = useState<string | null>(null); // State untuk menyimpan hasil identifikasi
  const [isMenuOpen, setIsMenuOpen] = useState(false); // State untuk toggle menu mobile

  // Fungsi untuk menangani submit form
  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!file) {
      alert("Pilih file Excel terlebih dahulu.");
      return;
    }

    // Membuat form data untuk mengirimkan file
    const formData = new FormData();
    formData.append("file", file);

    try {
      // Mengirimkan permintaan POST ke API untuk memproses file
      const res = await fetch('/api/fuzzy', {
        method: 'POST',
        body: formData,
      });

      // Mengambil hasil dari API
      const data = await res.json();
      if (res.ok) {
        setResult(JSON.stringify(data.data)); // Menampilkan data hasil identifikasi
      } else {
        setResult("Terjadi kesalahan saat memproses file.");
      }
    } catch (error) {
      console.error("Error:", error);
      setResult("Terjadi kesalahan jaringan.");
    }
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="bg-white shadow-md px-4 py-3">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="text-gray-800 font-bold text-xl">Fuzzy System</div>
          <div className="md:hidden">
            <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="text-gray-800">
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
          <div className="hidden md:flex space-x-4">
            <a href="#" className="text-gray-800 hover:text-blue-600">Home</a>
            <a href="#" className="text-gray-800 hover:text-blue-600">About</a>
            <a href="#" className="text-gray-800 hover:text-blue-600">Contact</a>
          </div>
        </div>
        {isMenuOpen && (
          <div className="md:hidden mt-2">
            <a href="#" className="block text-gray-800 py-2">Home</a>
            <a href="#" className="block text-gray-800 py-2">About</a>
            <a href="#" className="block text-gray-800 py-2">Contact</a>
          </div>
        )}
      </nav>

      {/* Hero Section */}
      <div className="relative bg-gradient-to-r from-blue-500 to-purple-600 py-32">
        <div className="max-w-7xl mx-auto px-4">
          <h1 className="text-4xl md:text-5xl font-bold text-white text-center mb-6">
            Sistem Identifikasi Penyakit Kardiovaskular dengan Fuzzy Tsukamoto
          </h1>
          <p className="text-xl text-blue-100 text-center">
            Identifikasi penyakit kardiovaskular menggunakan metode fuzzy yang akurat dan efisien
          </p>
        </div>
      </div>

      {/* Form and Result Section */}
      <div className="max-w-7xl mx-auto px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Form Card */}
          <div className="bg-white rounded-xl shadow-2xl p-8">
            <h2 className="text-2xl font-semibold text-gray-800 mb-6">Form Identifikasi</h2>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="flex flex-col">
                <label className="text-lg font-medium text-gray-700 mb-2">
                  Upload File Excel:
                  <input
                    type="file"
                    accept=".xlsx, .xls"
                    onChange={(e: ChangeEvent<HTMLInputElement>) => {
                      if (e.target.files?.length) {
                        setFile(e.target.files[0]);
                      }
                    }}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  />
                </label>
              </div>
              <button
                type="submit"
                className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg shadow-md transition duration-300"
              >
                Identifikasi
              </button>
            </form>
          </div>

          {/* Result Card */}
          <div className="bg-white rounded-xl shadow-2xl p-8">
            <h2 className="text-2xl font-semibold text-gray-800 mb-6">Hasil Identifikasi</h2>
            {result !== null ? (
              <div className="p-6 bg-gray-50 rounded-lg">
                <p className="text-lg text-gray-700">{result}</p>
              </div>
            ) : (
              <div className="p-6 bg-gray-50 rounded-lg">
                <p className="text-lg text-gray-500">Hasil identifikasi akan muncul di sini setelah form disubmit.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
