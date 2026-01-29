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
import { CashFlowData } from '@/types/simulation';

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

interface CFSimpleChartProps {
  data: CashFlowData[];
}

const CFSimpleChart: React.FC<CFSimpleChartProps> = ({ data }) => {
  if (!data || data.length === 0) {
    return null;
  }

  // データを準備
  const years = data.map((_, index) => `${index + 1}年`);

  // 累計CF（万円単位）
  const cumulativeCashFlow = data.map((row) => {
    return (row['累計CF'] || 0) / 10000;
  });

  // 借入残高（既に万円単位）
  const loanBalance = data.map(row => Math.max(0, row['借入残高'] || 0));

  // SP版の判定 - 印刷時は常にPC版として扱う
  const [isMobile, setIsMobile] = React.useState(false);

  React.useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth < 768 && !window.matchMedia('print').matches;
      setIsMobile(mobile);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);

    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const chartData = {
    labels: years,
    datasets: [
      {
        type: 'bar' as const,
        label: '累計CF',
        data: cumulativeCashFlow,
        backgroundColor: 'rgba(59, 130, 246, 0.6)', // 青系
        borderColor: 'rgba(59, 130, 246, 0)',
        borderWidth: 0,
        yAxisID: 'y',
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

  const options: ChartOptions<'bar' | 'line'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: true,
        position: 'top' as const,
        align: 'center' as const,
        labels: {
          usePointStyle: false,
          padding: 10,
          boxWidth: isMobile ? 35 : 30,
          boxHeight: 2,
          font: {
            size: isMobile ? 16 : 12,
            weight: 'normal',
            family: 'system-ui, -apple-system, sans-serif',
          },
          color: '#374151',
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
            return `${label}: ${Number(value).toFixed(1)}万円`;
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
          callback: function(value: string | number, index: number) {
            if (isMobile) {
              return this.getLabelForValue(value as number);
            } else {
              if (index === 0 || (index + 1) % 5 === 0) {
                return this.getLabelForValue(value as number);
              }
              return '';
            }
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
          color: 'rgba(229, 231, 235, 1)',
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
    <div className="bg-white md:p-6 p-4 md:rounded-lg md:border md:border-gray-200 md:shadow-sm chart-container print:p-1 print:border-0 print:mb-1">
      {/* SP版のみスワイプ案内を表示 */}
      {isMobile && (
        <div className="text-center text-sm text-gray-500 mb-2 print:hidden">
          ← スワイプで全期間を確認 →
        </div>
      )}
      <div className={isMobile ? "overflow-x-auto -mx-4 px-4 print:overflow-visible print:mx-0 print:px-0 print:w-full" : "w-full"}>
        <div className={isMobile ? "h-80 min-w-[1200px] print:h-48 print:w-full print:min-w-0" : "h-96 w-full print:h-48"}>
          <Chart type='bar' data={chartData} options={options} />
        </div>
      </div>
    </div>
  );
};

export default CFSimpleChart;
