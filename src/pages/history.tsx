/* eslint-disable */
import { useState, useEffect } from 'react';
import { getClientPocketBase } from '../../services/authManager';
import { exportToExcel } from '../utils/exportExcel';
import Link from 'next/link';

// Define the interface for result items
interface ResultItem {
  id: string;
  user_id: string;
  assessment_date: string;
  age: string;
  blood_pressure: string;
  cholesterol: string;
  bmi: string;
  smoking_history: string;
  risk_score: string;
  risk_level: string;
}

export default function History() {
  const [result, setResult] = useState<ResultItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: string }>({ key: '', direction: '' });

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const pb = getClientPocketBase();
      console.log('Initiating data fetch from PocketBase...');
      
      const records = await pb.collection('cardiovascular_risk_assessments').getFullList(200, {
        sort: '-assessment_date',
        cache: 'no-store',
      });

      console.log('Successfully fetched records:', {
        recordCount: records.length,
        timestamp: new Date().toISOString()
      });

      const transformedData = records.map(record => ({
        id: record.id,
        user_id: record.user_id,
        assessment_date: record.assessment_date,
        age: record.age,
        blood_pressure: record.blood_pressure,
        cholesterol: record.cholesterol,
        bmi: record.bmi,
        smoking_history: record.smoking_history,
        risk_score: record.risk_score,
        risk_level: record.risk_level
      }));

      console.log('Data transformation completed:', {
        transformedCount: transformedData.length,
        firstRecord: transformedData[0]
      });

      setResult(transformedData);

    } catch (error) {
      console.error('Error fetching data from PocketBase:', {
        error,
        timestamp: new Date().toISOString(),
        context: 'history.tsx fetchData'
      });
    } finally {
      setIsLoading(false);
      console.log('Fetch operation completed');
    }
  };
  useEffect(() => {
    fetchData();
  }, []);

  const handleExportResults = () => {
 
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

  // Fungsi untuk menutup menu saat link diklik
  const closeMenu = () => setIsMenuOpen(false);

  return (
    <div className="min-h-screen bg-white">
      <nav className="bg-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex">
              <div className="flex-shrink-0 flex items-center">
                <span className="text-gray-800 font-bold text-xl">Riwayat</span>
              </div>
            </div>
            <div className="hidden md:ml-6 md:flex md:items-center md:space-x-4">
              <Link href="/" className="text-gray-800 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium">
                Beranda
              </Link>
              <Link href="/bantuan" className="text-gray-800 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium">
                Bantuan
              </Link>
            </div>
            <div className="-mr-2 flex items-center md:hidden">
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500"
              >
                <span className="sr-only">Open main menu</span>
                {isMenuOpen ? (
                  <svg className="block h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                ) : (
                  <svg className="block h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile menu, show/hide based on menu state */}
        <div className={`${isMenuOpen ? 'block' : 'hidden'} md:hidden`}>
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            <Link href="/" className="text-gray-800 hover:text-blue-600 block px-3 py-2 rounded-md text-base font-medium" onClick={closeMenu}>
              Beranda
            </Link>
            <Link href="/bantuan" className="text-gray-800 hover:text-blue-600 block px-3 py-2 rounded-md text-base font-medium" onClick={closeMenu}>
              Bantuan
            </Link>
          </div>
        </div>
      </nav>

      <div className="relative bg-gradient-to-r from-blue-500 to-purple-600 py-16 md:py-32">
        <div className="max-w-7xl mx-auto px-4">
          <h1 className="text-3xl md:text-5xl font-bold text-white text-center mb-6">
            Riwayat Identifikasi Penyakit Kardiovaskular
          </h1>
          <p className="text-lg md:text-xl text-blue-100 text-center">
            Lihat dan kelola riwayat hasil identifikasi penyakit kardiovaskular
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8 md:py-16">
        <div className="bg-white rounded-xl shadow-2xl p-4 md:p-8">
          <h2 className="text-xl md:text-2xl font-semibold text-gray-800 mb-6 text-center">History Identifikasi</h2>
          
          <div className="flex flex-col md:flex-row gap-4 mb-4">
            <div className="relative flex-1">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <input
                type="text"
                placeholder="Cari data..."
                className="w-full pl-10 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
            <div className="flex flex-col md:flex-row gap-2">
              <Link 
                href="/" 
                className="group w-full md:w-auto px-6 py-2 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white rounded-lg shadow-lg transition-all duration-300 text-center flex items-center justify-center space-x-2 hover:transform hover:scale-105"
              >
                <svg 
                  className="h-5 w-5 transform group-hover:rotate-12 transition-transform duration-300" 
                  fill="none" 
                  viewBox="0 0 24 24" 
                  stroke="currentColor"
                >
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth={2} 
                    d="M9 13h6m-3-3v6m5 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" 
                  />
                </svg>
                <span>Analisa Lagi</span>
              </Link>

              <button
                onClick={handleExportResults}
                className="group w-full md:w-auto px-6 py-2 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-lg shadow-lg transition-all duration-300 flex items-center justify-center space-x-2 hover:transform hover:scale-105"
              >
                <svg 
                  className="h-5 w-5 transform group-hover:-translate-y-1 transition-transform duration-300" 
                  fill="none" 
                  viewBox="0 0 24 24" 
                  stroke="currentColor"
                >
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth={2} 
                    d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" 
                  />
                </svg>
                <span>Export (.xlsx)</span>
              </button>
            </div>
          </div>
          
          {isLoading ? (
            <div className="flex justify-center items-center py-8">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
          ) : filteredData.length > 0 ? (
            <div className="overflow-x-auto">
              <div className="inline-block min-w-full align-middle">
                <div className="overflow-hidden shadow-sm ring-1 ring-black ring-opacity-5">
                  <table className="min-w-full divide-y divide-gray-300">
                    <thead className="bg-gray-50">
                      <tr>
                        <th onClick={() => handleSort('user_id')} className="py-3.5 px-3 text-left text-sm font-semibold text-gray-900 cursor-pointer">
                          User ID{sortConfig.key === 'user_id' && (sortConfig.direction === 'ascending' ? ' ↑' : ' ↓')}
                        </th>
                        <th onClick={() => handleSort('assessment_date')} className="py-3.5 px-3 text-left text-sm font-semibold text-gray-900 cursor-pointer">
                          Tanggal{sortConfig.key === 'assessment_date' && (sortConfig.direction === 'ascending' ? ' ↑' : ' ↓')}
                        </th>
                        <th onClick={() => handleSort('age')} className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 cursor-pointer">
                          Usia{sortConfig.key === 'age' && (sortConfig.direction === 'ascending' ? ' ↑' : ' ↓')}
                        </th>
                        <th onClick={() => handleSort('blood_pressure')} className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 cursor-pointer">Tekanan Darah</th>
                        <th onClick={() => handleSort('cholesterol')} className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 cursor-pointer">Kolesterol</th>
                        <th onClick={() => handleSort('bmi')} className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 cursor-pointer">BMI</th>
                        <th onClick={() => handleSort('smoking_history')} className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 cursor-pointer">Merokok</th>
                        <th onClick={() => handleSort('risk_score')} className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 cursor-pointer">Nilai Risiko</th>
                        <th onClick={() => handleSort('risk_level')} className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 cursor-pointer">Keterangan Risiko</th>
                        <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Aksi</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 bg-white">
                      {filteredData.map((item, index) => (
                        <tr key={index} className="hover:bg-gray-50">
                          <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-900">{item.user_id}</td>
                          <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-900">{item.assessment_date}</td>
                          <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{item.age}</td>
                          <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{item.blood_pressure}</td>
                          <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{item.cholesterol}</td>
                          <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{item.bmi}</td>
                          <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{item.smoking_history}</td>
                          <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{item.risk_score}</td>
                          <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{item.risk_level}</td>
                          <td className="whitespace-nowrap px-3 py-4 text-sm">
                            <Link 
                              href={{
                                pathname: '/result/[id]',
                                query: { id: item.id },
                              }}
                              as={`/result/${item.id}`}
                              className="inline-flex items-center px-3 py-1.5 bg-blue-100 hover:bg-blue-200 text-blue-700 rounded-full text-sm font-medium transition-all duration-300 transform hover:scale-105 hover:shadow-md"
                            >
                              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                              </svg>
                              Lihat Detail
                            </Link>
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
      
      <button 
        onClick={fetchData}
        className="fixed bottom-8 right-8 p-4 bg-blue-600 hover:bg-blue-700 text-white rounded-full shadow-lg transition-all duration-300 hover:scale-110"
      >
        <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
        </svg>
      </button>
    </div>
  );
}