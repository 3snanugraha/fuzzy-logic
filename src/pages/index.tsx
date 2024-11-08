import { useState } from 'react';
import { fuzzyDecision } from '../utils/fuzzyLogic';
import Link from 'next/link';
import { adminLogin, getClientPocketBase } from '../../services/authManager';
import { useRouter } from 'next/router';
import Image from 'next/image';

// Interface for the form input data
interface InputData {
  age: string;
  blood_pressure: string;
  cholesterol: string;
  bmi: string;
  smoking_history: string;
}

// Main Home component
export default function Home() {
  const router = useRouter();
  const [inputData, setInputData] = useState<InputData>({
    age: '',
    blood_pressure: '',
    cholesterol: '',
    bmi: '',
    smoking_history: ''
  });

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  // Handle form input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setInputData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Validate form data
  const validateForm = () => {
    return Object.values(inputData).every(value => value.trim() !== '');
  };

  // Test data
  // const testData = () => {
  //   const hasil = fuzzyDecision(60,266,260,67,27);
  //   return hasil;
  // }

  // console.log(testData());

  // Process the form submission
  const handleProcess = async () => {
    if (!validateForm()) {
      alert('Harap lengkapi semua data!');
      return;
    }

    setIsProcessing(true);
    try {
      // Login as admin first
      await adminLogin();
      
      // Calculate risk using fuzzy logic
      const riskValue = fuzzyDecision(
        parseFloat(inputData.age),
        parseFloat(inputData.blood_pressure),
        parseFloat(inputData.cholesterol),
        parseFloat(inputData.bmi),
        parseFloat(inputData.smoking_history)
      );

      // Determine risk level
      let riskLevel = 'Rendah';
      if (riskValue >= 70) {
        riskLevel = 'Tinggi';
      } else if (riskValue >= 50) {
        riskLevel = 'Sedang';
      }

      // Save to PocketBase
      const pb = getClientPocketBase();
      const record = await pb.collection('cardiovascular_risk_assessments').create({
        assessment_date: new Date().toISOString().split('T')[0],
        age: inputData.age,
        blood_pressure: inputData.blood_pressure,
        cholesterol: inputData.cholesterol,
        bmi: inputData.bmi,
        smoking_history: inputData.smoking_history,
        risk_score: riskValue.toString(),
        risk_level: riskLevel
      });

      // Navigate to result page
      router.push(`/result/${record.id}`);

      // Clear form after successful submission
      setInputData({
        age: '',
        blood_pressure: '',
        cholesterol: '',
        bmi: '',
        smoking_history: ''
      });

      alert('Data berhasil diproses!');
    } catch (error) {
      console.error('Error processing data:', error);
      alert('Terjadi kesalahan saat memproses data');
    } finally {
      setIsProcessing(false);
    }
  };

  const fetchData = async () => {
    console.log('Belum ada fitur');
  };

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
            <Link href="/history" className="block text-gray-800 py-2">Riwayat</Link>
            <Link href="/bantuan" className="block text-gray-800 py-2">Bantuan</Link>
          </div>
        )}
      </nav>

      {/* Hero Section */}
      <div className="relative bg-gradient-to-r from-blue-500 to-purple-600 py-32 rounded-b-3xl">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex justify-center">
            <Image
              src="/hero.svg"
              alt="Cardiovascular Risk Assessment"
              width={250}
              height={50}
              className="h-auto mb-3"
            />
          </div>
          <p className="text-xl text-blue-100 text-center">
            Identifikasi penyakit kardiovaskular menggunakan metode fuzzy yang akurat dan efisien
          </p>
        </div>
      </div>

      {/* Form Section */}
      <div className="max-w-7xl mx-auto px-4 py-16">
        <div className="bg-white rounded-xl shadow-2xl p-8 pb-20">
          <h2 className="text-2xl font-bold text-gray-800 mb-8 text-center">Lengkapi Formulir Berikut Untuk Menganalisis</h2>

          <div className="max-w-3xl mx-auto space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {['age', 'blood_pressure', 'cholesterol', 'bmi', 'smoking_history'].map((field, index) => (
                <div key={index} className="transform hover:scale-105 transition-transform duration-300">
                  <label className="block text-lg font-semibold text-gray-700 mb-2">
                    {field === 'age' && 'Umur (tahun)'}
                    {field === 'blood_pressure' && 'Tekanan Darah (mmHg)'}
                    {field === 'cholesterol' && 'Kolesterol (mg/dL)'}
                    {field === 'bmi' && 'BMI'}
                    {field === 'smoking_history' && 'Riwayat Merokok (tahun)'}
                  </label>
                  <input
                    type="number"
                    name={field}
                    value={inputData[field as keyof InputData]}
                    onChange={handleInputChange}
                    className="mt-2 block w-full rounded-lg border-2 border-gray-300 shadow-lg focus:border-blue-500 focus:ring-blue-500 px-4 py-3 text-lg text-black"
                    placeholder={`Input hanya angka..`}
                    step={field === 'bmi' ? '0.1' : undefined}
                  />
                </div>
              ))}
            </div>

            <button
              onClick={handleProcess}
              disabled={isProcessing}
              className="w-full py-4 px-6 border-2 border-transparent rounded-lg shadow-lg text-lg font-bold text-white bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 focus:outline-none focus:ring-4 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 transform hover:scale-105 transition-all duration-300 mt-8"
            >
              {isProcessing ? (
                <span className="inline-flex items-center">
                  <span>Memproses</span>
                  <span className="ml-2 inline-flex">
                    <span className="animate-bounce delay-100">.</span>
                    <span className="animate-bounce delay-200">.</span>
                    <span className="animate-bounce delay-300">.</span>
                  </span>
                  <svg className="animate-spin ml-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                </span>
              ) : 'Proses'}
            </button>
          </div>
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
