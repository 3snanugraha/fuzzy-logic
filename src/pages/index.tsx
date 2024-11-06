import { useState, useEffect } from 'react';

export default function Home() {
  const [result, setResult] = useState<any[]>([]);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      console.log('Fetching data from /api/fuzzy...');
      
      const res = await fetch('/api/fuzzy');
      
      if (!res.ok) {
        console.error('Failed to fetch data from API:', res.statusText);
        return;
      }

      const data = await res.json();
      console.log('Data fetched successfully:', data);

      if (data && data.data) {
        setResult(data.data);
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

  return (
    <div className="min-h-screen bg-white relative">
      {/* Navigation */}
      <nav className="bg-white shadow-md px-4 py-3">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="text-gray-800 font-bold text-xl">Fuzzy System</div>
          <div className="hidden md:flex space-x-6">
            <a href="/" className="text-gray-800 hover:text-blue-600">Diagnosis</a>
            <a href="/dataset" className="text-gray-800 hover:text-blue-600">Dataset</a>
            <a href="/bantuan" className="text-gray-800 hover:text-blue-600">Bantuan</a>
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
            <a href="/" className="block text-gray-800 py-2">Diagnosis</a>
            <a href="/dataset" className="block text-gray-800 py-2">Dataset</a>
            <a href="/bantuan" className="block text-gray-800 py-2">Bantuan</a>
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
          {isLoading ? (
            <div className="flex justify-center items-center py-8">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
          ) : result.length > 0 ? (
            <div className="overflow-x-auto">
              <div className="inline-block min-w-full align-middle">
                <div className="overflow-hidden shadow-sm ring-1 ring-black ring-opacity-5">
                  <table className="min-w-full divide-y divide-gray-300">
                    <thead className="bg-gray-50">
                      <tr>
                        <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6">Usia</th>
                        <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Tekanan Darah</th>
                        <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Kolesterol</th>
                        <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">BMI</th>
                        <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Merokok</th>
                        <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Risiko</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 bg-white">
                      {result.map((item, index) => (
                        <tr key={index}>
                          <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm text-gray-900 sm:pl-6">{item.usia}</td>
                          <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{item.tekananDarah}</td>
                          <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{item.kolesterol}</td>
                          <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{item.bmi}</td>
                          <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{item.merokok}</td>
                          <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{item.risiko}</td>
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
  );
}