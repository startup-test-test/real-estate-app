import React from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ChartOptions,
} from 'chart.js';
import { Chart } from 'react-chartjs-2';

// Chart.jsのコンポーネントを登録
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend
);

interface CashFlowData {
  '年次': number;
  '満室想定収入': number;
  '空室率（%）': number;
  '実効収入': number;
  '経費': number;
  '大規模修繕': number;
  'ローン返済': number;
  '営業CF': number;
  '累計CF': number;
}

interface CashFlowChartProps {
  data: CashFlowData[];
}

const CashFlowChart: React.FC<CashFlowChartProps> = ({ data }) => {
  if (!data || data.length === 0) {
    return null;
  }

  // データを準備
  const years = data.map(row => `${row['年次']}年目`);
  const annualCashFlow = data.map(row => row['営業CF'] / 10000); // 万円単位
  const cumulativeCashFlow = data.map(row => row['累計CF'] / 10000); // 万円単位
  const income = data.map(row => row['実効収入'] / 10000); // 万円単位
  const expenses = data.map(row => (row['経費'] + row['大規模修繕'] + row['ローン返済']) / 10000); // 万円単位

  const chartData = {
    labels: years,
    datasets: [
      {
        type: 'bar' as const,
        label: '年次キャッシュフロー',
        data: annualCashFlow,
        backgroundColor: 'rgba(59, 130, 246, 0.7)', // blue-500 with opacity
        borderColor: 'rgb(59, 130, 246)',
        borderWidth: 1,
        yAxisID: 'y',
      },
      {
        type: 'line' as const,
        label: '累計キャッシュフロー',
        data: cumulativeCashFlow,
        borderColor: 'rgb(239, 68, 68)', // red-500
        backgroundColor: 'rgba(239, 68, 68, 0.1)',
        borderWidth: 3,
        pointBackgroundColor: 'rgb(239, 68, 68)',
        pointBorderColor: 'rgb(239, 68, 68)',
        pointBorderWidth: 2,
        pointRadius: 5,
        fill: false,
        yAxisID: 'y1',
      },
      {
        type: 'bar' as const,
        label: '実効収入',
        data: income,
        backgroundColor: 'rgba(34, 197, 94, 0.5)', // green-500 with opacity
        borderColor: 'rgb(34, 197, 94)',
        borderWidth: 1,
        yAxisID: 'y',
      },
      {
        type: 'bar' as const,
        label: '総支出',
        data: expenses,
        backgroundColor: 'rgba(249, 115, 22, 0.5)', // orange-500 with opacity
        borderColor: 'rgb(249, 115, 22)',
        borderWidth: 1,
        yAxisID: 'y',
      },
    ],
  };

  const options: ChartOptions<'bar' | 'line'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
        labels: {
          usePointStyle: true,
          padding: 20,
          font: {
            size: 12,
          },
        },
      },
      title: {
        display: true,
        text: '年次キャッシュフロー推移',
        font: {
          size: 16,
          weight: 'bold',
        },
        padding: {
          top: 10,
          bottom: 30,
        },
      },
      tooltip: {
        mode: 'index' as const,
        intersect: false,
        callbacks: {
          label: function(context) {
            const label = context.dataset.label || '';
            const value = context.parsed.y;
            return `${label}: ${value.toLocaleString()}万円`;
          },
        },
      },
    },
    scales: {
      x: {
        display: true,
        title: {
          display: true,
          text: '経過年数',
          font: {
            size: 14,
            weight: 'bold',
          },
        },
        grid: {
          display: false,
        },
      },
      y: {
        type: 'linear' as const,
        display: true,
        position: 'left' as const,
        title: {
          display: true,
          text: '年次CF・収支（万円）',
          font: {
            size: 14,
            weight: 'bold',
          },
        },
        grid: {
          color: 'rgba(0, 0, 0, 0.1)',
        },
        ticks: {
          callback: function(value) {
            return `${Number(value).toLocaleString()}万円`;
          },
        },
      },
      y1: {
        type: 'linear' as const,
        display: true,
        position: 'right' as const,
        title: {
          display: true,
          text: '累計CF（万円）',
          font: {
            size: 14,
            weight: 'bold',
          },
        },
        grid: {
          drawOnChartArea: false,
        },
        ticks: {
          callback: function(value) {
            return `${Number(value).toLocaleString()}万円`;
          },
        },
      },
    },
    interaction: {
      mode: 'index' as const,
      intersect: false,
    },
  };

  return (
    <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm chart-container">
      <div className="h-96 w-full">
        <Chart type="bar" data={chartData} options={options} />
      </div>
      <div className="mt-4 text-sm text-gray-600">
        <p>
          <span className="font-medium">📊 グラフの見方:</span>
          棒グラフは年次の収支状況、赤い線は累計キャッシュフローの推移を表示しています。
        </p>
      </div>
    </div>
  );
};

export default CashFlowChart;