import React from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  BarController,
  LineController,
  Title,
  Tooltip,
  Legend,
  ChartOptions,
} from 'chart.js';
import { Chart } from 'react-chartjs-2';
import { CashFlowData } from '../types';

// Chart.jsのコンポーネントを登録
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  BarController,
  LineController,
  Title,
  Tooltip,
  Legend
);

interface CashFlowChartProps {
  data: CashFlowData[];
}

const CashFlowChart: React.FC<CashFlowChartProps> = ({ data }) => {
  if (!data || data.length === 0) {
    return null;
  }

  // データを準備（null/undefined チェック付き）
  const years = data.map((row, index) => `${index + 1}年`);
  const annualCashFlow = data.map(row => (row['営業CF'] || 0) / 10000); // 万円単位
  const cumulativeCashFlow = data.map(row => (row['累計CF'] || 0) / 10000); // 万円単位
  const income = data.map(row => (row['実効収入'] || 0) / 10000); // 万円単位
  const expenses = data.map(row => 
    ((row['経費'] || 0) + (row['ローン返済'] || 0)) / 10000
  ); // 万円単位
  const saleProfit = data.map(row => (row['売却時手取り'] || row['売却益'] || 0) / 10000); // 万円単位

  // 累計CFと売却時累計CFを分離（最後の年のみ売却時累計CFを表示）
  const cumulativeCashFlowBar = data.map((row, index) => {
    if (index === data.length - 1) return 0; // 最後の年は売却時累計CFとして別表示
    return (row['累計CF'] || 0) / 10000;
  });
  
  const saleCumulativeCF = data.map((row, index) => {
    if (index === data.length - 1) return (row['累計CF'] || 0) / 10000;
    return 0;
  });

  const chartData = {
    labels: years,
    datasets: [
      {
        type: 'bar' as const,
        label: '累計CF(右軸)',
        data: cumulativeCashFlowBar,
        backgroundColor: 'rgba(139, 92, 246, 0.5)', // 紫系
        borderColor: 'rgba(139, 92, 246, 0)',
        borderWidth: 0,
        yAxisID: 'y1',
        stack: 'Stack 0',
      },
      {
        type: 'bar' as const,
        label: '売却時累計CF(右軸)',
        data: saleCumulativeCF,
        backgroundColor: 'rgba(59, 130, 246, 0.5)', // 青系
        borderColor: 'rgba(59, 130, 246, 0)',
        borderWidth: 0,
        yAxisID: 'y1',
        stack: 'Stack 0',
      },
      {
        type: 'line' as const,
        label: 'CF(左軸)',
        data: annualCashFlow,
        borderColor: 'rgb(236, 72, 153)', // ピンク
        backgroundColor: 'transparent',
        borderWidth: 3,
        pointRadius: 0,
        pointHoverRadius: 0,
        yAxisID: 'y',
        tension: 0,
      },
      {
        type: 'line' as const,
        label: '実質年間収入(左軸)',
        data: income,
        borderColor: 'rgb(34, 197, 94)', // 緑
        backgroundColor: 'transparent',
        borderWidth: 3,
        pointRadius: 0,
        pointHoverRadius: 0,
        yAxisID: 'y',
        tension: 0,
      },
      {
        type: 'line' as const,
        label: '支出(左軸)',
        data: expenses,
        borderColor: 'rgb(251, 146, 60)', // オレンジ
        backgroundColor: 'transparent',
        borderWidth: 3,
        pointRadius: 0,
        pointHoverRadius: 0,
        yAxisID: 'y',
        tension: 0,
      },
    ],
  };

  const options: ChartOptions<'bar' | 'line'> & { plugins?: any } = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: true,
        position: 'top' as const,
        align: 'center' as const,
        labels: {
          usePointStyle: false,
          padding: 15,
          boxWidth: 40,
          boxHeight: 2,
          font: {
            size: 12,
            weight: 'normal',
            family: 'system-ui, -apple-system, sans-serif',
          },
          color: '#374151',
          generateLabels: function(chart) {
            const datasets = chart.data.datasets;
            return datasets.map((dataset, i) => {
              const isLine = dataset.type === 'line';
              return {
                text: dataset.label,
                fillStyle: isLine ? 'transparent' : dataset.backgroundColor,
                strokeStyle: dataset.borderColor || dataset.backgroundColor,
                lineWidth: isLine ? 3 : 0,
                pointStyle: isLine ? 'line' : 'rect',
                hidden: !chart.isDatasetVisible(i),
                datasetIndex: i
              };
            });
          },
        },
      },
      title: {
        display: false,
      },
      tooltip: {
        mode: 'index' as const,
        intersect: false,
        backgroundColor: 'rgba(0, 0, 0, 0.9)',
        titleColor: '#fff',
        bodyColor: '#fff',
        borderColor: 'rgba(255, 255, 255, 0.2)',
        borderWidth: 1,
        cornerRadius: 8,
        displayColors: true,
        callbacks: {
          label: function(context) {
            const label = context.dataset.label || '';
            const value = context.parsed.y;
            if (value === null || value === undefined) {
              return `${label}: データなし`;
            }
            return `${label}: ${Number(value).toFixed(1)}`;
          },
        },
      },
    },
    scales: {
      x: {
        display: true,
        title: {
          display: false,
        },
        grid: {
          display: false,
          drawBorder: false,
        },
        ticks: {
          font: {
            size: 11,
          },
          color: '#6B7280',
          // 5年ごとに表示
          callback: function(value, index) {
            return index % 5 === 4 ? this.getLabelForValue(value) : '';
          },
        },
      },
      y: {
        type: 'linear' as const,
        display: true,
        position: 'left' as const,
        title: {
          display: true,
          text: '(万円)',
          font: {
            size: 12,
            weight: 'normal',
          },
        },
        grid: {
          color: 'rgba(229, 231, 235, 1)', // gray-200
          lineWidth: 1,
          drawBorder: false,
        },
        ticks: {
          callback: function(value) {
            return value.toLocaleString();
          },
          font: {
            size: 11,
          },
          color: '#6B7280',
        },
      },
      y1: {
        type: 'linear' as const,
        display: true,
        position: 'right' as const,
        title: {
          display: true,
          text: '(万円)',
          font: {
            size: 12,
            weight: 'normal',
          },
        },
        grid: {
          drawOnChartArea: false,
          color: 'rgba(229, 231, 235, 1)',
          lineWidth: 1,
          drawBorder: false,
        },
        ticks: {
          callback: function(value) {
            return value.toLocaleString();
          },
          font: {
            size: 11,
          },
          color: '#6B7280',
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
        <Chart type='bar' data={chartData} options={options} />
      </div>
    </div>
  );
};

export default CashFlowChart;