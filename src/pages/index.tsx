import { useState, useEffect } from 'react';

export default function Home() {
  const [result, setResult] = useState<any[]>([]);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const fetchData = async () => {
    try {
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

      {/* Result Section */}
      <div className="max-w-7xl mx-auto px-4 py-16">
        <div className="bg-white rounded-xl shadow-2xl p-8">
          <h2 className="text-2xl font-semibold text-gray-800 mb-6">Hasil Identifikasi</h2>
          {result.length > 0 ? (
            <div className="p-6 bg-gray-50 rounded-lg">
              <table className="min-w-full text-left table-auto">
                <thead>
                  <tr>
                    <th className="py-2 px-4 text-gray-600">Usia</th>
                    <th className="py-2 px-4 text-gray-600">Tekanan Darah</th>
                    <th className="py-2 px-4 text-gray-600">Kolesterol</th>
                    <th className="py-2 px-4 text-gray-600">BMI</th>
                    <th className="py-2 px-4 text-gray-600">Merokok</th>
                    <th className="py-2 px-4 text-gray-600">Risiko</th>
                  </tr>
                </thead>
                <tbody>
                  {result.map((item, index) => (
                    <tr key={index} className="border-t">
                      <td className="py-2 px-4">{item.usia}</td>
                      <td className="py-2 px-4">{item.tekananDarah}</td>
                      <td className="py-2 px-4">{item.kolesterol}</td>
                      <td className="py-2 px-4">{item.bmi}</td>
                      <td className="py-2 px-4">{item.merokok}</td>
                      <td className="py-2 px-4">{item.risiko}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-gray-600">Belum ada hasil yang tersedia.</p>
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
