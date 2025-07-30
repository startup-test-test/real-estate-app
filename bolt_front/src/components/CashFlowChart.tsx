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
  selfFunding?: number; // 自己資金（万円）
}

const CashFlowChart: React.FC<CashFlowChartProps> = ({ data }) => {
  if (!data || data.length === 0) {
    return null;
  }

  // データを準備（null/undefined チェック付き）
  const years = data.map((_, index) => `${index + 1}年`);
  
  // 累計CF
  const cumulativeCashFlowBar = data.map((row) => {
    return (row['累計CF'] || 0) / 10000;
  });
  
  // 売却による純利益（売却時累計CF - 累計CF）
  const saleNetProfit = data.map((row) => {
    const cumCF = (row['累計CF'] || 0) / 10000;
    const saleCumCF = (row['売却時累計CF'] || 0) / 10000;
    return saleCumCF - cumCF;
  });
  
  // 売却時累計CF（線グラフ用）
  const saleCumulativeCF = data.map(row => (row['売却時累計CF'] || 0) / 10000);
  
  // 借入残高（線グラフ用）- 既に万円単位で返されるため変換不要、負の値は0にする
  const loanBalance = data.map(row => Math.max(0, row['借入残高'] || 0));
  
  // デバッグ用ログ（最初の3行のみ）
  data.slice(0, 3).forEach((row, index) => {
    const cumCF = (row['累計CF'] || 0) / 10000;
    const saleCumCF = (row['売却時累計CF'] || 0) / 10000;
    const profit = saleCumCF - cumCF;
    const loanBal = row['借入残高'] || 0;
    console.log(`${index + 1}年目: 累計CF=${cumCF}, 売却時累計CF=${saleCumCF}, 売却による純利益=${profit}, 借入残高=${loanBal}`);
  });

  const chartData = {
    labels: years,
    datasets: [
      {
        type: 'bar' as const,
        label: '①累計CF',
        data: cumulativeCashFlowBar,
        backgroundColor: 'rgba(139, 92, 246, 0.6)', // 紫系
        borderColor: 'rgba(139, 92, 246, 0)',
        borderWidth: 0,
        yAxisID: 'y',
        stack: 'Stack 0',
      },
      {
        type: 'bar' as const,
        label: '②売却による純利益',
        data: saleNetProfit,
        backgroundColor: 'rgba(59, 130, 246, 0.6)', // 青系
        borderColor: 'rgba(59, 130, 246, 0)',
        borderWidth: 0,
        yAxisID: 'y',
        stack: 'Stack 0',
      },
      {
        type: 'line' as const,
        label: '③売却時累計CF（①＋②）',
        data: saleCumulativeCF,
        borderColor: 'rgb(236, 72, 153)', // ピンク系
        backgroundColor: 'transparent',
        borderWidth: 3,
        pointRadius: 4,
        pointBackgroundColor: 'rgb(236, 72, 153)',
        pointBorderColor: '#fff',
        pointBorderWidth: 2,
        pointHoverRadius: 6,
        yAxisID: 'y',
        tension: 0,
      },
      {
        type: 'line' as const,
        label: '借入残高',
        data: loanBalance,
        borderColor: 'rgb(31, 41, 55)', // 黒系（gray-800）
        backgroundColor: 'transparent',
        borderWidth: 2,
        borderDash: [5, 5], // 破線
        pointRadius: 0,
        pointHoverRadius: 4,
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
            size: 16,
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
          title: function(tooltipItems) {
            return tooltipItems[0].label;
          },
          label: function(context) {
            const label = context.dataset.label || '';
            const value = context.parsed.y;
            if (value === null || value === undefined) {
              return `${label}: データなし`;
            }
            return `${label}: ${Number(value).toLocaleString()}万円`;
          },
          afterBody: function(tooltipItems) {
            const index = tooltipItems[0].dataIndex;
            const yearData = data[index];
            const items = [];
            
            // 大規模修繕がある場合
            const majorRepair = (yearData['初期リフォーム'] || 0) + (yearData['大規模修繕'] || 0);
            if (majorRepair > 0) {
              items.push(`⚠️ 修繕費: ${(majorRepair / 10000).toLocaleString()}万円`);
            }
            
            return items;
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
        ticks: {
          font: {
            size: 14,
          },
          color: '#6B7280',
          // 5年ごとに表示（1年目、5年目、10年目...）
          callback: function(value: any, index: number) {
            if (index === 0 || (index + 1) % 5 === 0) {
              return this.getLabelForValue(value as number);
            }
            return '';
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
        },
        ticks: {
          callback: function(value) {
            return value.toLocaleString();
          },
          font: {
            size: 14,
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