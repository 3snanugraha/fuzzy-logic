/* eslint-disable */
import { useState, useEffect } from 'react';
import { getClientPocketBase } from './services/authManager';
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
    // const exportData = result.map(item => ({
    //   ID: parseInt(item.id),
    //   'Tanggal Assessment': item.assessment_date,
    //   Usia: parseInt(item.age),
    //   'Tekanan Darah': item.blood_pressure,
    //   Kolesterol: parseInt(item.cholesterol),
    //   BMI: parseFloat(item.bmi),
    //   Merokok: item.smoking_history,
    //   'Nilai Risiko': parseFloat(item.risk_score),
    //   'Keterangan Risiko': item.risk_level,
    // }));

    // if (exportData.length === 0) {
    //   console.warn("No data available to export.");
    //   return;
    // }

    // exportToExcel(exportData, 'hasil-history');
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
    <div className="min-h-screen bg-white">
      <nav className="bg-white shadow-md px-4 py-3">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="text-gray-800 font-bold text-xl">History</div>
          <div className="hidden md:flex space-x-6">
            <Link href="/" className="text-gray-800 hover:text-blue-600">Beranda</Link>
            <Link href="/bantuan" className="text-gray-800 hover:text-blue-600">Bantuan</Link>
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
            <input
              type="text"
              placeholder="Cari data..."
              className="w-full md:flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <button
              onClick={handleExportResults}
              className="w-full md:w-auto px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg shadow-lg transition-all duration-300"
            >
              Export (.xlsx)
            </button>
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