import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { getClientPocketBase } from '../services/authManager';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { Chart, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, ChartOptions } from 'chart.js';

// Register Chart.js components
Chart.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

// Dynamic import for Line chart
const Line = dynamic(() => import('react-chartjs-2').then(mod => mod.Line), { ssr: false });

interface AssessmentData {
  id: string;
  assessment_date: string;
  age: string;
  blood_pressure: string;
  cholesterol: string;
  bmi: string;
  smoking_history: string;
  risk_score: string;
  risk_level: string;
}

export default function Result() {
  const router = useRouter();
  const { id } = router.query;
  const [data, setData] = useState<AssessmentData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isSubscribed = true;
    const fetchAssessmentData = async () => {
      if (!id) return;
      try {
        const pb = getClientPocketBase();
        const record = await pb.collection('cardiovascular_risk_assessments').getOne(id as string);
        
        if (isSubscribed) {
          setData({
            id: record.id,
            assessment_date: record.assessment_date,
            age: record.age,
            blood_pressure: record.blood_pressure,
            cholesterol: record.cholesterol,
            bmi: record.bmi,
            smoking_history: record.smoking_history,
            risk_score: record.risk_score,
            risk_level: record.risk_level,
          });
        }
      } catch (error) {
        if (isSubscribed) {
          console.error('Error fetching assessment data:', error);
        }
      } finally {
        if (isSubscribed) {
          setIsLoading(false);
        }
      }
    };

    fetchAssessmentData();

    return () => {
      isSubscribed = false;
    };
  }, [id]);

  const chartData = {
    labels: ['Usia', 'Tekanan Darah', 'Kolesterol', 'BMI', 'Riwayat Merokok'],
    datasets: [
      {
        label: 'Nilai Parameter',
        data: data ? [
          parseFloat(data.age),
          parseFloat(data.blood_pressure),
          parseFloat(data.cholesterol),
          parseFloat(data.bmi),
          parseFloat(data.smoking_history)
        ] : [],
        borderColor: 'rgb(75, 192, 192)',
        tension: 0.1,
        fill: false,
      },
    ],
  };

  const chartOptions: ChartOptions<'line'> = {
    responsive: true,
    plugins: {
      legend: {
        position: 'bottom' as const,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
      },
    },
  };
  

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-gray-600">Data tidak ditemukan</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-md px-4 py-3">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="text-gray-800 font-bold text-xl">Detail Hasil</div>
          <div className="flex space-x-6">
            <Link href="/history" className="text-gray-800 hover:text-blue-600">Kembali</Link>
          </div>
        </div>
      </nav>

      <div className="relative bg-gradient-to-r from-blue-500 to-purple-600 py-16 md:py-32">
        <div className="max-w-7xl mx-auto px-4">
          <h1 className="text-3xl md:text-5xl font-bold text-white text-center mb-6">
            Grafik dan hasil Identifikasi
          </h1>
          <p className="text-lg md:text-xl text-blue-100 text-center">
            Berikut adalah hasilnya :
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="bg-white rounded-xl shadow-lg p-8">
          <h2 className="text-2xl font-semibold text-gray-800 mb-6 text-center">
            Hasil Identifikasi Risiko Kardiovaskular
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-4">
              <div className="p-4 bg-white rounded-lg border border-gray-200">
                <h3 className="font-semibold mb-2 text-gray-800 text-center">Data Parameter</h3>
                <div className="space-y-2">
                  <p className="flex justify-between">
                    <span className="text-gray-700">Usia:</span>
                    <span className="font-medium text-gray-900">{data.age} tahun</span>
                  </p>
                  <p className="flex justify-between">
                    <span className="text-gray-700">Tekanan Darah:</span>
                    <span className="font-medium text-gray-900">{data.blood_pressure} mmHg</span>
                  </p>
                  <p className="flex justify-between">
                    <span className="text-gray-700">Kolesterol:</span>
                    <span className="font-medium text-gray-900">{data.cholesterol} mg/dL</span>
                  </p>
                  <p className="flex justify-between">
                    <span className="text-gray-700">BMI:</span>
                    <span className="font-medium text-gray-900">{data.bmi} kg/m²</span>
                  </p>
                  <p className="flex justify-between">
                    <span className="text-gray-700">Riwayat Merokok:</span>
                    <span className="font-medium text-gray-900">{data.smoking_history} tahun</span>
                  </p>
                </div>
              </div>

              <div className="p-4 bg-white rounded-lg border border-gray-200">
                <h3 className="font-semibold mb-2 text-gray-800 text-center">Hasil Analisis</h3>
                <div className="space-y-2">
                  <p className="flex justify-between">
                    <span className="text-gray-700">Nilai Risiko:</span>
                    <span className="font-medium text-gray-900">{data.risk_score}%</span>
                  </p>
                  <p className="flex justify-between">
                    <span className="text-gray-700">Level Risiko:</span>
                    <span className={`inline-flex items-center px-3 py-1 rounded-full font-medium ${
                      data.risk_level === 'Tinggi' ? 'bg-red-100 text-red-600' :
                      data.risk_level === 'Sedang' ? 'bg-yellow-100 text-yellow-600' :
                      data.risk_level === 'Kecil' ? 'bg-blue-100 text-blue-600' :
                      'bg-green-100 text-green-600'
                    }`}>
                      {data.risk_level}
                      {data.risk_level === 'Tinggi' && <span className="ml-1">⚠️</span>}
                      {data.risk_level === 'Sedang' && <span className="ml-1">⚡</span>}
                      {data.risk_level === 'Kecil' && <span className="ml-1">ℹ️</span>}
                      {data.risk_level === 'Rendah' && <span className="ml-1">✅</span>}
                    </span>
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white p-4 rounded-lg shadow-md">
              <h3 className="font-semibold mb-4 text-gray-800 text-center">Grafik Parameter</h3>
              <Line data={chartData} options={chartOptions} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}