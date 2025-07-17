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
import { CashFlowData } from '../types';

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

interface CashFlowChartProps {
  data: CashFlowData[];
}

const CashFlowChart: React.FC<CashFlowChartProps> = ({ data }) => {
  if (!data || data.length === 0) {
    return null;
  }

  // データを準備（null/undefined チェック付き）
  const years = data.map(row => row['年次'] || '0年目');
  const annualCashFlow = data.map(row => (row['営業CF'] || 0) / 10000); // 万円単位
  const cumulativeCashFlow = data.map(row => (row['累計CF'] || 0) / 10000); // 万円単位
  const income = data.map(row => (row['実効収入'] || 0) / 10000); // 万円単位
  const expenses = data.map(row => 
    ((row['経費'] || 0) + (row['大規模修繕'] || 0) + (row['ローン返済'] || 0)) / 10000
  ); // 万円単位
  const saleProfit = data.map(row => (row['売却益'] || 0) / 10000); // 万円単位

  const chartData = {
    labels: years,
    datasets: [
      {
        type: 'bar' as const,
        label: '💰 年次キャッシュフロー',
        data: annualCashFlow,
        backgroundColor: 'rgba(34, 197, 94, 0.8)', // green-500 より鮮明
        borderColor: 'rgb(22, 163, 74)',
        borderWidth: 2,
        yAxisID: 'y',
      },
      {
        type: 'line' as const,
        label: '📈 累計キャッシュフロー',
        data: cumulativeCashFlow,
        borderColor: 'rgb(220, 38, 127)', // pink-600 より目立つ色
        backgroundColor: 'rgba(220, 38, 127, 0.1)',
        borderWidth: 4,
        pointBackgroundColor: 'rgb(220, 38, 127)',
        pointBorderColor: 'rgb(255, 255, 255)',
        pointBorderWidth: 3,
        pointRadius: 6,
        pointHoverRadius: 8,
        fill: false,
        yAxisID: 'y1',
        tension: 0.2, // 線をなめらかに
      },
      {
        type: 'line' as const,
        label: '💰 売却益',
        data: saleProfit,
        borderColor: 'rgb(147, 51, 234)', // purple-600 売却益は紫系
        backgroundColor: 'rgba(147, 51, 234, 0.1)',
        borderWidth: 4,
        pointBackgroundColor: 'rgb(147, 51, 234)',
        pointBorderColor: 'rgb(255, 255, 255)',
        pointBorderWidth: 3,
        pointRadius: 6,
        pointHoverRadius: 8,
        fill: false,
        yAxisID: 'y1',
        tension: 0.2,
      },
      {
        type: 'bar' as const,
        label: '💵 実効収入',
        data: income,
        backgroundColor: 'rgba(59, 130, 246, 0.6)', // blue-500 収入は青系
        borderColor: 'rgb(37, 99, 235)',
        borderWidth: 2,
        yAxisID: 'y',
      },
      {
        type: 'bar' as const,
        label: '💸 総支出',
        data: expenses,
        backgroundColor: 'rgba(239, 68, 68, 0.6)', // red-500 支出は赤系
        borderColor: 'rgb(220, 38, 38)',
        borderWidth: 2,
        yAxisID: 'y',
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
        align: 'start' as const,
        labels: {
          usePointStyle: true,
          pointStyle: 'rectRounded',
          padding: 25,
          boxWidth: 15,
          boxHeight: 15,
          font: {
            size: 13,
            weight: '600',
            family: 'system-ui, -apple-system, sans-serif',
          },
          color: '#374151', // gray-700
          generateLabels: function(chart) {
            const datasets = chart.data.datasets;
            return datasets.map((dataset, i) => ({
              text: dataset.label,
              fillStyle: dataset.backgroundColor,
              strokeStyle: dataset.borderColor,
              lineWidth: dataset.borderWidth,
              pointStyle: dataset.type === 'line' ? 'line' : 'rect',
              hidden: !chart.isDatasetVisible(i),
              datasetIndex: i
            }));
          },
        },
        onClick: function(e, legendItem, legend) {
          const index = legendItem.datasetIndex;
          const chart = legend.chart;
          const meta = chart.getDatasetMeta(index);
          meta.hidden = meta.hidden === null ? !chart.data.datasets[index].hidden : null;
          chart.update();
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
        },
      },
      y: {
        type: 'linear' as const,
        display: true,
        position: 'left' as const,
        title: {
          display: false,
        },
        grid: {
          color: 'rgba(156, 163, 175, 0.3)', // gray-400 with opacity
          lineWidth: 1,
        },
        ticks: {
          callback: function(value) {
            return `${Number(value).toFixed(1)}`;
          },
        },
      },
      y1: {
        type: 'linear' as const,
        display: true,
        position: 'right' as const,
        title: {
          display: false,
        },
        grid: {
          drawOnChartArea: false,
          color: 'rgba(156, 163, 175, 0.3)',
          lineWidth: 1,
        },
        ticks: {
          callback: function(value) {
            return `${Number(value).toFixed(1)}`;
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
    </div>
  );
};

export default CashFlowChart;