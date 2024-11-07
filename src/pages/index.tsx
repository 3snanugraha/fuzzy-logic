import { useState, useEffect } from 'react';
import { fuzzyDecision } from '../utils/fuzzyLogic';
import { exportToExcel } from '../utils/exportExcel';
import Link from 'next/link';

// Define the interface for result items
interface ResultItem {
  id: number;
  usia: number;
  tekananDarah: number;
  kolesterol: number;
  bmi: number;
  merokok: number;
  risiko: number;
  keterangan: string;
}

// Define the structure for the API response data
interface ApiResponse {
  data: ResultItem[];  // The API response contains an array of ResultItem
}

export default function Home() {
  const [result, setResult] = useState<ResultItem[]>([]);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: string }>({ key: '', direction: '' });

  const fetchData = async () => {
    try {
      setIsLoading(true);
      console.log('Fetching data from /api/fuzzy...');
      
      const res = await fetch('/api/fuzzy');
      
      if (!res.ok) {
        console.error('Failed to fetch data from API:', res.statusText);
        return;
      }

      const data: ApiResponse = await res.json();  // Type the response as ApiResponse
      console.log('Data fetched successfully:', data);

      if (data && data.data) {
        const processedData: ResultItem[] = data.data.map((item: ResultItem) => { // Type item as ResultItem
          const riskValue = fuzzyDecision(
            item.usia,
            item.tekananDarah.toString(),
            item.kolesterol,
            item.bmi,
            item.merokok
          );

          let riskLevel = 'Kecil';
          if (riskValue >= 70) {
            riskLevel = 'Besar';
          } else if (riskValue >= 50) {
            riskLevel = 'Sedang';
          }

          return {
            id: item.id,
            usia: item.usia,
            tekananDarah: item.tekananDarah,
            kolesterol: item.kolesterol,
            bmi: item.bmi,
            merokok: item.merokok,
            risiko: riskValue,
            keterangan: riskLevel,
          };
        });
        setResult(processedData);
      } else {
        console.warn('No data returned from API');
        setResult([]);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    console.log('Component mounted, initiating data fetch...');
    fetchData();
  }, []);

  const handleExportResults = () => {
    const exportData = result.map(item => ({
      ID: item.id,
      Usia: item.usia,
      'Tekanan Darah': item.tekananDarah,
      Kolesterol: item.kolesterol,
      BMI: item.bmi,
      Merokok: item.merokok,
      'Nilai Risiko': parseFloat(item.risiko.toFixed(2)),
      'Keterangan Risiko': item.keterangan,
    }));

    if (exportData.length === 0) {
      console.warn("No data available to export.");
      return;
    }

    exportToExcel(exportData, 'hasil-diagnosa');
  };

  const handleDownloadTemplate = () => {
    window.location.href = '/data/data-pasien.xlsx';
  };

  const handleSort = (key: string) => {
    let direction = 'ascending';
    if (sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
  };

  const sortedData = [...result].sort((a, b) => {
    if (!sortConfig.key) return 0;
    
    if (a[sortConfig.key as keyof ResultItem] < b[sortConfig.key as keyof ResultItem]) {
      return sortConfig.direction === 'ascending' ? -1 : 1;
    }
    if (a[sortConfig.key as keyof ResultItem] > b[sortConfig.key as keyof ResultItem]) {
      return sortConfig.direction === 'ascending' ? 1 : -1;
    }
    return 0;
  });

  const filteredData = sortedData.filter(item =>
    Object.values(item).some(value =>
      String(value).toLowerCase().includes(searchTerm.toLowerCase())
    )
  );  
  
  return (
    <div className="min-h-screen bg-white relative">
      {/* Navigation */}
      <nav className="bg-white shadow-md px-4 py-3">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="text-gray-800 font-bold text-xl">Fuzzy System</div>
          <div className="hidden md:flex space-x-6">
            <Link href="/history" className="text-gray-800 hover:text-blue-600">Riwayat</Link>
            <Link href="/bantuan" className="text-gray-800 hover:text-blue-600">Bantuan</Link>
          </div>
          <div className="md:hidden">
            <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="text-gray-800">
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>
        {isMenuOpen && (
          <div className="md:hidden mt-2">
            <Link href="/" className="block text-gray-800 py-2">Diagnosis</Link>
            <Link href="/history" className="block text-gray-800 py-2">Riwayat</Link>
            <Link href="/bantuan" className="block text-gray-800 py-2">Bantuan</Link>
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

      {/* Result Section */}
      <div className="max-w-7xl mx-auto px-4 py-16">
        <div className="bg-white rounded-xl shadow-2xl p-8">
          <h2 className="text-2xl font-semibold text-gray-800 mb-6 text-center">Hasil Identifikasi</h2>
          
          {/* Search Input and Buttons */}
          <div className="flex flex-col md:flex-row gap-4 mb-4">
            <input
              type="text"
              placeholder="Cari data..."
              className="w-full md:flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <button
              onClick={handleDownloadTemplate}
              className="w-full md:w-auto px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg shadow-lg transition-all duration-300 flex items-center justify-center gap-2"
            >
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              <span className="whitespace-nowrap">Download Data Awal (.xlsx)</span>
            </button>
            
            <button
              onClick={handleExportResults}
              className="w-full md:w-auto px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg shadow-lg transition-all duration-300 flex items-center justify-center gap-2"
            >
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <span className="whitespace-nowrap">Export (.xlsx)</span>
            </button>
          </div>
          {isLoading ? (
            <div className="flex justify-center items-center py-8">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
          ) : filteredData.length > 0 ? (
            <div className="overflow-x-auto">
              <div className="inline-block min-w-full align-middle">
                <div className="overflow-hidden shadow-sm ring-1 ring-black ring-opacity-5 rounded-lg">
                  <table id="fuzzyTable" className="min-w-full divide-y divide-gray-300">
                    <thead className="bg-gray-50">
                      <tr>
                        <th scope="col" onClick={() => handleSort('id')} className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6 cursor-pointer hover:bg-gray-100">
                          ID {sortConfig.key === 'id' && (sortConfig.direction === 'ascending' ? '↑' : '↓')}
                        </th>
                        <th scope="col" onClick={() => handleSort('usia')} className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6 cursor-pointer hover:bg-gray-100">
                          Usia {sortConfig.key === 'usia' && (sortConfig.direction === 'ascending' ? '↑' : '↓')}
                        </th>
                        <th scope="col" onClick={() => handleSort('tekananDarah')} className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 cursor-pointer hover:bg-gray-100">
                          Tekanan Darah {sortConfig.key === 'tekananDarah' && (sortConfig.direction === 'ascending' ? '↑' : '↓')}
                        </th>
                        <th scope="col" onClick={() => handleSort('kolesterol')} className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 cursor-pointer hover:bg-gray-100">
                          Kolesterol {sortConfig.key === 'kolesterol' && (sortConfig.direction === 'ascending' ? '↑' : '↓')}
                        </th>
                        <th scope="col" onClick={() => handleSort('bmi')} className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 cursor-pointer hover:bg-gray-100">
                          BMI {sortConfig.key === 'bmi' && (sortConfig.direction === 'ascending' ? '↑' : '↓')}
                        </th>
                        <th scope="col" onClick={() => handleSort('merokok')} className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 cursor-pointer hover:bg-gray-100">
                          Merokok {sortConfig.key === 'merokok' && (sortConfig.direction === 'ascending' ? '↑' : '↓')}
                        </th>
                        <th scope="col" onClick={() => handleSort('risiko')} className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 cursor-pointer hover:bg-gray-100">
                          Risiko {sortConfig.key === 'risiko' && (sortConfig.direction === 'ascending' ? '↑' : '↓')}
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 bg-white">
                      {filteredData.map((item, index) => (
                        <tr key={index} className="hover:bg-gray-50 transition-colors">
                          <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm text-gray-900 sm:pl-6">{item.id}</td>
                          <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm text-gray-900 sm:pl-6">{item.usia}</td>
                          <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{item.tekananDarah}</td>
                          <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{item.kolesterol}</td>
                          <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{item.bmi}</td>
                          <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{item.merokok}</td>
                          <td className="whitespace-nowrap px-3 py-4 text-sm font-medium">
                            <span className={`px-2 py-1 rounded-full ${
                              item.keterangan === 'Besar' ? 'bg-red-100 text-red-800' :
                              item.keterangan === 'Sedang' ? 'bg-yellow-100 text-yellow-800' :
                              'bg-green-100 text-green-800'
                            }`}>
                              {`${item.risiko.toFixed(2)} - ${item.keterangan}`}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          ) : (
            <p className="text-gray-600 text-center">Belum ada hasil yang tersedia.</p>
          )}
        </div>
      </div>

      {/* Floating Reload Button */}
      <button 
        onClick={fetchData}
        className="fixed bottom-8 right-8 p-4 bg-blue-600 hover:bg-blue-700 text-white rounded-full shadow-lg transition-all duration-300 hover:scale-110"
      >
        <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
        </svg>
      </button>
    </div>
  );}


